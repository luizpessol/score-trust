import boto3
import json
from decimal import Decimal
from boto3.dynamodb.conditions import Attr
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('RiskEvents')

def convert_decimal(obj):
    if isinstance(obj, list):
        return [convert_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    else:
        return obj

def lambda_handler(event, context):
    try:
        params = event.get('queryStringParameters') or {}

        # Filtros da query string
        limit = int(params.get('limit', 50))
        next_token = params.get('nextToken')
        email = params.get('email')
        score_min = int(params.get('score_min', 0))
        from_date = params.get('from_date')
        country = params.get('country')
        action = params.get('action')

        scan_args = {
            'Limit': limit
        }

        # Token de continuação
        if next_token and next_token.lower() != "null":
            try:
                scan_args['ExclusiveStartKey'] = json.loads(next_token)
            except Exception:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"error": "nextToken inválido"})
                }

        # Filtros dinâmicos
        filter_expr = None

        def add_filter(cond):
            nonlocal filter_expr
            filter_expr = cond if filter_expr is None else filter_expr & cond

        if email:
            add_filter(Attr('email').eq(email))
        if score_min > 0:
            add_filter(Attr('score').gte(score_min))
        if country:
            add_filter(Attr('country').eq(country))
        if action:
            add_filter(Attr('action').eq(action))
        if from_date:
            try:
                dt = datetime.fromisoformat(from_date.replace("Z", "+00:00"))
                add_filter(Attr('timestamp').gte(dt.isoformat()))
            except Exception:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"error": "Formato inválido para 'from_date'. Use ISO 8601."})
                }

        if filter_expr:
            scan_args['FilterExpression'] = filter_expr

        response = table.scan(**scan_args)
        items = response.get('Items', [])
        last_key = response.get('LastEvaluatedKey')

        items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        result = {
            "data": convert_decimal(items),
            "count": len(items),
            "nextToken": json.dumps(last_key) if last_key else None,
            "filters": {
                "limit": limit,
                "email": email,
                "score_min": score_min,
                "from_date": from_date,
                "country": country,
                "action": action
            },
            "version": "v1"
        }

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps(result)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

teste
