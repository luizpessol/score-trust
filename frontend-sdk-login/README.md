📘 Documentação Técnica – Score Trust (Frontend + SDK)
🔎 Visão Geral
Esta é a versão pública do Score Trust SDK + Frontend hospedada em um bucket S3. Ela simula um fluxo de login em uma loja virtual (NexShop), coleta dados do navegador e envia um payload para o backend de verificação de risco via REST API.

🌐 Frontend
🛠️ Stack
HTML5 + CSS3 (inline)

JavaScript (vanilla)

SDK externo: sdk.js

Hospedagem: Amazon S3 (modo público)

Backend de risco: AWS API Gateway + Lambda (endpoint público)

🖼️ Interface
A interface é responsiva e tem um layout dividido em duas colunas:

Esquerda (formulário):

Campo de e-mail

Botão de “Verificar Identidade”

Direita (imagem ilustrativa):

Fundo com imagem externa do Unsplash

📂 Arquivos
index.html – Página principal com UI e script de controle

sdk.js – SDK embutido que coleta dados e envia para a API de risco

favicon.ico – Ícone do site

📦 SDK – sdk.js
📋 Funções principais
🔐 generateDeviceHash()
Coleta:

userAgent

language

screenSize

timezone

Gera um hash SHA-256 único para o dispositivo

📡 sendRiskPayload(email)
Monta um payload com:

json
Copiar
Editar
'''
{
  "email": "usuario@dominio.com",
  "device_name": "...",
  "user_agent": "...",
  "language": "pt-BR",
  "timezone": "America/Sao_Paulo",
  "device_hash": "HASH"
}
'''
Envia para:

bash
Copiar
Editar
https://gepy93264h.execute-api.us-east-1.amazonaws.com/prod/identity/verify
Exibe alerta com o resultado:

✅ allow, review ou deny

🔢 score

⚠️ Tratamento de Erros
Mostra alertas em caso de:

Falha HTTP

Problemas de CORS

Erro de rede

⚙️ Fluxo de Execução
Usuário digita e-mail e clica em "Verificar Identidade"

Chama sendRiskPayload(email)

SDK coleta os dados automaticamente

Payload é enviado via fetch() com Content-Type: application/json

Backend retorna score e action

Exibe resultado na tela via alert()

📌 Observações Técnicas
Nenhuma dependência externa além da Web Crypto API (crypto.subtle)

Funciona em browsers modernos com suporte a fetch, crypto, Intl

A hash do dispositivo ajuda na identificação sem cookies

Ideal para MVPs ou PoCs

Pode ser facilmente embutido em sites de terceiros
