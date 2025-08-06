# Score Trust

**Score Trust** é uma solução serverless de análise de risco em tempo real, desenvolvida para e-commerces que desejam mitigar fraudes no momento de login ou navegação sensível. A função principal é calcular um **risk score** com base em reputação de IP, características do dispositivo, idioma, timezone e outros sinais comportamentais, permitindo decisões automatizadas como: `ALLOW`, `REVIEW` ou `DENY`.

---

## 🧠 Como funciona?

1. O **e-commerce** utiliza um **SDK** para enviar dados do usuário para a API `/identity/verify`.
2. O tráfego passa pelo **AWS WAF**, segue para o **API Gateway** e é roteado para uma **função AWS Lambda**.
3. A Lambda calcula um score de risco com base em:
   - Reputação IP (via [AbuseIPDB](https://www.abuseipdb.com))
   - Dispositivo conhecido
   - Idioma e timezone
   - User-Agent suspeito
4. O score é armazenado no **DynamoDB** junto com os detalhes do evento.
5. A decisão (`ALLOW`, `REVIEW`, `DENY`) é enviada de volta ao cliente.
6. Administradores podem visualizar eventos na dashboard via `/getRiskEvents`.

---

## 🧩 Arquitetura

![Arquitetura - Score Trust](./56ace706-2c36-4967-aa67-901294bcf526.png)

### Principais componentes:

| Componente         | Função                                                                 |
|--------------------|------------------------------------------------------------------------|
| **E-commerce**     | Cliente que consome o SDK para análise de risco                        |
| **AWS WAF**        | Proteção contra ataques na borda                                       |
| **API Gateway**    | Expõe as rotas `/identity/verify` e `/getRiskEvents`                   |
| **Lambda**         | Lógica de cálculo e persistência do score                              |
| **DynamoDB**       | Armazena regras, pesos, dispositivos e eventos                         |
| **AbuseIPDB API**  | Verifica reputação de IPs públicos                                     |
| **Dashboard**      | Interface administrativa para consulta de eventos                      |

---

## 🧮 Cálculo do Score

A lógica de score considera diversos pesos configuráveis via tabela `RuleWeights`, e aplica regras mapeadas na tabela `ScoringRules`.

### Exemplos de critérios:
- Dispositivo não reconhecido
- Timezone não esperado (fora de `America/Sao_Paulo`, `America/Buenos_Aires`)
- Idioma não-PT
- User-Agent com headless/phantom
- IP com alto score no AbuseIPDB
- País diferente de BR

O score final é limitado a **100 pontos** e categorizado conforme o intervalo definido em `ScoringRules`.

---

## 🗃️ Estrutura das Tabelas (DynamoDB)

- `KnownDevices` — Dispositivos autorizados previamente
- `RiskEvents` — Log de todos os eventos com score, IP, e decisão
- `RuleWeights` — Pesos atribuídos a cada fator de risco
- `ScoringRules` — Mapeamento de score para ação (e.g. `0-30 = ALLOW`)

---

## 🧪 Exemplo de retorno da API

```json
{
  "score": 68,
  "action": "REVIEW",
  "reason": [
    "Dispositivo não reconhecido",
    "Timezone inesperado",
    "País de origem não é Brasil"
  ]
}

🔐 Segurança
Integração com WAF e validações na borda

Score configurável sem alterar o código (via DynamoDB)

TTL automático para eventos (7 dias por padrão)

Requisições limitadas ao SDK e Dashboard autenticados

🚀 Tecnologias Utilizadas
AWS Lambda

API Gateway

DynamoDB

AbuseIPDB (external API)

Python 3.x

SDK customizado (externo ao repositório)

📌 Observações
Este documentação é apenas da função de backend (score engine).

A solução foi desenhada para ser modular e expansível (ex: Face Liveness, reanálise, alertas).

🧭 Próximos Passos
Adicionar suporte a geolocalização e análises por dispositivo

Integração com serviços de notificação

Módulo de aprendizado contínuo para ajuste automático de pesos

👨‍💻 Autor
Desenvolvido por Adrian Wicke, Ana Carolina, Camille, Demetrio Paszko e Luiz Pessol. 
