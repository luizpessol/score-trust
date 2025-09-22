# 📌 Documentação Técnica dos Backends (AWS Lambda - Python)

Este repositório contém os backends do projeto **Score Trust**, implementados em **AWS Lambda** utilizando **Python 3.x** e integrados ao **Amazon API Gateway** e **DynamoDB**.

Os módulos principais são:
- 🔹 [RiskEngineEvaluate](#riskengineevaluate) → Motor de cálculo de risco em tempo real.
- 🔹 [getRiskEvents](#getriskevents) → Consulta de eventos armazenados.
- 🔹 [risk-admin-api](#risk-admin-api) → Administração de regras e pesos dinâmicos.
- 🔹 [faceVerify](#faceVerify) → Captura e envio da foto para verificação biométrica.

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
   • faceVerify
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

---

###4️⃣ faceVerify
Arquivo: `faceVericy.py`

Aqui se descreve o fluxo detalhado do **faceVerify** (Lambda de verificação biométrica por imagem) — do recebimento da requisição até a decisão final (**ALLOW** ou **DENY**), incluindo atualizações no **DynamoDB** e interações com **S3** e **Rekognition**.

---

## 1) Entrada, parse e validação

- Lê `event.body`, faz `json.loads(...)` e extrai `email` e `imageBase64`.
- Se faltar algum campo ou `imageBase64` for inválido → **HTTP 400** com erro claro.

---

## 2) Timestamps e TTL

- `timestamp_iso`: gera horário **local** (UTC-3 por padrão) para padronizar registros.
- `ttl_epoch`: ~**90 dias** para expiração automática do item no DynamoDB (boa prática de limpeza).

---

## 3) Contexto do evento pendente

1. `find_pending_review(email)`: faz **Scan** dos itens do usuário em **RiskEvents** e retorna o **último** item com:
   - `action = "REVIEW"`
   - `biometricRequired = True`
   - `biometricVerified = False`
   - `timestamp` dentro da janela `PENDING_LOOKBACK_MIN` (ex.: 60 minutos)
2. Se **não houver** pendência, `find_last_review_context(email)` pega o **último REVIEW**, mesmo que não esteja pendente, apenas para **herdar contexto** (`ip_address`, `device_hash`, etc.).


---

## 4) Checagem de “face base”

- Chave padrão da foto base no S3: `faces/{email}/base.jpg`.
- Se o evento pendente já possui `faceReferenceS3Key`, assume que **existe base**.
- Caso contrário, tenta `head_object` na chave `base.jpg` no S3.

### Caso A — **não existe base**

1. Salva a imagem recebida como **base** (`base.jpg`).
2. Se **há** `pending`:
   - Atualiza **o mesmo item** `REVIEW` em **RiskEvents**:
     - define `faceReferenceS3Key`
     - mantém `biometricRequired = True` e `biometricVerified = False`
     - atualiza `reason` para **"Base biométrica registrada; compare na próxima tentativa"**
3. Se **não há** `pending`:
   - Cria um **novo** item `REVIEW` com o contexto mínimo (o `score` usa `get_weight("face_biometricVerified")` como referência).
4. **Resposta 200**:
   ```json
   { "result": "face_registered" }
   ```

> ✅ **Ponto bacana**: registra a base **sem gastar uma comparação** — o usuário só valida **na próxima tentativa** (1ª captura **cadastra**, 2ª captura **valida**).

### Caso B — **já existe base**

1. Salva a imagem recebida como **compare** (`faces/{email}/compare-{timestamp}.jpg`).
2. Chama `rekognition.compare_faces` usando a `base.jpg` do S3 e a imagem recebida (bytes).
3. Lê `similarity` do primeiro match (ou `0.0` se não houver match).

**Decisão**:
- **ALLOW** se houve match ≥ `SIMILARITY_THRESHOLD`  
  → `reason = "Biometria validada com sucesso"`, `biometricRequired = False`, `biometricVerified = True`
- **DENY** se **não** bateu  
  → `reason = "Biometria falhou"`, `biometricRequired = True`, `biometricVerified = False`

---

## 5) Atualização do evento (**RiskEvents**)

- Se **havia `pending`**, **atualiza o mesmo item** (`update_item`), alterando:
  - `action` para `ALLOW` ou `DENY`
  - `faceCompareS3Key`, `biometricSimilarity`, flags `biometricRequired/biometricVerified`, `timestamp`
  - **Score**:
    - Se **ALLOW**: reduz o score aplicando `get_weight("face_biometricVerified")` (sem deixar negativo)
    - Se **DENY**: eleva o score para **mínimo 76** (valor **hardcoded** como “alto risco”)
  - **Contexto**: garante/herda `ip_address`, `device_hash`, `device_name`, `country`
- Se **não havia `pending`**, cria um **novo item** com ação final `ALLOW`/`DENY`, preenchendo campos e contexto (se existir).

> 💬 **Opinião**: a escolha de **não criar novo evento quando há pending** mantém a timeline limpa e compreensível. Para *edge cases* sem pending, criar um novo resolve bem.

---

## 6) Registro de dispositivo confiável (**KnownDevices**)

- Se a decisão for **ALLOW** e existir `device_hash`, inclui/atualiza em **KnownDevices**:
  - `email`, `device_hash`, `created_at`
- Benefício: permite **reconhecer** o dispositivo em futuras análises (melhor UX e redução de fricção).

---

## 7) Respostas — exemplos

### Base criada (primeira foto)
**HTTP 200**
```json
{ "result": "face_registered" }
```

### Comparação — sucesso
**HTTP 200**
```json
{
  "decision": "ALLOW",
  "similarity": 97.32,
  "reason": "Biometria validada com sucesso"
}
```

### Comparação — falha
**HTTP 200**
```json
{
  "decision": "DENY",
  "similarity": 0.0,
  "reason": "Biometria falhou"
}
```

### Erro inesperado
**HTTP 500**
```json
{ "error": "Internal Server Error" }
```

---

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
  - `Free-Plan:` 15 requisições por dia.
  - `Premium-Plan:` 1000 requisições por mês.

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
