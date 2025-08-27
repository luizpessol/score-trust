# 📊 Dashboard - Backend Documenção

Este documento descreve a arquitetura, as APIs e as funções Lambda que compõem o backend da *ScoreTrust Dashboard*. O sistema foi projetado com foco em segurança, escalabilidade e facilidade de manutenção.

---

## 📐 Arquitetura Geral

```
Frontend (Dashboard)
    ⬇️ REST
AWS API Gateway
    ⬇️ Invoke
AWS Lambda (getRiskEvents / risk-admin-api)
    ⬇️ Query
DynamoDB (RiskEvents, ScoringRules, RuleWeights)
```

---

## 🔍 API 1: `RiskEventsAPI`
### ➕ Finalidade
Permite a consulta de eventos de risco armazenados na tabela `RiskEvents`, com filtros dinâmicos via query string.

### 📌 Endpoint
```
GET https://rxche3i5a1.execute-api.us-east-1.amazonaws.com/prod/getRiskEvents
```

### ✅ Parâmetros de Filtro (queryString)
- `limit` (padrão: 50): número máximo de eventos retornados.
- `nextToken`: token de continuação para paginação.
- `email`: filtra por e-mail do usuário.
- `score_min`: filtra por score mínimo.
- `from_date`: ISO8601, retorna eventos a partir dessa data.
- `country`: filtra por país.
- `action`: filtra por ação (e.g. allow, deny, review).

### 🧠 Lambda: `getRiskEvents`
Responsável por:
- Construir filtros dinamicamente
- Paginar resultados via `ExclusiveStartKey`
- Ordenar por `timestamp` decrescente
- Tratar `Decimal` para serialização JSON

### 🖥️ Exemplo de resposta
```json
{
  "data": [...],
  "count": 50,
  "nextToken": "...",
  "filters": {
    "limit": 50,
    "email": "user@exemplo.com",
    "score_min": 40
  },
  "version": "v1"
}
```

---

## 🛠️ API 2: `risk-admin-api`
### ➕ Finalidade
Permite gerenciar as regras de pontuação (`ScoringRules`) e os pesos (`RuleWeights`) usados pelo sistema de risco.

### 📌 Endpoints
- `GET /getScoringRules`
- `PUT /updateScoringRule`
- `GET /getRuleWeights`
- `PUT /updateRuleWeight`

### 🌐 URLs completas
```
GET  https://r4pfny9sp0.execute-api.us-east-1.amazonaws.com/prod/getScoringRules
PUT  https://r4pfny9sp0.execute-api.us-east-1.amazonaws.com/prod/updateScoringRule
GET  https://r4pfny9sp0.execute-api.us-east-1.amazonaws.com/prod/getRuleWeights
PUT  https://r4pfny9sp0.execute-api.us-east-1.amazonaws.com/prod/updateRuleWeight
```

### 🧠 Lambda: `risk-admin-api`
Responsável por:
- Roteamento baseado em `path` e `httpMethod`
- Atualização atômica das regras (`update_item`)
- Leitura completa (`scan`) com tratamento de `Decimal`

### 📝 Estrutura esperada para PUT
#### updateScoringRule
```json
{
  "id": "rule-login",
  "min": 0,
  "max": 30,
  "action": "allow"
}
```
#### updateRuleWeight
```json
{
  "rule_id": "rule-login",
  "peso": 25
}
```

---

## 🗄️ Tabelas DynamoDB
### `RiskEvents`
Armazena os eventos gerados pela API SDK com informações como IP, score, país, dispositivo, etc.

### `ScoringRules`
Contém a faixa de score (min/max) e ação correspondente (allow, review, deny).

### `RuleWeights`
Define o peso (influência) de cada regra para cálculo dinâmico do score final.

---

## 🚀 Observações Técnicas
- Todos os dados `Decimal` do DynamoDB são convertidos para `int` ou `float` para serialização JSON.
- A versão atual da API é `v1`, com possibilidade de evoluir futuramente.
- Permissões da Lambda devem incluir acesso às tabelas via política IAM.

---

## 🔒 Segurança
- Ambas as APIs devem ser protegidas via Cognito ou API Key no ambiente de produção.
- O backend implementa CORS com `Access-Control-Allow-Origin: *` por padrão.

---

## 🧪 Testes via Insomnia/Postman
- Para requisições GET com filtros, envie via query string.
- Para PUTs, envie JSON no body da requisição com `Content-Type: application/json`

---

## 👨‍💻 Autor
`Desenvolvido por:` Adrian Wicke, Ana Carolina, Camille, Demetrio Paszko e Luiz Pessol.

---

## 📄 Licença

Uso interno e demonstração. Para uso comercial, consulte a equipe do projeto Score Trust.

--- 
