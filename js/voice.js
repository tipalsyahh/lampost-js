const synth = window.speechSynthesis;

let utterance = null;
let isPlaying = false;
let isMuted = true;
let resumeInterval = null;

const STORAGE_KEY = "lampost_voice_position";

let currentCharIndex = 0;
let currentText = "";

function getDeviceLang() {

    const lang =
        navigator.language ||
        navigator.userLanguage ||
        "id-ID";

    return lang;
}

function getBestVoice() {

    const voices = synth.getVoices();

    if (!voices.length)
        return null;

    let voice =
        voices.find(v =>
            v.lang.toLowerCase().includes("id")
        );

    if (!voice) {

        const deviceLang =
            getDeviceLang().toLowerCase();

        voice =
            voices.find(v =>
                v.lang.toLowerCase() === deviceLang
            );
    }

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

    if (!voice) {

        voice =
            voices.find(v =>
                v.lang.toLowerCase().includes("en")
            );
    }

    if (!voice) {
        voice = voices[0];
    }

    return voice;
}

function getText() {

    const beritaEl =
        document.getElementById("berita");

    if (!beritaEl)
        return "";

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

        return `
      ${judul}.
      ${editor}.
      ${tanggal}.
      ${jam}.
    `;
    }

    const clone = isiEl.cloneNode(true);

    clone.querySelectorAll(`
    img,
    picture,
    source,
    iframe,
    video,
    button,
    figure,
    figcaption,
    svg,
    canvas,
    script,
    style,
    noscript,
    aside,
    ins,
    .adsbygoogle,
    .ads,
    .google-auto-placed,
    .google-auto-placed-ap_container,
    [id*="google"],
    [class*="google"],
    [class*="ads"],
    [class*="advert"],
    [class*="iklan"],
    [class*="banner"],
    [class*="sponsor"],
    [data-ad],
    [data-google-query-id],
    #voiceToggle,
    #aiTags,
    .home,
    .load-more,
    .baca-berita
    `).forEach(el => el.remove());

    clone
        .querySelectorAll("a")
        .forEach(a => {

            const text = a.innerText;

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

            if (el.tagName === "LI") {

                isi += `${text}. ... `;

            } else {

                isi += `${text}. `;
            }

        });

    let finalText = `
    ${judul}.
    ${editor}.
    ${tanggal}.
    ${jam}.
    ${isi}
  `;

    finalText = finalText
        .replace(/BERITA LAINNYA/g, "")
        .replace(/\s+/g, " ")
        .trim();

    return finalText;
}

function setBtnText(
    btn,
    text,
    icon
) {

    btn.innerHTML = `
    <span>${text}</span>
    <i class="${icon}"></i>
  `;
}

function savePosition() {

    localStorage.setItem(
        STORAGE_KEY,
        currentCharIndex
    );
}

function loadPosition() {

    return parseInt(
        localStorage.getItem(STORAGE_KEY) || 0
    );
}

function clearPosition() {

    localStorage.removeItem(
        STORAGE_KEY
    );

    currentCharIndex = 0;
}

function stopVoice(
    btn,
    reset = false
) {

    try {

        if (utterance) {

            if (
                typeof utterance.text === "string"
            ) {

                const spokenLength =
                    currentText.length -
                    utterance.text.length;

                if (
                    spokenLength > currentCharIndex
                ) {

                    currentCharIndex =
                        spokenLength;

                    savePosition();
                }
            }
        }

        synth.cancel();

    } catch (e) { }

    clearInterval(
        resumeInterval
    );

    isPlaying = false;
    isMuted = true;

    if (reset) {
        clearPosition();
    }

    setBtnText(
        btn,
        'Dengarkan Berita',
        'bi bi-volume-up'
    );
}

function playVoice(btn) {

    if (isMuted) return;

    currentText = getText();

    if (!currentText)
        return;

    if (
        currentCharIndex >=
        currentText.length
    ) {

        currentCharIndex = 0;
    }

    const savedStartIndex =
        currentCharIndex;

    const text =
        currentText.substring(
            currentCharIndex
        );

    try {

        synth.cancel();

    } catch (e) { }

    utterance =
        new SpeechSynthesisUtterance(text);

    const selectedVoice =
        getBestVoice();

    if (selectedVoice) {

        utterance.voice =
            selectedVoice;

        utterance.lang =
            selectedVoice.lang;

    } else {

        utterance.lang = "id-ID";
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onboundary =
        function (event) {

            if (
                typeof event.charIndex ===
                "number"
            ) {

                currentCharIndex =
                    savedStartIndex +
                    event.charIndex;

                savePosition();
            }
        };

    utterance.onstart =
        () => {

            isPlaying = true;
        };

    utterance.onend =
        () => {

            stopVoice(
                btn,
                true
            );
        };

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

    setTimeout(() => {

        try {

            synth.speak(
                utterance
            );

        } catch (e) { }

    }, 100);

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

                if (synth.paused) {
                    synth.resume();
                }

                if (!synth.speaking) {

                    synth.pause();
                    synth.resume();
                }

            } catch (e) { }

        }, 1000);
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const btn =
            document.getElementById(
                "voiceToggle"
            );

        if (!btn) return;

        currentCharIndex =
            loadPosition();

        stopVoice(btn);

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

        btn.addEventListener(
            "click",
            () => {

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

window.addEventListener(
    "beforeunload",
    () => {

        try {

            savePosition();

            synth.cancel();

        } catch (e) { }
    }
);

document.addEventListener(
    "visibilitychange",
    () => {

        if (isPlaying) {

            setTimeout(() => {

                try {

                    synth.resume();

                } catch (e) { }

            }, 300);
        }

    }
);

window.addEventListener(
    "focus",
    () => {

        if (isPlaying) {

            try {

                synth.resume();

            } catch (e) { }
        }

    }
);
