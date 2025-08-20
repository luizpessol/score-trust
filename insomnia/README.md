# Utilizando o Insomnia com o arquivo `Insomnia.yaml`

Este guia descreve como importar e utilizar o arquivo de configuração do **Insomnia** para testar APIs do projeto **Score Trust**, incluindo testes de score de identidade, consulta de eventos de risco e administração de regras e pesos.

---

## 📋 Pré-requisitos

- **Insomnia** instalado  
  [Baixar aqui](https://insomnia.rest/download)  
- Arquivo `Insomnia.yaml` salvo localmente  
- Acesso aos endpoints da API (URLs, chaves ou autenticação necessária)

---

## 📥 1. Importando o arquivo no Insomnia

1. Abra o **Insomnia**
2. Vá em **Application → Import → From File**
3. Selecione o arquivo `Insomnia.yaml`
4. Os endpoints serão carregados automaticamente, organizados em pastas

---

## ⚙️ 2. Configurando variáveis de ambiente

Se houver variáveis como `{{base_url}}` ou `{{api_key}}`, configure-as:

1. Clique no **nome do workspace** → **Manage Environments**
2. Defina os valores:
   ```json
   {
     "base_url": "https://sua-api.com",
     "api_key": "SUA_CHAVE_DE_API"
   }
   ```
3. Salve

---

## 🚀 3. Endpoints disponíveis

### **1. RiskEngine – Testes de Score de Identidade**
> Todos enviam requisições `POST` para `/identity/verify`

| Nome | Método | URL |
|------|--------|-----|
| Teste 1 - Usuário Confiável (ALLOW) | POST | https://api.score-trust.com/identity/verify |
| Teste 2 - Usuário Suspeito (REVIEW) | POST | https://api.score-trust.com/identity/verify |
| Teste 3 - Usuário Muito Suspeito (DENY) | POST | https://api.score-trust.com/identity/verify |

**Payloads de exemplo:**

**Teste 1 - ALLOW**
```json
{ "email": "cliente@email.com", "device_name": "iPhone 14", "ip_address": "186.222.45.67", "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "timezone": "America/Sao_Paulo", "language": "pt-BR" }
```

**Teste 2 - REVIEW**
```json
{ "email": "suspeito@teste.com", "device_name": "Samsung Galaxy", "ip_address": "186.222.45.67", "user_agent": "Mozilla/5.0 (Linux; Android 10; SM-A107F)", "timezone": "America/Sao_Paulo", "language": "en-US" }
```

**Teste 3 - DENY**
```json
{ "email": "hacker@darkweb.com", "device_name": "UnknownDevice", "ip_address": "10.0.0.1", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) HeadlessChrome/99.0.4844.51", "timezone": "Europe/London", "language": "en-GB" }
```

---

### **2. API getRiskEvents – Consultas de eventos**
> Todos enviam requisições `GET` para `/getRiskEvents` com filtros

| Nome | Método | URL |
|------|--------|-----|
| Consulta eventos por email | GET | https://api.score-trust.com/getRiskEvents?limit=10&email=luizpessol@hotmail.com |
| Consulta eventos por score | GET | https://api.score-trust.com/getRiskEvents?limit=10&score_min=40 |
| Consulta eventos por data | GET | https://api.score-trust.com/getRiskEvents?limit=10&from_date=2025-08-01T00:00:00Z |
| Consulta eventos por País | GET | https://api.score-trust.com/getRiskEvents?limit=10&country=BR |
| Consulta eventos por ação | GET | https://api.score-trust.com/getRiskEvents?limit=10&action=REVIEW |

---

### **3. risk-admin-api – Administração de Regras e Pesos**

| Nome | Método | URL |
|------|--------|-----|
| Consulta Peso das Regras | GET | https://api.score-trust.com/getRuleWeights |
| Consulta valores das ações | GET | https://api.score-trust.com/getScoringRules |
| Atualiza peso das Regras | PUT | https://api.score-trust.com/updateRuleWeight |
| Atualiza os valores das ações | PUT | https://api.score-trust.com/updateScoringRule |

**Payloads de exemplo:**

**Atualiza peso das Regras**
```json
{ "rule_id": "timezone_inesperado", "peso": 20 }
```

**Atualiza os valores das ações**
```json
{ "id": "r2", "min": 31, "max": 75, "action": "REVIEW" }
```

---

## 🧪 4. Como testar

1. Escolha o endpoint desejado no Insomnia
2. Ajuste os parâmetros (query ou body)
3. Clique em **Send**
4. Analise a resposta no painel direito

---

## 📚 Referências

- [Documentação Insomnia](https://docs.insomnia.rest/)
- [AWS API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)

