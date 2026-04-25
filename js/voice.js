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

  // 🔥 hapus iklan & gambar biar tidak kebaca
  clone.querySelectorAll("img, .iklan-beranda, picture, source").forEach(el => el.remove());

  // 🔥 ubah link jadi text
  clone.querySelectorAll("a").forEach(a => {
    const text = a.innerText;
    a.replaceWith(text);
  });

  // 🔥 hapus elemen tidak penting
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

  // 🔥 ritme baca biar lebih natural
  finalText = finalText
    .replace(/BERITA LAINNYA/g, "")
    .replace(/\./g, ". ... ")
    .replace(/,/g, ", ")
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

  // 🔥 pecah kalimat biar natural
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let index = 0;

  function speakNext() {
    if (index >= sentences.length) {
      isPlaying = false;
      isMuted = true;
      setBtnText(btn, 'Dengarkan Berita', 'bi bi-volume-up');
      return;
    }

    let part = sentences[index].trim();
    if (!part) {
      index++;
      return speakNext();
    }

    utterance = new SpeechSynthesisUtterance(part);
    utterance.lang = "id-ID";

    // 🔥 variasi biar tidak robot
    utterance.rate = 0.9 + Math.random() * 0.15;
    utterance.pitch = 0.9 + Math.random() * 0.2;
    utterance.volume = 1;

    // 🔥 pilih suara terbaik (jika ada)
    const voices = synth.getVoices();
    const indoVoice = voices.find(v => v.lang.includes("id"));
    if (indoVoice) utterance.voice = indoVoice;

    utterance.onend = () => {
      index++;
      setTimeout(speakNext, 250); // jeda natural
    };

    utterance.onerror = () => {
      index++;
      speakNext();
    };

    synth.speak(utterance);
  }

  speakNext();

  // 🔥 anti mati saat background / layar mati
  const resumeInterval = setInterval(() => {
    if (!isPlaying) return clearInterval(resumeInterval);

    if (synth.paused) {
      try { synth.resume(); } catch(e){}
    }
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

// 🔥 tetap hidup saat balik ke tab / layar mati
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && synth.paused && isPlaying) {
    try { synth.resume(); } catch(e){}
  }
});