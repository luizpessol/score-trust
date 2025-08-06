# Score Trust – Frontend + SDK

Este repositório contém a versão pública do frontend e SDK utilizados no MVP da plataforma **Score Trust**, com foco na verificação de identidade de usuários a partir de dados do navegador e device fingerprint. Essa solução é ideal para simulações, POCs e ambientes de demonstração, sendo hospedada em um bucket S3 público.

---

## 🌐 Frontend

### 🔧 Tecnologias

- HTML5 + CSS3
- JavaScript (vanilla)
- SDK externo (`sdk.js`)
- Hospedagem via Amazon S3
- Backend de risco em AWS API Gateway + Lambda

### 🖼️ Layout

Interface dividida em duas colunas:
- Lado esquerdo: formulário com campo de e-mail e botão
- Lado direito: imagem ilustrativa
- Responsivo para dispositivos móveis

---

## 📦 SDK – `sdk.js`

### ✨ Principais Funções

#### `generateDeviceHash()`

Gera uma hash SHA-256 única com base em:
- `userAgent`
- `language`
- `screen resolution`
- `timezone`

#### `sendRiskPayload(email)`

- Monta o payload com:
```json
{
  "email": "usuario@dominio.com",
  "device_name": "...",
  "user_agent": "...",
  "language": "...",
  "timezone": "...",
  "device_hash": "..."
}
```
- Envia para:
  ```
  https://gepy93264h.execute-api.us-east-1.amazonaws.com/prod/identity/verify
  ```
- Exibe `score` e `action` via `alert()`

---

## ⚙️ Fluxo da Aplicação

1. Usuário digita o e-mail e clica em **"Verificar Identidade"**
2. Coleta automática de dados do navegador
3. Envio de requisição POST com payload JSON
4. API responde com `score` e `action`
5. Resultado exibido para o usuário

---

## 📁 Estrutura dos Arquivos

```
/
├── index.html       # Página principal com formulário de login simulado
├── sdk.js           # Script que coleta dados e envia para o backend
├── favicon.ico      # Ícone da aba do navegador
```

---

## 🚀 Publicação no S3

1. Criar bucket S3 com acesso público
2. Ativar static website hosting
3. Enviar os arquivos
4. Definir `index.html` como página inicial

---

## 📄 Licença

Uso interno e demonstração. Para uso comercial, consulte a equipe do projeto Score Trust.

---
