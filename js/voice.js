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
    btn.innerHTML = 'Baca Berita <i class="bi bi-volume-up"></i>';
  };

  utterance.onerror = () => {
    isPlaying = false;
    isMuted = true;
    btn.innerHTML = 'Baca Berita <i class="bi bi-volume-up"></i>';
  };

  synth.speak(utterance);
  if (synth.paused) synth.resume();

  isPlaying = true;
}

function stopVoice(btn) {
  if (synth.speaking || synth.pending) synth.cancel();
  isPlaying = false;
  isMuted = true;
  btn.innerHTML = 'Baca Berita <i class="bi bi-volume-up"></i>';
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("voiceToggle");
  if (!btn) return;

  isMuted = true;
  stopVoice(btn);

  btn.innerHTML = 'Baca Berita <i class="bi bi-volume-up"></i>';

  btn.addEventListener("click", () => {
    if (isMuted) {
      isMuted = false;
      btn.innerHTML = 'Berhenti <i class="bi bi-volume-mute-fill"></i>';
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
  if (document.hidden) {
    const btn = document.getElementById("voiceToggle");
    if (btn) stopVoice(btn);
  }
});