// sdk.js — mantém verify; adiciona fluxo de câmera + face-verify

const API_BASE = "https://api.score-trust.com";          // mesmo domínio que você já usa
const VERIFY_URL = `${API_BASE}/identity/verify`;
const FACE_VERIFY_URL = `${API_BASE}/identity/face-verify`;
const API_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // já existente

// ================== util ==================
async function generateDeviceHash() {
  const userAgent = navigator.userAgent || '';
  const language = navigator.language || '';
  const screenSize = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

  const raw = `${userAgent}|${language}|${screenSize}|${timezone}`;
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function isSecureContextForCamera() {
  // getUserMedia exige HTTPS ou localhost
  return location.protocol === "https:" || location.hostname === "localhost";
}

function stopStream(stream) {
  try { stream?.getTracks()?.forEach(t => t.stop()); } catch(e) {}
}

// ================ RISCO (verify) ================
async function sendRiskPayload(email) {
  const payload = {
    email,
    device_name: navigator.userAgent || '',
    user_agent: navigator.userAgent || '',
    language: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    device_hash: await generateDeviceHash()
  };

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("verify =>", result);

    if (!response.ok) {
      alert(`Erro ao verificar identidade:\n${JSON.stringify(result, null, 2)}`);
      return result;
    }

    alert(`Risco: ${result.action} (score ${result.score})`);

    // Se cair em REVIEW, abre a câmera, captura e envia para face-verify
    if (String(result.action || "").toLowerCase() === "review") {
      await startFaceVerification(email, "bio-container");
    }
    return result;

  } catch (error) {
    alert(`Erro de rede ou CORS: ${error.message}`);
    console.error("Erro ao enviar payload:", error);
    return { error: "Erro de comunicação com o Risk Engine" };
  }
}

// ================ BIOMETRIA (face-verify) ================
async function startFaceVerification(email, containerId) {
  const box = document.getElementById(containerId);
  if (!box) return alert("Container de biometria não encontrado.");

  // segurança do navegador
  if (!isSecureContextForCamera()) {
    alert("Para usar a câmera, acesse por HTTPS (ou localhost).");
    return;
  }

  // limpa e monta UI
  box.innerHTML = "";
  box.style.display = "block";
  const title = document.createElement("div");
  title.textContent = "Verificação biométrica (preview de câmera)";
  title.style.margin = "8px 0";
  const video = document.createElement("video");
  video.autoplay = true; video.playsInline = true; video.width = 320; video.height = 240;
  video.style.borderRadius = "12px"; video.style.boxShadow = "0 0 0 1px #333";
  const btn = document.createElement("button");
  btn.textContent = "Capturar e verificar";
  btn.className = "btn";
  btn.style.width = "auto";
  btn.style.marginTop = "10px";

  box.append(title, video, btn);

  // abre câmera
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (e) {
    alert("Não foi possível acessar a câmera: " + e.message);
    return;
  }

  btn.onclick = async () => {
    btn.disabled = true;
    try {
      // captura frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Gera JPEG base64 sem o prefixo data:
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const imageBase64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");

      // envio
      const resp = await fetch(FACE_VERIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // se o seu API Gateway do face-verify estiver sem API Key, enviar esse header não atrapalha;
          // se estiver com API Key, ele é obrigatório.
          "x-api-key": API_KEY
        },
        body: JSON.stringify({ email, imageBase64 })
      });

      const r = await resp.json();
      console.log("face-verify =>", r);

      if (!resp.ok) {
        alert(`Erro na biometria: ${JSON.stringify(r)}`);
      } else {
        if (r.result === "face_registered") {
          alert("Base biométrica registrada. Tente novamente para comparar.");
        } else if (r.decision) {
          const sim = Math.round(r.similarity ?? 0);
          alert(`Biometria: ${r.decision} (similaridade ${sim}).`);
        } else {
          alert(JSON.stringify(r));
        }
      }

    } catch (err) {
      alert("Falha ao capturar/enviar: " + err.message);
    } finally {
      btn.disabled = false;
      stopStream(stream);
      video.srcObject = null;
      // opcional: esconder o box depois
      // box.style.display = "none";
    }
  };
}

// Exponho para o index.html usar no botão "Verificar Identidade"
window.sendRiskPayload = sendRiskPayload;

