const synth = window.speechSynthesis;
let utterance = null;
let isPlaying = false;
let isMuted = true;

function getText() {
  const beritaEl = document.getElementById("berita");
  if (!beritaEl) return "";

  const judul = beritaEl.querySelector(".judul-berita")?.innerText || "";
  const editor = beritaEl.querySelector("#editor")?.innerText || "";
  const tanggal = beritaEl.querySelector("#tanggal")?.innerText || "";

  const isiEl = beritaEl.querySelector(".isi-berita");
  if (!isiEl) return `${judul} ${editor} ${tanggal}`;

  const clone = isiEl.cloneNode(true);

  const removeEls = clone.querySelectorAll(
    "button, a, figure, figcaption, .baca-berita, #voiceToggle, #aiTags, .home, .load-more"
  );
  removeEls.forEach(el => el.remove());

  let isi = "";

  clone.querySelectorAll("p").forEach(p => {
    const text = p.innerText.trim();
    if (text) {
      isi += text + " ";
    }
  });

  let finalText = `${judul}. ${editor}. ${tanggal}. ${isi}`;

  if (finalText.includes("BERITA LAINNYA")) {
    finalText = finalText.replace(/BERITA LAINNYA/g, "");
  }

  return finalText.trim();
}

function setBtnText(btn, text, icon) {
  btn.innerHTML = `<span>${text}</span> <i class="${icon}"></i>`;
}

function playVoice(btn) {
  if (isMuted) return;

  const text = getText();
  if (!text) return;

  if (synth.speaking || synth.pending) synth.cancel();

  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "id-ID";

  utterance.onend = () => {
    isPlaying = false;
    isMuted = true;
    setBtnText(btn, 'Baca Berita', 'bi bi-volume-up');
  };

  utterance.onerror = () => {
    isPlaying = false;
    isMuted = true;
    setBtnText(btn, 'Baca Berita', 'bi bi-volume-up');
  };

  synth.speak(utterance);

  const resumeInterval = setInterval(() => {
    if (!synth.speaking) clearInterval(resumeInterval);
    else if (synth.paused) synth.resume();
  }, 1000);

  isPlaying = true;
}

function stopVoice(btn) {
  if (synth.speaking || synth.pending) synth.cancel();
  isPlaying = false;
  isMuted = true;
  setBtnText(btn, 'Baca Berita', 'bi bi-volume-up');
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("voiceToggle");
  if (!btn) return;

  isMuted = true;
  stopVoice(btn);

  setBtnText(btn, 'Baca Berita', 'bi bi-volume-up');

  btn.addEventListener("click", () => {
    if (isMuted) {
      isMuted = false;
      setBtnText(btn, 'Berhenti', 'bi bi-volume-mute-fill');
      playVoice(btn);
    } else {
      stopVoice(btn);
    }
  });

  if (!synth.getVoices().length) {
    synth.onvoiceschanged = () => {};
  }
});

window.addEventListener("beforeunload", () => synth.cancel());

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && synth.paused && isPlaying) {
    synth.resume();
  }
});