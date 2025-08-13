import boto3
import json
import os
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
rules_table = dynamodb.Table('ScoringRules')
weights_table = dynamodb.Table('RuleWeights')

def convert_decimal(obj):
    if isinstance(obj, list):
        return [convert_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj)
    else:
        return obj

def lambda_handler(event, context):
    path = event.get("resource", "")
    method = event.get("httpMethod", "")
    body = event.get("body")
    if body and isinstance(body, str):
        body = json.loads(body)

    if path == "/getScoringRules" and method == "GET":
        return get_scoring_rules()
    elif path == "/updateScoringRule" and method == "PUT":
        return update_scoring_rule(body)
    elif path == "/getRuleWeights" and method == "GET":
        return get_rule_weights()
    elif path == "/updateRuleWeight" and method == "PUT":
        return update_rule_weight(body)
    else:
        return {
            "statusCode": 404,
            "body": json.dumps({"error": "Rota não encontrada"})
        }

def get_scoring_rules():
    try:
        response = rules_table.scan()
        return {
            "statusCode": 200,
            "body": json.dumps({"data": convert_decimal(response.get("Items", []))})
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

def update_scoring_rule(data):
    try:
        rule_id = data["id"]
        rules_table.update_item(
            Key={"id": rule_id},
            UpdateExpression="SET #min = :min, #max = :max, #action = :action",
            ExpressionAttributeNames={
                "#min": "min",
                "#max": "max",
                "#action": "action"
            },
            ExpressionAttributeValues={
                ":min": int(data["min"]),
                ":max": int(data["max"]),
                ":action": data["action"]
            }
        )
        return {"statusCode": 200, "body": json.dumps({"message": "Regra atualizada"})}
    except Exception as e:
        return {"statusCode": 400, "body": json.dumps({"error": str(e)})}

def get_rule_weights():
    try:
        response = weights_table.scan()
        return {
            "statusCode": 200,
            "body": json.dumps({"data": convert_decimal(response.get("Items", []))})
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

def update_rule_weight(data):
    try:
        rule_id = data["rule_id"]
        weights_table.update_item(
            Key={"rule_id": rule_id},
            UpdateExpression="SET #peso = :peso",
            ExpressionAttributeNames={"#peso": "peso"},
            ExpressionAttributeValues={":peso": int(data["peso"])}
        )
        return {"statusCode": 200, "body": json.dumps({"message": "Peso atualizado"})}
    except Exception as e:
        return {"statusCode": 400, "body": json.dumps({"error": str(e)})}


