let currentLang = "hi-IN";
let isVoiceMode = false;
const micBtn = document.getElementById("micBtn");
const micSmallBtn = document.getElementById("micSmallBtn");
const micStatus = document.getElementById("micStatus");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chatBox");
const audioPlayer = document.getElementById("audioPlayer");
const wave = document.getElementById("wave");
const voicePanel = document.getElementById("voicePanel");
const chatModeBtn = document.getElementById("chatModeBtn");
const voiceModeBtn = document.getElementById("voiceModeBtn");

// Mode Toggle
chatModeBtn.addEventListener("click", () => setMode("chat"));
voiceModeBtn.addEventListener("click", () => setMode("voice"));

function setMode(mode) {
  if (mode === "voice") {
    isVoiceMode = true;
    voicePanel.classList.remove("hidden");
    voiceModeBtn.classList.add("active");
    chatModeBtn.classList.remove("active");
    showToast("Voice Mode ON - ab bolkar pooch sakte hain");
  } else {
    isVoiceMode = false;
    voicePanel.classList.add("hidden");
    chatModeBtn.classList.add("active");
    voiceModeBtn.classList.remove("active");
  }
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".lang-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentLang = btn.dataset.lang;
  });
});

// Speech Recognition Setup
let recognition;
let isListening = false;
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = currentLang;

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add("listening");
    micSmallBtn.classList.add("active");
    wave.classList.remove("hidden");
    micStatus.textContent = currentLang.includes("hi")
      ? "Sun raha hoon... boliye"
      : "Listening... speak now";
  };
  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove("listening");
    micSmallBtn.classList.remove("active");
    wave.classList.add("hidden");
    micStatus.textContent = currentLang.includes("hi")
      ? "Mic dabakar bolen"
      : "Tap mic to speak";
  };
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    textInput.value = transcript;
    if (e.results[0].isFinal) {
      sendQuery(transcript);
    }
  };
  recognition.onerror = (e) => {
    console.error(e);
    showToast("Mic error: " + e.error);
  };
} else {
  showToast("Voice not supported in this browser");
}

function toggleMic() {
  if (!recognition) {
    showToast("Browser me voice support nahi hai");
    return;
  }
  if (isListening) {
    recognition.stop();
    return;
  }
  recognition.lang = currentLang;
  try {
    recognition.start();
  } catch (e) {
    recognition.stop();
  }
}

micBtn.addEventListener("click", toggleMic);
micSmallBtn.addEventListener("click", toggleMic);

// Transliteration Engine (Fixes English word spelling issues during TTS)
function convertToHindiSpeech(text) {
  if (!text) return "";
  let clean = decodeURIComponent(text);

  // 1. Remove HTML Tags & Emojis
  clean = clean.replace(/<[^>]*>?/gm, " ");
  clean = clean.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}📋✅👤📄🔗🔊📲]/gu, "");

  // 2. Transliteration Map including GramVaani and common terms
  const wordMap = {
    "gramvaani": "ग्रामवाणी",
    "gramvani": "ग्रामवाणी",
    "gram vaani": "ग्रामवाणी",
    "yojana": "योजना", 
    "yojanaen": "योजनाएं", 
    "kisan": "किसान", 
    "samman": "सम्मान",
    "nidhi": "निधि", 
    "pradhanmantri": "प्रधानमंत्री", 
    "labh": "लाभ", 
    "yogyata": "योग्यता",
    "dastawez": "दस्तावेज़", 
    "rupees": "रुपये", 
    "bank": "बैंक", 
    "account": "अकाउंट",
    "pm": "पीएम", 
    "gas": "गैस", 
    "aawas": "आवास", 
    "apply": "अप्लाई", 
    "here": "हियर",
    "har": "हर", 
    "saal": "साल", 
    "kisht": "किश्त", 
    "jaane": "जाने", 
    "shabd": "शब्द",
    "dekhiye": "देखिए", 
    "mili": "मिली", 
    "jankari": "जानकारी", 
    "faayda": "फायदा",
    "zaroori": "ज़रूरी", 
    "khatouni": "खतौनी", 
    "passbook": "पासबुक", 
    "maaf": "माफ़"
  };

  Object.keys(wordMap).forEach((key) => {
    const reg = new RegExp("\\b" + key + "\\b", "gi");
    clean = clean.replace(reg, wordMap[key]);
  });

  // Clean remaining single letter spellouts and extra spaces
  clean = clean.replace(/\b([a-zA-Z])\b/g, "");
  clean = clean.replace(/[*_#\-]/g, " ").replace(/\s+/g, " ").trim();

  return clean;
}

// Fallback Browser Voice Function
function fallbackSpeak(textOrBtn) {
  let rawTxt = "";
  if (typeof textOrBtn === "string") {
    rawTxt = textOrBtn;
  } else if (textOrBtn && textOrBtn.getAttribute) {
    rawTxt = textOrBtn.getAttribute("data-text") || "";
  }

  const cleanTxt = convertToHindiSpeech(rawTxt);

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanTxt);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.includes('hi'));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    window.speechSynthesis.speak(utterance);
  } else {
    showToast("Browser me voice support nahi hai.");
  }
}

// Global Speak Handler (Primary: Server MP3 Audio / Fallback: Web Speech)
function speakText(textOrBtn, audioUrl = null) {
  if (audioUrl) {
    audioPlayer.src = audioUrl;
    audioPlayer.play().catch(() => {
      fallbackSpeak(textOrBtn);
    });
  } else {
    fallbackSpeak(textOrBtn);
  }
}

// Send Input Handlers
sendBtn.addEventListener("click", () => {
  if (textInput.value.trim()) sendQuery(textInput.value.trim());
});
textInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && textInput.value.trim())
    sendQuery(textInput.value.trim());
});

function quickAsk(q) {
  textInput.value = q;
  sendQuery(q);
  showToast("Bheja gaya: " + q);
}

// Send Query Logic
async function sendQuery(query) {
  addMsg(query, "user");
  textInput.value = "";

  const typingId = addMsg(
    currentLang.includes("hi")
      ? "ग्रामवाणी लिख रहा है..."
      : "GramVaani is typing...",
    "bot",
    true,
  );

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, lang: currentLang }),
    });
    const data = await res.json();

    document.getElementById(typingId)?.remove();

    addMsg(data.response_text, "bot", false, data.audio_url);

    if (data.schemes && data.schemes.length) {
      let html = "<b>📋 Mili Yojanaein:</b>";
      data.schemes.forEach((s) => {
        const name = currentLang.includes("hi") ? s.name_hi : s.name;
        const detailsText = `Labh: ${s.benefits}. Yogyata: ${s.eligibility}`;

        html += `
          <div class="scheme-card" style="border: 1px solid #e0e0e0; padding: 12px; border-radius: 8px; margin-top: 10px;">
            <h4>${name}</h4>
            <p><b>✅ Labh:</b> ${s.benefits}</p>
            <p><b>👤 Yogyata:</b> ${s.eligibility}</p>
            <p><b>📄 Dastawez:</b> ${s.documents ? s.documents.join(", ") : "N/A"}</p>
            <p>🔗 <a href="${s.apply_link}" target="_blank">Apply Here</a></p>
            
            <div class="card-actions" style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
              <button onclick="speakText('${encodeURIComponent(name + '. ' + detailsText)}', '${data.audio_url || ''}')" style="background:#ff9800; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.8rem;">🔊 Sunein</button>
              <button onclick="shareOnWhatsApp('${name}', '${detailsText}')" style="background:#25D366; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.8rem;">📲 Share</button>
              <button onclick="printSchemeCard()" style="background:#007bff; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.8rem;">📄 Print</button>
            </div>
          </div>`;
      });

      const div = document.createElement("div");
      div.className = "msg bot";
      div.innerHTML = html;
      chatBox.appendChild(div);
    }

    // Auto Play Generated Server Audio in Voice Mode
    if (data.audio_url) {
      audioPlayer.src = data.audio_url + "?t=" + new Date().getTime(); // Anti-caching URL
      if (isVoiceMode) {
        audioPlayer.play().catch(() => {});
        showToast("🔊 Jawab sunein...");
      }
    }
  } catch (err) {
    document.getElementById(typingId)?.remove();
    addMsg(
      "❌ Server Error: Flask server chal raha hai kya? 'python app.py' karein.",
      "bot",
    );
    console.error(err);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

function addMsg(text, who, isTyping = false, audioUrl = null) {
  const id =
    "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
  const div = document.createElement("div");
  div.className = `msg ${who}` + (isTyping ? " typing" : "");
  div.id = id;
  div.innerHTML = text.replace(/\n/g, "<br>");

  if (who === "bot" && !isTyping) {
    const speakBtn = `<br><button onclick="speakText(this, '${audioUrl || ''}')" data-text="${encodeURIComponent(text)}" style="margin-top:6px; border:none; background:#FFE0B2; padding:4px 10px; border-radius:12px; cursor:pointer; font-size:0.8rem;">🔊 Sunein</button>`;
    div.innerHTML += speakBtn;
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return id;
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// WhatsApp Share Function
function shareOnWhatsApp(schemeName, schemeDetails) {
  const text = `*GramVaani Portal Details*\n\n📌 *Yojana:* ${schemeName}\n📝 *Jankari:* ${schemeDetails}\n\nGramVaani Portal par aur yojanaon ki jankari dekhein.`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// PDF Print Function
function printSchemeCard() {
  window.print();
}

// Quick Eligibility Filter Logic
function applyQuickFilter() {
  const occupationSelect = document.getElementById("occupationFilter");
  const categorySelect = document.getElementById("categoryFilter");
  
  const occupation = occupationSelect ? occupationSelect.value : "";
  const category = categorySelect ? categorySelect.value : "";

  if (!occupation && !category) {
    showToast("Kripya kam se kam ek filter option chunen.");
    return;
  }

  let queryParts = [];
  if (occupation) queryParts.push(occupation);
  if (category) queryParts.push(category);

  const generatedQuery = `${queryParts.join(" ")} yojana`;
  sendQuery(generatedQuery);
}

// Visualizer Animation
const canvas = document.getElementById("visualizer");
if (canvas) {
  const ctx = canvas.getContext("2d");
  function drawVisualizer() {
    if (!isListening) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      requestAnimationFrame(drawVisualizer);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FF9800";
    for (let i = 0; i < 30; i++) {
      const h = Math.random() * 40 + 5;
      ctx.fillRect(i * 10, 30 - h / 2, 6, h);
    }
    requestAnimationFrame(drawVisualizer);
  }
  drawVisualizer();
}

window.quickAsk = quickAsk;
window.speakText = speakText;
window.shareOnWhatsApp = shareOnWhatsApp;
window.printSchemeCard = printSchemeCard;
window.applyQuickFilter = applyQuickFilter;