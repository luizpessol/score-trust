// sdk.js

async function generateDeviceHash() {
  const userAgent = navigator.userAgent || '';
  const language = navigator.language || '';
  const screenSize = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

  const raw = `${userAgent}|${language}|${screenSize}|${timezone}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function sendRiskPayload(email) {
  const userAgent = navigator.userAgent || '';
  const language = navigator.language || '';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const deviceHash = await generateDeviceHash();

  const payload = {
    email: email,
    device_name: userAgent,
    user_agent: userAgent,
    language: language,
    timezone: timezone,
    device_hash: deviceHash
  };

  try {
    const response = await fetch("https://gepy93264h.execute-api.us-east-1.amazonaws.com/prod/identity/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      alert(`Erro ao verificar identidade:\n${JSON.stringify(result, null, 2)}`);
    } else {
      alert(`Risco: ${result.action} (score ${result.score})`);
    }

    console.log(result);
    return result;

  } catch (error) {
    alert(`Erro de rede ou CORS: ${error.message}`);
    console.error("Erro ao enviar payload:", error);
    return { error: "Erro de comunicação com o Risk Engine" };
  }
}
