const synth = window.speechSynthesis;

let utterance = null;
let isPlaying = false;
let isMuted = true;
let resumeInterval = null;

/* =========================================
DETECT BAHASA DEVICE
========================================= */

function getDeviceLang() {

  const lang =
    navigator.language ||
    navigator.userLanguage ||
    "id-ID";

  return lang;

}

/* =========================================
AMBIL VOICE TERBAIK
========================================= */

function getBestVoice() {

  const voices = synth.getVoices();

  if (!voices.length) return null;

  const deviceLang = getDeviceLang().toLowerCase();

  // PRIORITAS SESUAI DEVICE
  let voice =
    voices.find(v =>
      v.lang.toLowerCase() === deviceLang
    );

  // PRIORITAS BAHASA SAMA
  if (!voice) {

    const shortLang =
      deviceLang.split("-")[0];

    voice =
      voices.find(v =>
        v.lang.toLowerCase()
        .startsWith(shortLang)
      );

  }

  // FALLBACK INDONESIA
  if (!voice) {

    voice =
      voices.find(v =>
        v.lang.toLowerCase()
        .includes("id")
      );

  }

  // FALLBACK ENGLISH
  if (!voice) {

    voice =
      voices.find(v =>
        v.lang.toLowerCase()
        .includes("en")
      );

  }

  // FALLBACK RANDOM
  if (!voice) {

    voice = voices[0];

  }

  return voice;

}

/* =========================================
GET TEXT
========================================= */

function getText() {

  const beritaEl =
    document.getElementById("berita");

  if (!beritaEl) return "";

  const judul =
    beritaEl.querySelector(".judul-berita")
    ?.innerText || "";

  const editor =
    beritaEl.querySelector("#editor")
    ?.innerText || "";

  const tanggal =
    beritaEl.querySelector("#tanggal")
    ?.innerText || "";

  const jam =
    beritaEl.querySelector("#jam")
    ?.innerText || "";

  const isiEl =
    beritaEl.querySelector(".isi-berita");

  if (!isiEl) {

    return `${judul}. ${editor}. ${tanggal}. ${jam}.`;

  }

  const clone = isiEl.cloneNode(true);

  /* HAPUS GAMBAR IKLAN */

  clone
    .querySelectorAll(
      "img, picture, source, iframe, video, .iklan-beranda"
    )
    .forEach(el => el.remove());

  /* A JADI TEXT */

  clone
    .querySelectorAll("a")
    .forEach(a => {

      const text = a.innerText;

      a.replaceWith(text);

    });

  /* HAPUS ELEMENT */

  clone
    .querySelectorAll(
      "button, figure, figcaption, .baca-berita, #voiceToggle, #aiTags, .home, .load-more"
    )
    .forEach(el => el.remove());

  let isi = "";

  clone
    .querySelectorAll(
      "h1, h2, h3, h4, p, li"
    )
    .forEach(el => {

      let text =
        el.innerText.trim();

      if (!text) return;

      if (el.tagName === "LI") {

        isi += `${text}. ... `;

      } else {

        isi += `${text}. `;

      }

    });

  let finalText =
    `${judul}. ${editor}. ${tanggal}. ${jam}. ${isi}`;

  finalText = finalText
    .replace(/BERITA LAINNYA/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return finalText;

}

/* =========================================
BUTTON TEXT
========================================= */

function setBtnText(btn, text, icon) {

  btn.innerHTML =
    `<span>${text}</span> <i class="${icon}"></i>`;

}

/* =========================================
STOP VOICE
========================================= */

function stopVoice(btn) {

  try {

    synth.cancel();

  } catch(e){}

  clearInterval(resumeInterval);

  isPlaying = false;

  isMuted = true;

  setBtnText(
    btn,
    'Dengarkan Berita',
    'bi bi-volume-up'
  );

}

/* =========================================
PLAY VOICE
========================================= */

function playVoice(btn) {

  if (isMuted) return;

  const text = getText();

  if (!text) return;

  try {

    synth.cancel();

  } catch(e){}

  utterance =
    new SpeechSynthesisUtterance(text);

  const selectedVoice =
    getBestVoice();

  if (selectedVoice) {

    utterance.voice = selectedVoice;

    utterance.lang =
      selectedVoice.lang;

  } else {

    utterance.lang =
      getDeviceLang();

  }

  utterance.rate = 1;

  utterance.pitch = 1;

  utterance.volume = 1;

  utterance.onstart = () => {

    isPlaying = true;

  };

  utterance.onend = () => {

    clearInterval(resumeInterval);

    isPlaying = false;

    isMuted = true;

    setBtnText(
      btn,
      'Dengarkan Berita',
      'bi bi-volume-up'
    );

  };

  utterance.onerror = () => {

    clearInterval(resumeInterval);

    isPlaying = false;

    isMuted = true;

    setBtnText(
      btn,
      'Dengarkan Berita',
      'bi bi-volume-up'
    );

  };

  /* =========================================
  FIX BROWSER SAMSUNG / IG / WEBVIEW
  ========================================= */

  setTimeout(() => {

    try {

      synth.speak(utterance);

    } catch(e){}

  }, 150);

  /* =========================================
  AUTO RESUME
  ========================================= */

  clearInterval(resumeInterval);

  resumeInterval = setInterval(() => {

    if (!isPlaying) {

      clearInterval(resumeInterval);

      return;

    }

    try {

      if (synth.paused) {

        synth.resume();

      }

      // Samsung / Webview fix
      if (!synth.speaking) {

        synth.pause();

        synth.resume();

      }

    } catch(e){}

  }, 1000);

}

/* =========================================
INIT
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const btn =
      document.getElementById("voiceToggle");

    if (!btn) return;

    stopVoice(btn);

    /* LOAD VOICES */

    function initVoices() {

      synth.getVoices();

    }

    initVoices();

    if (
      speechSynthesis.onvoiceschanged !==
      undefined
    ) {

      speechSynthesis.onvoiceschanged =
        initVoices;

    }

    /* BUTTON CLICK */

    btn.addEventListener(
      "click",
      () => {

        // IOS / Samsung / WebView unlock
        synth.resume();

        if (isMuted) {

          isMuted = false;

          setBtnText(
            btn,
            'Berhenti',
            'bi bi-volume-mute-fill'
          );

          playVoice(btn);

        } else {

          stopVoice(btn);

        }

      }
    );

  }
);

/* =========================================
UNLOAD
========================================= */

window.addEventListener(
  "beforeunload",
  () => {

    try {

      synth.cancel();

    } catch(e){}

  }
);

/* =========================================
BACKGROUND FIX
========================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (isPlaying) {

      setTimeout(() => {

        try {

          synth.resume();

        } catch(e){}

      }, 300);

    }

  }
);

/* =========================================
FOCUS FIX MOBILE
========================================= */

window.addEventListener(
  "focus",
  () => {

    if (isPlaying) {

      try {

        synth.resume();

      } catch(e){}

    }

  }
);