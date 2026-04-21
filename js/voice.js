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
  if (!isiEl) return `${judul}. ${editor}. ${tanggal}.`;

  const clone = isiEl.cloneNode(true);

  // 🔥 FIX: jangan hapus <a>, tapi ubah jadi text biasa
  clone.querySelectorAll("a").forEach(a => {
    const text = a.innerText;
    a.replaceWith(text);
  });

  // hapus elemen tidak perlu (tanpa a)
  const removeEls = clone.querySelectorAll(
    "button, figure, figcaption, .baca-berita, #voiceToggle, #aiTags, .home, .load-more"
  );
  removeEls.forEach(el => el.remove());

  let isi = "";

  clone.querySelectorAll("h1, h2, h3, h4, p, li").forEach(el => {
    let text = el.innerText.trim();
    if (!text) return;

    const tag = el.tagName;

    // 🔥 TANPA PENEKANAN HEADING (normal aja)
    if (tag === "LI") {
      isi += `${text}. ... `;
    } else {
      isi += `${text}. `;
    }
  });

  let finalText = `${judul}. ${editor}. ${tanggal}. ${isi}`;

  // bersihin noise
  finalText = finalText
    .replace(/BERITA LAINNYA/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return finalText;
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
  setBtnText(btn, 'Dengarkan Berita', 'bi bi-volume-up');
}

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