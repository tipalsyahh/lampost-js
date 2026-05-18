/* =========================================
SYNTH
========================================= */

const synth =
window.speechSynthesis;

let utterance = null;

let isPlaying = false;

let isMuted = true;

let resumeInterval = null;

/* =========================================
STORAGE
========================================= */

const STORAGE_KEY =
"lampost_voice_position";

/* =========================================
CURRENT POSITION
========================================= */

let currentCharIndex = 0;

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
PRIORITAS INDONESIA
========================================= */

function getBestVoice() {

  const voices =
    synth.getVoices();

  if (!voices.length)
    return null;

  // =====================================
  // PRIORITAS INDONESIA
  // =====================================

  let voice =

    voices.find(v =>

      v.lang
       .toLowerCase()
       .includes("id")
    );

  // =====================================
  // DEVICE LANGUAGE
  // =====================================

  if (!voice) {

    const deviceLang =

      getDeviceLang()
      .toLowerCase();

    voice =

      voices.find(v =>

        v.lang
         .toLowerCase() ===
         deviceLang
      );
  }

  // =====================================
  // SHORT LANG
  // =====================================

  if (!voice) {

    const shortLang =

      getDeviceLang()
      .split("-")[0]
      .toLowerCase();

    voice =

      voices.find(v =>

        v.lang
         .toLowerCase()
         .startsWith(shortLang)
      );
  }

  // =====================================
  // ENGLISH
  // =====================================

  if (!voice) {

    voice =

      voices.find(v =>

        v.lang
         .toLowerCase()
         .includes("en")
      );
  }

  // =====================================
  // RANDOM
  // =====================================

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

    document.getElementById(
      "berita"
    );

  if (!beritaEl)
    return "";

  const judul =

    beritaEl.querySelector(
      ".judul-berita"
    )?.innerText || "";

  const editor =

    beritaEl.querySelector(
      "#editor"
    )?.innerText || "";

  const tanggal =

    beritaEl.querySelector(
      "#tanggal"
    )?.innerText || "";

  const jam =

    beritaEl.querySelector(
      "#jam"
    )?.innerText || "";

  const isiEl =

    beritaEl.querySelector(
      ".isi-berita"
    );

  if (!isiEl) {

    return `
      ${judul}.
      ${editor}.
      ${tanggal}.
      ${jam}.
    `;
  }

  const clone =
    isiEl.cloneNode(true);

  /* =====================================
  HAPUS ELEMENT
  ===================================== */

  clone
    .querySelectorAll(
      `
      img,
      picture,
      source,
      iframe,
      video,
      .iklan-beranda,
      button,
      figure,
      figcaption,
      .baca-berita,
      #voiceToggle,
      #aiTags,
      .home,
      .load-more
      `
    )
    .forEach(el =>
      el.remove()
    );

  /* =====================================
  A -> TEXT
  ===================================== */

  clone
    .querySelectorAll("a")
    .forEach(a => {

      const text =
        a.innerText;

      a.replaceWith(text);

    });

  let isi = "";

  clone
    .querySelectorAll(
      "h1,h2,h3,h4,p,li"
    )
    .forEach(el => {

      let text =
        el.innerText.trim();

      if (!text) return;

      if (
        el.tagName === "LI"
      ) {

        isi +=
        `${text}. ... `;

      } else {

        isi +=
        `${text}. `;
      }

    });

  let finalText =

    `
    ${judul}.
    ${editor}.
    ${tanggal}.
    ${jam}.
    ${isi}
    `;

  finalText =
    finalText

    .replace(
      /BERITA LAINNYA/g,
      ""
    )

    .replace(
      /\s+/g,
      " "
    )

    .trim();

  return finalText;
}

/* =========================================
BUTTON TEXT
========================================= */

function setBtnText(
  btn,
  text,
  icon
) {

  btn.innerHTML =

  `
  <span>${text}</span>
  <i class="${icon}"></i>
  `;
}

/* =========================================
SAVE POSITION
========================================= */

function savePosition() {

  localStorage.setItem(

    STORAGE_KEY,

    currentCharIndex
  );
}

/* =========================================
LOAD POSITION
========================================= */

function loadPosition() {

  return parseInt(

    localStorage.getItem(
      STORAGE_KEY
    ) || 0
  );
}

/* =========================================
CLEAR POSITION
========================================= */

function clearPosition() {

  localStorage.removeItem(
    STORAGE_KEY
  );

  currentCharIndex = 0;
}

/* =========================================
STOP VOICE
========================================= */

function stopVoice(btn) {

  try {

    synth.cancel();

  } catch(e){}

  clearInterval(
    resumeInterval
  );

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

  const fullText =
    getText();

  if (!fullText)
    return;

// =====================================
// RESUME TEXT
// =====================================

const savedStartIndex =
currentCharIndex;

const text =

  fullText.substring(
    currentCharIndex
  );

  try {

    synth.cancel();

  } catch(e){}

  utterance =

    new SpeechSynthesisUtterance(
      text
    );

  const selectedVoice =
    getBestVoice();

  if (selectedVoice) {

    utterance.voice =
      selectedVoice;

    utterance.lang =
      selectedVoice.lang;

  } else {

    utterance.lang =
      "id-ID";
  }

  utterance.rate = 1;

  utterance.pitch = 1;

  utterance.volume = 1;

/* =====================================
TRACK POSITION
===================================== */

utterance.onboundary =
function(event){

  // ===================================
  // CHAR INDEX
  // ===================================

  if (
    typeof event.charIndex ===
    'number'
  ) {

    currentCharIndex =

      savedStartIndex +

      event.charIndex;

    savePosition();
  }
};

  /* =====================================
  START
  ===================================== */

  utterance.onstart =
  () => {

    isPlaying = true;
  };

  /* =====================================
  END
  ===================================== */

  utterance.onend =
  () => {

    clearInterval(
      resumeInterval
    );

    isPlaying = false;

    isMuted = true;

    clearPosition();

    setBtnText(

      btn,

      'Dengarkan Berita',

      'bi bi-volume-up'
    );
  };

  /* =====================================
  ERROR
  ===================================== */

  utterance.onerror =
  () => {

    clearInterval(
      resumeInterval
    );

    isPlaying = false;

    isMuted = true;

    setBtnText(

      btn,

      'Dengarkan Berita',

      'bi bi-volume-up'
    );
  };

  /* =====================================
  START SPEAK
  ===================================== */

  setTimeout(() => {

    try {

      synth.speak(
        utterance
      );

    } catch(e){}

  }, 100);

  /* =====================================
  AUTO RESUME
  ===================================== */

  clearInterval(
    resumeInterval
  );

  resumeInterval =
  setInterval(() => {

    if (!isPlaying) {

      clearInterval(
        resumeInterval
      );

      return;
    }

    try {

      if (
        synth.paused
      ) {

        synth.resume();
      }

      if (
        !synth.speaking
      ) {

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

      document.getElementById(
        "voiceToggle"
      );

    if (!btn) return;

    // ===================================
    // LOAD POSITION
    // ===================================

    currentCharIndex =
      loadPosition();

    stopVoice(btn);

    // ===================================
    // LOAD VOICES
    // ===================================

    function initVoices() {

      synth.getVoices();
    }

    initVoices();

    if (

      speechSynthesis
      .onvoiceschanged !==
      undefined

    ) {

      speechSynthesis
      .onvoiceschanged =

      initVoices;
    }

    // ===================================
    // BUTTON CLICK
    // ===================================

    btn.addEventListener(

      "click",

      () => {

        synth.resume();

        // ===============================
        // PLAY
        // ===============================

        if (isMuted) {

          isMuted = false;

          setBtnText(

            btn,

            'Berhenti',

            'bi bi-volume-mute-fill'
          );

          playVoice(btn);

        }

        // ===============================
        // STOP
        // ===============================

        else {

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