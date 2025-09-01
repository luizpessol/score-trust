# 📦 ScoreTrust SDK.js

Este SDK fornece duas funções principais para coleta de sinais do navegador e envio de payload de risco para a API **ScoreTrust**. 🔐

## ⚙️ Funções

### 🔑 `generateDeviceHash()`
Gera um hash determinístico do dispositivo baseado em:  
- 🖥️ **userAgent** (navegador)  
- 🌐 **language** (idioma do navegador)  
- 📏 **screenSize** (resolução da tela)  
- 🕒 **timezone** (fuso horário)  

**Uso:**
```javascript
const hash = await generateDeviceHash();
console.log(hash); // string SHA-256 em hexadecimal
```

---

### 📤 `sendRiskPayload(email)`
Monta um payload com dados do navegador e envia para o endpoint de verificação da API **ScoreTrust**.

- **Endpoint:** `POST https://api.score-trust.com/identity/verify`  
- **Headers obrigatórios:**  
  - 📝 `Content-Type: application/json`  
  - 🔑 `x-api-key: <SUA_API_KEY>`  

**Payload enviado:**
```json
{
  "email": "usuario@example.com",
  "device_name": "<User-Agent>",
  "user_agent": "<User-Agent>",
  "language": "pt-BR",
  "timezone": "America/Sao_Paulo",
  "device_hash": "<hash SHA-256>"
}
```

**Exemplo de uso:**
```javascript
const result = await sendRiskPayload("usuario@example.com");

if (result.action === "allow") {
  ✅ // Permitir fluxo normal
} else if (result.action === "review") {
  🔎 // Solicitar validação adicional (ex.: selfie)
} else if (result.action === "deny") {
  ⛔ // Bloquear ou alertar
}

console.log(result);
```

---

## 📌 Observações
- ⚠️ O SDK atualmente usa `alert()` tanto em sucesso quanto em erro. Substitua por handlers próprios no seu app.  
- 🔒 A `x-api-key` **não deve** ser exposta em produção. Prefira validar no backend ou usar um proxy seguro.  
- 🌍 Habilite **CORS** no API Gateway para permitir chamadas do navegador.
