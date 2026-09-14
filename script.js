const audio = document.getElementById("bg-music");
const seekBar = document.getElementById("seek-bar");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerCover = document.getElementById("player-cover");
const playPauseBtn = document.getElementById("play-pause-btn");
const coverScreen = document.getElementById("cover-screen");
const giftIcon = document.getElementById("gift-icon");
const tapText = document.getElementById("tap-text");
const popupOverlay = document.getElementById("popup-overlay");
const popupBox = document.getElementById("popup-box");
const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");
const petalsContainer = document.getElementById("petals-container");
const mainContent = document.getElementById("main-content");

const playlist = [
    {
        src: "Something.mp3",
        title: "Something",
        artist: "The Beatles",
        cover: "Ranjena2.jpg"
    },
    {
        src: "countonme.mp3",
        title: "Count on Me",
        artist: "Bruno Mars",
        cover: "Ranjena3.jpg"
    },
    {
        src: "morethanawoman.mp3",
        title: "More Than A Woman",
        artist: "Bee Gees",
        cover: "Ranjena4.jpg"
    }
];

let currentSongIndex = 0;
let isChangingSong = false;

function updatePlayerUI(index) {
    const song = playlist[index];

    if (!song) return;

    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist;

    playerCover.classList.remove("cover-changing");
    void playerCover.offsetWidth;
    playerCover.src = song.cover;
    playerCover.classList.add("cover-changing");

    seekBar.value = 0;
    seekBar.style.setProperty("--progress", "0%");

    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";
}

function loadSong(index, autoplay = false) {
    if (!playlist[index]) return;

    currentSongIndex = index;

    const song = playlist[index];

    isChangingSong = true;

    audio.pause();

    audio.removeAttribute("src");
    audio.load();

    updatePlayerUI(index);

    audio.src = song.src;
    audio.preload = "auto";

    if (autoplay) {
        audio.play()
            .then(() => {
                isChangingSong = false;
                updatePlayButton();
            })
            .catch(() => {
                const playAfterReady = () => {
                    audio.play()
                        .then(() => {
                            isChangingSong = false;
                            updatePlayButton();
                        })
                        .catch(() => {
                            isChangingSong = false;
                            updatePlayButton();
                        });
                };

                audio.addEventListener(
                    "canplay",
                    playAfterReady,
                    { once: true }
                );
            });
    } else {
        audio.load();
        isChangingSong = false;
    }
}

function toggleMusic() {
    if (audio.paused) {
        audio.play()
            .then(() => {
                updatePlayButton();
            })
            .catch(() => {
                updatePlayButton();
            });
    } else {
        audio.pause();
    }
}

function updatePlayButton() {
    if (!playPauseBtn) return;

    playPauseBtn.textContent =
        audio.paused ? "▶" : "Ⅱ";

    playPauseBtn.classList.toggle(
        "is-playing",
        !audio.paused
    );
}

function changeSong(src, title, artist, cover) {
    const index = playlist.findIndex(
        song => song.src === src
    );

    if (index !== -1) {
        loadSong(index, true);
        return;
    }

    audio.pause();

    audio.removeAttribute("src");
    audio.load();

    audio.src = src;
    audio.preload = "auto";

    playerTitle.textContent = title;
    playerArtist.textContent = artist;

    playerCover.classList.remove("cover-changing");
    void playerCover.offsetWidth;

    playerCover.src = cover;
    playerCover.classList.add("cover-changing");

    seekBar.value = 0;
    seekBar.style.setProperty(
        "--progress",
        "0%"
    );

    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";

    audio.load();

    audio.play()
        .then(() => {
            updatePlayButton();
        })
        .catch(() => {
            const playAfterReady = () => {
                audio.play()
                    .then(updatePlayButton)
                    .catch(updatePlayButton);
            };

            audio.addEventListener(
                "canplay",
                playAfterReady,
                { once: true }
            );
        });
}

function nextSong() {
    if (isChangingSong) return;

    let nextIndex =
        currentSongIndex + 1;

    if (nextIndex >= playlist.length) {
        nextIndex = 0;
    }

    loadSong(nextIndex, true);
}

function previousSong() {
    if (isChangingSong) return;

    let previousIndex =
        currentSongIndex - 1;

    if (previousIndex < 0) {
        previousIndex = playlist.length - 1;
    }

    loadSong(previousIndex, true);
}

function formatTime(seconds) {
    if (!isFinite(seconds)) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    return (
        minutes +
        ":" +
        secs.toString().padStart(2, "0")
    );
}

audio.addEventListener(
    "timeupdate",
    () => {

        if (
            !isFinite(audio.duration) ||
            audio.duration <= 0
        ) {
            return;
        }

        const progress =
            (audio.currentTime /
            audio.duration) * 100;

        seekBar.value = progress;

        seekBar.style.setProperty(
            "--progress",
            progress + "%"
        );

        currentTimeEl.textContent =
            formatTime(audio.currentTime);

        durationEl.textContent =
            formatTime(audio.duration);
    }
);

audio.addEventListener(
    "loadedmetadata",
    () => {

        if (
            isFinite(audio.duration) &&
            audio.duration > 0
        ) {
            durationEl.textContent =
                formatTime(audio.duration);
        }

        currentTimeEl.textContent =
            formatTime(audio.currentTime);

        isChangingSong = false;
    }
);

audio.addEventListener(
    "play",
    () => {
        updatePlayButton();
    }
);

audio.addEventListener(
    "pause",
    () => {
        updatePlayButton();
    }
);

audio.addEventListener(
    "playing",
    () => {

        isChangingSong = false;

        if (playPauseBtn) {
            playPauseBtn.classList.remove(
                "is-loading"
            );
        }

        updatePlayButton();
    }
);

audio.addEventListener(
    "waiting",
    () => {

        if (playPauseBtn) {
            playPauseBtn.classList.add(
                "is-loading"
            );
        }
    }
);

audio.addEventListener(
    "canplay",
    () => {

        if (playPauseBtn) {
            playPauseBtn.classList.remove(
                "is-loading"
            );
        }
    }
);

audio.addEventListener(
    "error",
    () => {

        isChangingSong = false;

        if (playPauseBtn) {
            playPauseBtn.classList.remove(
                "is-loading"
            );
        }

        updatePlayButton();
    }
);

audio.addEventListener(
    "ended",
    () => {

        isChangingSong = false;

        nextSong();
    }
);

if (seekBar) {
    seekBar.addEventListener(
        "input",
        () => {

            if (
                !isFinite(audio.duration) ||
                audio.duration <= 0
            ) {
                return;
            }

            const percentage =
                Number(seekBar.value);

            audio.currentTime =
                (percentage / 100) *
                audio.duration;

            seekBar.style.setProperty(
                "--progress",
                percentage + "%"
            );
        }
    );
}

function createPetals() {
    if (!petalsContainer) return;

    petalsContainer.innerHTML = "";

    const flowers = [
        "🌸",
        "🌺",
        "🌹",
        "🌷"
    ];

    for (let i = 0; i < 22; i++) {

        const petal =
            document.createElement("span");

        petal.className = "petal";

        petal.textContent =
            flowers[
                Math.floor(
                    Math.random() *
                    flowers.length
                )
            ];

        petal.style.left =
            Math.random() * 100 + "%";

        petal.style.fontSize =
            12 + Math.random() * 12 + "px";

        petal.style.animationDuration =
            7 + Math.random() * 8 + "s";

        petal.style.animationDelay =
            Math.random() * 8 + "s";

        petal.style.setProperty(
            "--drift",
            -80 +
            Math.random() * 160 +
            "px"
        );

        petalsContainer.appendChild(petal);
    }
}

function createBurst() {
    if (!coverScreen) return;

    const burstLayer =
        document.createElement("div");

    burstLayer.className =
        "burst-layer";

    const emojis = [
        "🌸",
        "🌺",
        "🌹",
        "✨",
        "💖",
        "🤍"
    ];

    for (let i = 0; i < 50; i++) {

        const flower =
            document.createElement("span");

        flower.className =
            "burst-flower";

        flower.textContent =
            emojis[
                Math.floor(
                    Math.random() *
                    emojis.length
                )
            ];

        const angle =
            Math.random() *
            Math.PI * 2;

        const distance =
            100 +
            Math.random() * 380;

        const x =
            Math.cos(angle) *
            distance;

        const y =
            Math.sin(angle) *
            distance;

        flower.style.setProperty(
            "--tx",
            x + "px"
        );

        flower.style.setProperty(
            "--ty",
            y + "px"
        );

        flower.style.setProperty(
            "--rot",
            -360 +
            Math.random() * 720 +
            "deg"
        );

        flower.style.setProperty(
            "--scale",
            0.7 +
            Math.random() * 1.4
        );

        flower.style.setProperty(
            "--delay",
            Math.random() * 0.08 +
            "s"
        );

        burstLayer.appendChild(flower);
    }

    coverScreen.appendChild(
        burstLayer
    );

    requestAnimationFrame(() => {
        burstLayer.classList.add(
            "explode"
        );
    });

    setTimeout(() => {
        burstLayer.remove();
    }, 1800);
}

function openPopup() {
    if (!popupOverlay) return;

    popupOverlay.classList.add("show");

    setTimeout(() => {
        if (popupBox) {
            popupBox.classList.add(
                "popup-pop"
            );
        }
    }, 20);
}

function closePopup() {
    if (!popupOverlay) return;

    if (popupBox) {
        popupBox.classList.remove(
            "popup-pop"
        );
    }

    setTimeout(() => {
        popupOverlay.classList.remove(
            "show"
        );
    }, 250);
}

function moveSkipButton() {
    const container =
        document.querySelector(
            ".popup-buttons"
        );

    if (!container || !btnNo) return;

    const padding = 4;

    const containerWidth =
        container.clientWidth;

    const containerHeight =
        container.clientHeight;

    const buttonWidth =
        btnNo.offsetWidth;

    const buttonHeight =
        btnNo.offsetHeight;

    const maxX =
        Math.max(
            padding,
            containerWidth -
            buttonWidth -
            padding
        );

    const maxY =
        Math.max(
            padding,
            containerHeight -
            buttonHeight -
            padding
        );

    const x =
        padding +
        Math.random() *
        Math.max(0, maxX - padding);

    const y =
        padding +
        Math.random() *
        Math.max(0, maxY - padding);

    btnNo.style.position =
        "absolute";

    btnNo.style.left =
        x + "px";

    btnNo.style.top =
        y + "px";
}

function confirmOpenGift() {
    closePopup();
    executeOpenGift();
}

function executeOpenGift() {
    createBurst();

    if (giftIcon) {
        giftIcon.classList.add(
            "gift-opening"
        );
    }

    if (tapText) {
        tapText.style.opacity = "0";
        tapText.style.transform =
            "translateY(10px)";
    }

    currentSongIndex = 0;

    const song = playlist[0];

    playerTitle.textContent =
        song.title;

    playerArtist.textContent =
        song.artist;

    playerCover.src =
        song.cover;

    audio.pause();

    audio.removeAttribute("src");

    audio.load();

    audio.src =
        song.src;

    audio.preload =
        "auto";

    audio.load();

    audio.play()
        .then(() => {
            updatePlayButton();
        })
        .catch(() => {

            const playWhenReady =
                () => {

                    audio.play()
                        .then(
                            updatePlayButton
                        )
                        .catch(
                            updatePlayButton
                        );
                };

            audio.addEventListener(
                "canplay",
                playWhenReady,
                { once: true }
            );
        });

    setTimeout(() => {

        if (coverScreen) {
            coverScreen.style.opacity =
                "0";

            coverScreen.style.pointerEvents =
                "none";
        }

        if (mainContent) {

            mainContent.style.display =
                "block";

            requestAnimationFrame(() => {

                mainContent.classList.add(
                    "visible"
                );
            });
        }

    }, 650);
}

function nextSection(button) {
    if (!button) return;

    const currentSection =
        button.closest("section");

    if (!currentSection) return;

    const next =
        currentSection.nextElementSibling;

    if (next) {

        next.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

if (giftIcon) {
    giftIcon.addEventListener(
        "click",
        openPopup
    );
}

if (btnYes) {
    btnYes.addEventListener(
        "click",
        confirmOpenGift
    );
}

if (btnNo) {

    btnNo.addEventListener(
        "mouseenter",
        moveSkipButton
    );

    btnNo.addEventListener(
        "click",
        moveSkipButton
    );

    btnNo.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            moveSkipButton();

        },
        {
            passive: false
        }
    );
}

const sections =
    document.querySelectorAll(
        "section"
    );

const sectionObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "in-view"
                        );
                    }
                }
            );

        },
        {
            threshold: 0.2
        }
    );

sections.forEach(
    section => {
        sectionObserver.observe(
            section
        );
    }
);

createPetals();

updatePlayerUI(0);

audio.preload = "auto";
