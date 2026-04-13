const synth = window.speechSynthesis;
let utterance = null;
let isPlaying = false;
let isMuted = true;

function getText() {
  const beritaEl = document.getElementById("berita");
  if (!beritaEl) return "";

  let text = "";

  Array.from(beritaEl.children).forEach(node => {
    if (
      node.classList.contains("home") ||
      node.classList.contains("load-more") ||
      node.id === "aiTags"
    ) return;

    let content = node.innerText || "";

    if (content.includes("BERITA LAINNYA")) {
      content = content.replace("BERITA LAINNYA", "");
    }

    text += content + " ";
  });

  return text.trim();
}

function playVoice() {
  if (isMuted) return;

  const text = getText();
  if (!text) return;

  if (synth.speaking || synth.pending) synth.cancel();

  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "id-ID";

  utterance.onend = () => {
    isPlaying = false;
  };

  utterance.onerror = () => {
    isPlaying = false;
  };

  synth.speak(utterance);
  if (synth.paused) synth.resume();

  isPlaying = true;
}

function stopVoice() {
  if (synth.speaking || synth.pending) synth.cancel();
  isPlaying = false;
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("voiceToggle");
  if (!btn) return;

  isMuted = true;
  stopVoice();

  btn.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';

  btn.addEventListener("click", () => {
    if (isMuted) {
      isMuted = false;
      btn.innerHTML = '<i class="bi bi-volume-up"></i>';
      playVoice();
    } else {
      isMuted = true;
      btn.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
      stopVoice();
    }
  });

  if (!synth.getVoices().length) {
    synth.onvoiceschanged = () => {};
  }
});

window.addEventListener("beforeunload", () => synth.cancel());

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopVoice();
});
