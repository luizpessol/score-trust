# 📌 Documentação Técnica dos Backends (AWS Lambda - Python)

Este repositório contém os backends do projeto **Score Trust**, implementados em **AWS Lambda** utilizando **Python 3.x** e integrados ao **Amazon API Gateway** e **DynamoDB**.

Os módulos principais são:
- 🔹 [RiskEngineEvaluate](#riskengineevaluate) → Motor de cálculo de risco em tempo real.
- 🔹 [getRiskEvents](#getriskevents) → Consulta de eventos armazenados.
- 🔹 [risk-admin-api](#risk-admin-api) → Administração de regras e pesos dinâmicos.

---

## ⚙️ Arquitetura Geral

```
SDK.js (frontend/app) 
     ↓
API Gateway (custom domain + WAF)
     ↓
Lambdas Python:
   • RiskEngineEvaluate_v0_1
   • getRiskEvents
   • risk-admin-api
     ↓
DynamoDB Tables:
   • RiskEvents
   • ScoringRules
   • RuleWeights
   • KnownDevices
```

- **AbuseIPDB API** é usada para reputação de IPs.
- **DynamoDB TTL** Eventos antigos automaticamente 90 dias.
- **Eventos** são registrados em tempo real e podem ser filtrados via API.

---

## 🚀 Backends

### 1️⃣ RiskEngineEvaluate
Arquivo: `RiskEngineEvaluate_v0_1.py`

- **Responsável por:** Calcular o score de risco e registrar o evento.
- **Integrações:**
  - DynamoDB (`RiskEvents`, `ScoringRules`, `RuleWeights`, `KnownDevices`)
  - AbuseIPDB (verificação de reputação de IPs)
- **Principais verificações:**
  - Dispositivo conhecido x desconhecido
  - Timezone esperado (`America/Sao_Paulo`, `America/Buenos_Aires`)
  - Idioma (`pt-*`)
  - User Agent suspeito (headless browsers)
  - Reputação do IP (AbuseIPDB)
  - País de origem (≠ BR penalizado)

**Retorno (JSON):**
```json
{
  "score": 65,
  "action": "REVIEW",
  "reason": [
    "Dispositivo não reconhecido",
    "IP com reputação ruim no AbuseIPDB"
  ]
}
```

---

### 2️⃣ getRiskEvents
Arquivo: `getRiskEvents.py`

- **Responsável por:** Consultar os eventos gravados em `RiskEvents`.
- **Filtros suportados (query params):**
  - `limit` → número máximo de registros (default: 50)
  - `nextToken` → paginação
  - `email` → filtrar por usuário
  - `score_min` → filtrar score mínimo
  - `from_date` → filtrar eventos a partir de data (ISO8601)
  - `country` → filtrar por país
  - `action` → filtrar por ação tomada

**Exemplo de chamada:**
```
GET /getRiskEvents?email=user@test.com&score_min=50&action=DENY
```

**Retorno (JSON):**
```json
{
  "data": [...],
  "count": 20,
  "nextToken": null,
  "filters": {
    "limit": 50,
    "email": "user@test.com",
    "score_min": 50,
    "from_date": null,
    "country": null,
    "action": "DENY"
  },
  "version": "v1"
}
```

---

### 3️⃣ risk-admin-api
Arquivo: `risk-admin-api.py`

- **Responsável por:** Gerenciar as regras e pesos de pontuação de risco.
- **Endpoints:**
  - `GET /getScoringRules` → lista regras de score
  - `PUT /updateScoringRule` → atualiza regra existente
  - `GET /getRuleWeights` → lista pesos das regras
  - `PUT /updateRuleWeight` → atualiza peso de uma regra

**Exemplo - Atualizar peso de regra:**
```
PUT /updateRuleWeight
{
  "rule_id": "device_unknown",
  "peso": 20
}
```

**Resposta:**
```json
{ "message": "Peso atualizado" }
```

## 🗄️ Tabelas DynamoDB
### `KnownDevices`
Faz o armazenamento dos hashs de devices conhecidos para um próximo evento, devices não conhecidos recebem 30 pontos.

### `RiskEvents`
Armazena os eventos gerados pela API SDK com informações como IP, score, país, dispositivo, etc.

### `ScoringRules`
Contém a faixa de score (min/max) e ação correspondente (allow, review, deny).

### `RuleWeights`
Define o peso (influência) de cada regra para cálculo dinâmico do score final.

---

## 🛠️ Requisitos Técnicos

- **Python:** 3.9+
- **Dependências AWS:** 
  - boto3
- **Variáveis de Ambiente:**
  - `ABUSEIPDB_API_KEY` → chave da API para reputação de IPs

---

## 📑 Boas Práticas e Observações

- Todos os retornos seguem o padrão JSON com `statusCode`.
- Logs de erro são enviados para **CloudWatch**.
- Permissões de IAM devem ser configuradas para:
  - Leitura/Escrita nas tabelas `RiskEvents`, `ScoringRules`, `RuleWeights`, `KnownDevices`.
  - Acesso à API externa (AbuseIPDB).
- Regras e pesos são dinâmicos, facilitando ajustes sem alterar código.

---

## 🔒 Segurança
- Ambas as APIs devem ser protegidas via Cognito ou API Key no ambiente de produção.
- O backend implementa CORS com `Access-Control-Allow-Origin: *` por padrão.
- Todo consumo das APIs estão passando por WAF - Web Application Firewall.
- Para consumo das APIs é necessário uma Key.
- A chave de consumo deve estar atrelada a um Plano de serviços: Free-Plan & Premium-Plan.
  - Free-Plan: 15 requisições por dia.
  - Premium-Plan: 1000 requisições por mês.

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
