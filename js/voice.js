const synth = window.speechSynthesis;
let utterance = null;
let isPlaying = false;
let isMuted = true;
let voicesReady = false;
let voices = [];

// ===============================
// 🔥 LOAD VOICES (WAJIB)
// ===============================
function loadVoices() {
  voices = synth.getVoices();
  if (voices.length) {
    voicesReady = true;
  }
}

loadVoices();

if (!voices.length) {
  synth.onvoiceschanged = () => {
    loadVoices();
  };
}

// ===============================
// 🔥 PILIH VOICE INDONESIA
// ===============================
function getIndonesianVoice() {
  if (!voices.length) return null;

  // prioritas id-ID
  let voice =
    voices.find(v => v.lang === "id-ID") ||
    voices.find(v => v.lang.startsWith("id"));

  return voice || null;
}

// ===============================
// 🔥 AMBIL TEXT
// ===============================
function getText() {
  const beritaEl = document.getElementById("berita");
  if (!beritaEl) return "";

  const judul = beritaEl.querySelector(".judul-berita")?.innerText || "";
  const editor = beritaEl.querySelector("#editor")?.innerText || "";
  const tanggal = beritaEl.querySelector("#tanggal")?.innerText || "";

  const isiEl = beritaEl.querySelector(".isi-berita");
  if (!isiEl) return `${judul}. ${editor}. ${tanggal}.`;

  const clone = isiEl.cloneNode(true);

  // ubah <a> jadi text
  clone.querySelectorAll("a").forEach(a => {
    const text = a.innerText;
    a.replaceWith(text);
  });

  // hapus elemen tidak perlu
  const removeEls = clone.querySelectorAll(
    "button, figure, figcaption, .baca-berita, #voiceToggle, #aiTags, .home, .load-more"
  );
  removeEls.forEach(el => el.remove());

  let isi = "";

  clone.querySelectorAll("h1, h2, h3, h4, p, li").forEach(el => {
    let text = el.innerText.trim();
    if (!text) return;

    if (el.tagName === "LI") {
      isi += `${text}. ... `;
    } else {
      isi += `${text}. `;
    }
  });

  let finalText = `${judul}. ${editor}. ${tanggal}. ${isi}`;

  finalText = finalText
    .replace(/BERITA LAINNYA/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return finalText;
}

// ===============================
// UI BUTTON
// ===============================
function setBtnText(btn, text, icon) {
  btn.innerHTML = `<span>${text}</span> <i class="${icon}"></i>`;
}

// ===============================
// 🔥 PLAY VOICE
// ===============================
function playVoice(btn) {
  if (isMuted) return;

  const text = getText();
  if (!text) return;

  if (!voicesReady) {
    alert("Voice belum siap, coba lagi...");
    return;
  }

  const voice = getIndonesianVoice();

  if (!voice) {
    alert("Voice Bahasa Indonesia tidak tersedia di browser ini");
    return;
  }

  if (synth.speaking || synth.pending) synth.cancel();

  utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "id-ID";
  utterance.voice = voice; // 🔥 FIX UTAMA

  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onend = () => {
    isPlaying = false;
    isMuted = true;
    setBtnText(btn, 'Dengarkan Berita', 'bi bi-volume-up');
  };

  utterance.onerror = () => {
    isPlaying = false;
    isMuted = true;
    setBtnText(btn, 'Dengarkan Berita', 'bi bi-volume-up');
  };

  synth.speak(utterance);

  // 🔥 anti pause bug
  const resumeInterval = setInterval(() => {
    if (!synth.speaking) clearInterval(resumeInterval);
    else if (synth.paused) synth.resume();
  }, 1000);

  isPlaying = true;
}

// ===============================
// STOP
// ===============================
function stopVoice(btn) {
  if (synth.speaking || synth.pending) synth.cancel();
  isPlaying = false;
  isMuted = true;
  setBtnText(btn, 'Dengarkan Berita', 'bi bi-volume-up');
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("voiceToggle");
  if (!btn) return;

  isMuted = true;
  stopVoice(btn);

  setBtnText(btn, 'Dengarkan Berita', 'bi bi-volume-up');

  btn.addEventListener("click", () => {
    if (isMuted) {
      isMuted = false;
      setBtnText(btn, 'Berhenti', 'bi bi-volume-mute-fill');
      playVoice(btn);
    } else {
      stopVoice(btn);
    }
  });
});

// ===============================
// CLEANUP
// ===============================
window.addEventListener("beforeunload", () => synth.cancel());

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && synth.paused && isPlaying) {
    synth.resume();
  }
});