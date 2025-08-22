import json
import uuid
import boto3
import os
import urllib.request
import urllib.error
import time
from datetime import datetime, timezone, timedelta

dynamodb = boto3.resource('dynamodb')
events_table = dynamodb.Table('RiskEvents')
rules_table = dynamodb.Table('ScoringRules')
devices_table = dynamodb.Table('KnownDevices')
weights_table = dynamodb.Table('RuleWeights')

ABUSEIPDB_API_KEY = os.environ.get("ABUSEIPDB_API_KEY", "")
ABUSEIPDB_API_URL = "https://api.abuseipdb.com/api/v2/check"

def is_valid_public_ip(ip):
    return not (
        ip.startswith("192.") or
        ip.startswith("10.") or
        ip.startswith("127.") or
        ip.startswith("169.254") or
        ip.startswith("172.")
    )

def check_ip_reputation(ip_address):
    try:
        req = urllib.request.Request(f"{ABUSEIPDB_API_URL}?ipAddress={ip_address}&maxAgeInDays=90")
        req.add_header("Key", ABUSEIPDB_API_KEY)
        req.add_header("Accept", "application/json")
        with urllib.request.urlopen(req) as res:
            result = json.loads(res.read().decode())
            data = result['data']
            return {
                "abuse_score": data.get("abuseConfidenceScore", 0),
                "country_code": data.get("countryCode", "ZZ")
            }
    except Exception:
        return {"abuse_score": 0, "country_code": "ZZ"}

def get_weight(rule_id):
    try:
        response = weights_table.get_item(Key={'rule_id': rule_id})
        item = response.get('Item')
        return int(item['peso']) if item else 0
    except Exception:
        return 0

def device_is_known(email, device_hash):
    try:
        response = devices_table.get_item(Key={'email': email, 'device_hash': device_hash})
        return 'Item' in response
    except Exception:
        return False

def register_known_device(email, device_hash, timestamp):
    try:
        devices_table.put_item(Item={
            "email": email,
            "device_hash": device_hash,
            "created_at": timestamp
        })
    except Exception:
        pass

def calculate_risk_score(payload, reputation, known_device):
    score = 0
    reasons = []

    if not known_device:
        score += get_weight("device_unknown")
        reasons.append("Dispositivo não reconhecido")
    else:
        score += get_weight("device_known")

    if payload.get('timezone') not in ['America/Sao_Paulo', 'America/Buenos_Aires']:
        score += get_weight("timezone_inesperado")
        reasons.append("Timezone inesperado")

    if not payload.get('language', '').startswith('pt'):
        score += get_weight("idioma_nao_pt")
        reasons.append("Idioma não típico detectado")

    user_agent = payload.get('user_agent', '').lower()
    if 'headless' in user_agent or 'phantom' in user_agent:
        score += get_weight("useragent_suspeito")
        reasons.append("User Agent suspeito (headless browser)")

    if reputation["abuse_score"] >= 50:
        score += get_weight("abuseipdb_alto")
        reasons.append("IP com reputação ruim no AbuseIPDB")

    if reputation["country_code"] != "BR":
        score += get_weight("pais_nao_br")
        reasons.append("País de origem não é Brasil")

    return min(score, 100), reasons

def get_action_by_score(score):
    try:
        response = rules_table.scan()
        rules = response.get("Items", [])
        for rule in rules:
            if rule["min"] <= score <= rule["max"]:
                return rule["action"]
        return "REVIEW"
    except Exception:
        return "REVIEW"

def lambda_handler(event, context):
    headers = event.get("headers", {}) or {}
    ip_address = headers.get("X-Forwarded-For", "").split(",")[0].strip() or "0.0.0.0"

    try:
        body_raw = event.get('body', '{}')
        if isinstance(body_raw, str):
            body = json.loads(body_raw)
        else:
            body = body_raw
    except Exception:
        body = {}

    email = body.get('email') or f"unknown_user@{uuid.uuid4()}"
    device_hash = body.get('device_hash', 'unknown')
    device_name = body.get('device_name', 'unknown_device')

    known = device_is_known(email, device_hash)
    reputation = check_ip_reputation(ip_address) if is_valid_public_ip(ip_address) else {
        "abuse_score": 0,
        "country_code": "ZZ"
    }

    score, reasons = calculate_risk_score(body, reputation, known)
    action = get_action_by_score(score)

    now = datetime.now(timezone.utc) - timedelta(hours=3)
    timestamp = now.isoformat()
    ttl = int(time.time()) + 60 * 60 * 24 * 7

    try:
        events_table.put_item(Item={
            "id": str(uuid.uuid4()),
            "email": email,
            "device_name": device_name,
            "ip_address": ip_address,
            "device_hash": device_hash,
            "score": score,
            "action": action,
            "reason": reasons,
            "country": reputation["country_code"],
            "abuse_score": reputation["abuse_score"],
            "timestamp": timestamp,
            "ttl": ttl
        })
    except Exception as e:
        print("Erro ao salvar no RiskEvents:", e)

    if not known:
        register_known_device(email, device_hash, timestamp)

    return {
        "statusCode": 200,
        "body": json.dumps({
            "score": score,
            "action": action,
            "reason": reasons
        }),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }

