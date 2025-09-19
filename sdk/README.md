# ScoreTrust SDK (Browser) – `sdk.js`

SDK JavaScript para **verificação de risco** e, quando aplicável, **biometria facial** no navegador.  
Ele coleta um *fingerprint* leve do dispositivo, chama o endpoint de verificação e, se a ação retornar `REVIEW`, inicia o fluxo de selfie no browser.

> Função principal exposta globalmente: `window.sendRiskPayload(email)`

## Sumário
- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Fluxo de execução](#fluxo-de-execução)
- [Endpoints e Payloads](#endpoints-e-payloads)
- [Exemplos de uso](#exemplos-de-uso)
  - [Exemplo A — PHP (proxy seguro no backend)](#exemplo-a--php-proxy-seguro-no-backend)
  - [Exemplo B — React (componente simples)](#exemplo-b--react-componente-simples)
  - [Exemplo C — HTML+CSS (puro, sem build)](#exemplo-c--htmlcss-puro-sem-build)
- [Respostas esperadas](#respostas-esperadas)
- [Boas práticas de segurança](#boas-práticas-de-segurança)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Roadmap sugerido](#roadmap-sugerido)
- [Licença](#licença)

---

## Visão Geral

- **Verificação de Risco** (`/identity/verify`): envia e-mail + *fingerprint* (UA, idioma, timezone, resolução, hash SHA-256) → recebe `action` (`ALLOW`, `DENY` ou `REVIEW`) e `score`.
- **Biometria Facial** (`/identity/face-verify`): quando `REVIEW`, o SDK solicita permissão da câmera, captura uma imagem (JPEG Base64) e envia ao backend para decisão de similaridade.

Tudo roda no **browser** com JavaScript puro, sem dependências externas.

---

## Pré-requisitos
- **HTTPS** (ou `localhost`) para uso da câmera (`getUserMedia`).
- **API Gateway** com **CORS** habilitado para o seu domínio.
- **API Key** válida (se o API Gateway exigir `x-api-key`). 
- Um **container** no HTML para a UI de biometria (ex.: `div#bio-container`).

---

## Instalação

Inclua o `sdk.js` em seu HTML (arquivo local ou CDN interno):

```html
<script src="/path/to/sdk.js"></script>
```

Depois, chame no seu código:

```html
<script>
  // Disponível em window
  window.sendRiskPayload("email@exemplo.com");
</script>
```

---

## Configuração

No topo do `sdk.js`, ajuste os endpoints conforme seu ambiente:

```js
const API_BASE        = "https://api.seu-dominio.com";    // ex.: API Gateway com domínio customizado
const VERIFY_URL      = `${API_BASE}/identity/verify`;
const FACE_VERIFY_URL = `${API_BASE}/identity/face-verify`;
const API_KEY         = "SUA_API_KEY_AQUI";               // evite deixar exposto em produção
```

> Produção: **não** faça commit da `API_KEY`. Injete por variável de ambiente/bundler ou, preferencialmente, chame via um **proxy no backend** (ver Exemplo A – PHP).

---

## Fluxo de execução

1. **Fingerprint:** `generateDeviceHash()` cria hash SHA-256 de `userAgent|language|screenSize|timezone`.
2. **/identity/verify:** `sendRiskPayload(email)` envia os dados + hash.
3. **Decisão:**
   - `ALLOW`/`DENY`: o SDK exibe uma notificação (padrão, via `alert` — você pode substituir por toasts).
   - `REVIEW`: SDK injeta um `<video>` e um botão **“Capturar e verificar”** no `#bio-container`.
4. **/identity/face-verify:** envia `email` + `imageBase64` (JPEG) e exibe `ACCEPT/REJECT` + similaridade.

---

## Endpoints e Payloads

### 1) Verificação de Risco — `POST /identity/verify`

**Headers**
```
Content-Type: application/json
x-api-key: <SUA_API_KEY>   // se o API exigir
```

**Body**
```json
{
  "email": "user@dominio.com",
  "device_name": "<navigator.userAgent>",
  "user_agent": "<navigator.userAgent>",
  "language": "pt-BR",
  "timezone": "America/Sao_Paulo",
  "device_hash": "sha256hex..."
}
```

### 2) Biometria Facial — `POST /identity/face-verify`

**Headers**
```
Content-Type: application/json
x-api-key: <SUA_API_KEY>   // se o API exigir
```

**Body**
```json
{
  "email": "user@dominio.com",
  "imageBase64": "<JPEG em base64, sem o prefixo data:>"
}
```

---

## Exemplos de uso

### Exemplo A — PHP (proxy seguro no backend)

> Recomendado para **produção**: o browser **não** fala direto com a API externa.  
> O frontend chama seu **proxy** (`/risk/verify` e `/risk/face-verify`) e o PHP injeta o `x-api-key` server-side.

**`public/verify.php`**
```php
<?php
// public/verify.php
// Proxy para POST /identity/verify

header('Content-Type: application/json');
$apiBase = getenv('API_BASE') ?: 'https://api.seu-dominio.com';
$apiKey  = getenv('API_KEY'); // defina no ambiente/servidor

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['email'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Payload inválido']);
  exit;
}

$ch = curl_init();
curl_setopt_array($ch, [
  CURLOPT_URL            => $apiBase . '/identity/verify',
  CURLOPT_POST           => true,
  CURLOPT_HTTPHEADER     => [
    'Content-Type: application/json',
    'x-api-key: ' . $apiKey
  ],
  CURLOPT_POSTFIELDS     => json_encode($input),
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT        => 15
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($response === false) {
  http_response_code(502);
  echo json_encode(['error' => 'Falha ao contatar serviço']);
  exit;
}

http_response_code($httpCode);
echo $response;
```

**`public/face-verify.php`**
```php
<?php
// public/face-verify.php
// Proxy para POST /identity/face-verify

header('Content-Type: application/json');
$apiBase = getenv('API_BASE') ?: 'https://api.seu-dominio.com';
$apiKey  = getenv('API_KEY');

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['email'], $input['imageBase64'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Payload inválido']);
  exit;
}

$ch = curl_init();
curl_setopt_array($ch, [
  CURLOPT_URL            => $apiBase . '/identity/face-verify',
  CURLOPT_POST           => true,
  CURLOPT_HTTPHEADER     => [
    'Content-Type: application/json',
    'x-api-key: ' . $apiKey
  ],
  CURLOPT_POSTFIELDS     => json_encode($input),
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT        => 20
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false) {
  http_response_code(502);
  echo json_encode(['error' => 'Falha ao contatar serviço']);
  exit;
}

http_response_code($httpCode);
echo $response;
```

**Frontend chamando o proxy (usa `sdk.js` para gerar fingerprint e capturar selfie):**
```html
<script src="/path/to/sdk.js"></script>
<script>
  // Substitui as URLs internas do sdk para apontar ao seu proxy PHP:
  window.VERIFY_PROXY_URL = '/verify.php';
  window.FACE_VERIFY_PROXY_URL = '/face-verify.php';

  // Exemplo mínimo
  async function verificar() {
    const email = document.querySelector('#email').value.trim();
    if (!email) return alert('Informe um e-mail válido.');

    // O sdk.js pode ter sido adaptado para aceitar URLs externas via globals:
    // Se não, você pode criar uma função equivalente que chame fetch(window.VERIFY_PROXY_URL)
    window.sendRiskPayload(email);
  }
</script>
```

> Dica: ajuste o `sdk.js` para ler `window.VERIFY_PROXY_URL`/`window.FACE_VERIFY_PROXY_URL` (quando definidos) e usá-los no lugar de `VERIFY_URL`/`FACE_VERIFY_URL`.

---

### Exemplo B — React (componente simples)

> Carregando o `sdk.js` via `<script>` no `index.html` do React (Vite/Create React App).  
> Em produção, substitua `alert()` por um sistema de *toasts*.

**`index.html`**
```html
<!doctype html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script defer src="/sdk.js"></script>
    <title>ScoreTrust React Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <div id="bio-container" style="display:none;margin-top:12px;"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**`src/App.jsx`**
```jsx
import { useRef, useState } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  const callingRef = useRef(false);

  const handleVerify = async () => {
    if (callingRef.current) return;
    if (!email) return alert("Informe um e-mail válido.");

    callingRef.current = true;
    try {
      // função exposta pelo sdk.js
      await window.sendRiskPayload(email);
    } finally {
      callingRef.current = false;
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>ScoreTrust – React Demo</h1>
      <p>Verificação de risco + selfie (quando necessário).</p>
      <input
        type="email"
        placeholder="email@exemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 12 }}
      />
      <button onClick={handleVerify} style={{ padding: "10px 16px" }}>
        Verificar Identidade
      </button>

      {/* O sdk.js injeta o preview de câmera neste container quando a ação for REVIEW */}
      <div id="bio-container" style={{ display: "none", marginTop: 16 }}></div>
    </div>
  );
}
```

---

### Exemplo C — HTML+CSS (puro, sem build)

Página estática mínima com styles simples, carregando o `sdk.js` e usando a função global.

```html
<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <title>ScoreTrust – Demo HTML</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root { --bg:#0b132b; --card:#1c2541; --acc:#5bc0be; --txt:#e0fbfc; --muted:#a4b3c0; }
    body { margin:0; background:var(--bg); color:var(--txt); font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
    .wrap { max-width: 720px; margin: 40px auto; padding: 0 16px; }
    .card { background:var(--card); border-radius:16px; padding:24px; box-shadow:0 6px 20px rgba(0,0,0,.25); }
    h1 { margin:0 0 12px; font-size:28px; }
    p { margin:0 0 16px; color:var(--muted); }
    .row { display:flex; gap:12px; align-items:center; }
    input[type="email"] { flex:1; padding:12px; border-radius:10px; border:1px solid #2d3a5a; background:#0f1a36; color:var(--txt); }
    button { padding:12px 16px; border:0; border-radius:10px; background:var(--acc); color:#0b132b; font-weight:700; cursor:pointer; }
    #bio-container { display:none; margin-top:16px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>ScoreTrust – Demo HTML</h1>
      <p>Valide risco e realize selfie quando necessário (fluxo REVIEW).</p>
      <div class="row">
        <input id="email" type="email" placeholder="email@exemplo.com" autocomplete="email" />
        <button id="btn-verify">Verificar</button>
      </div>
      <div id="bio-container"></div>
    </div>
  </div>

  <script src="/path/to/sdk.js"></script>
  <script>
    document.getElementById('btn-verify').addEventListener('click', () => {
      const email = document.getElementById('email').value.trim();
      if (!email) return alert('Informe um e-mail válido.');
      window.sendRiskPayload(email);
    });
  </script>
</body>
</html>
```

---

## Respostas esperadas

**/identity/verify** (exemplo)
```json
{
  "action": "REVIEW",           
  "score": 65,
  "reasons": ["Dispositivo não reconhecido", "Primeira captura de face"]
}
```

**/identity/face-verify** – cadastro da base:
```json
{ "result": "face_registered" }
```

**/identity/face-verify** – comparação:
```json
{
  "decision": "ACCEPT",
  "similarity": 87.3
}
```

---

## Boas práticas de segurança
- **Não expor** `x-api-key` no front. Prefira **proxy** no backend (Exemplo A).
- **CORS**: libere apenas domínios necessários e métodos/headers corretos.
- **WAF/Rate Limit** no API Gateway.
- **TLS sempre** (https), inclusive para permitir câmera.
- **Logs/Métricas**: monitore latência, 4xx/5xx, throttling e uso por chave.

---

## Troubleshooting
1. **Câmera bloqueada:** use `https://` (ou `http://localhost`) e permita acesso no navegador.
2. **CORS/NetworkError:** configure `Access-Control-Allow-Origin` para o seu domínio, `POST`, `Content-Type`, `x-api-key`.
3. **`#bio-container` não aparece:** garanta o elemento no DOM; o SDK injeta vídeo + botão quando `REVIEW`.
4. **Similaridade baixa:** melhore iluminação, centralize o rosto, reduza tremores; ajuste thresholds no backend.
5. **Base64 grande:** reduza qualidade/dimensões ao gerar JPEG (o SDK usa `toDataURL("image/jpeg", 0.92)` por padrão).

---

## FAQ
- **Posso trocar o `containerId` da selfie?**  
  Sim, adapte o `sdk.js` para aceitar `containerId` via parâmetro ou `window` (ex.: `startFaceVerification(email, "meu-container")`).

- **Dá para remover `alert()`?**  
  Total. Substitua por toasts/modais do seu design system.

- **Quais campos compõem o `device_hash`?**  
  `userAgent|language|screenSize|timezone` → SHA-256 em hex.

---

## Roadmap sugerido
- `sendRiskPayload(email, { containerId, onReview, onFaceResult, onError })`
- i18n (pt-BR/en-US)
- Empacotamento ESM/UMD + typings (TS)
- Parâmetros de compressão/resize da imagem

## 👨‍💻 Autor
`Desenvolvido por:` Adrian Wicke, Ana Carolina, Camille, Demetrio Paszko e Luiz Pessol.

---

## 📄 Licença

Uso interno e demonstração. Para uso comercial, consulte a equipe do projeto Score Trust.

--- 

