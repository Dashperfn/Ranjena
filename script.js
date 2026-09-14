const audio = document.getElementById('bg-music');

const playPauseBtn =
    document.getElementById('play-pause-btn');

const seekBar =
    document.getElementById('seek-bar');

const currentTimeDisplay =
    document.getElementById('current-time');

const durationDisplay =
    document.getElementById('duration');

const playerCover =
    document.getElementById('player-cover');

const playerTitle =
    document.getElementById('player-title');

const playerArtist =
    document.getElementById('player-artist');

const playlist = [
    {
        src: 'Something.mp3',
        title: 'Something',
        artist: 'The Beatles',
        cover: 'Ranjena2.jpg'
    },
    {
        src: 'countonme.mp3',
        title: 'Count on Me',
        artist: 'Bruno Mars',
        cover: 'Ranjena3.jpg'
    },
    {
        src: 'morethanawoman.mp3',
        title: 'More Than A Woman',
        artist: 'Bee Gees',
        cover: 'Ranjena4.jpg'
    }
];

let currentSongIndex = 0;
let isChangingSong = false;

const preloadedAudio = [];

function preloadPlaylist() {

    playlist.forEach((song, index) => {

        if (index === 0) {
            preloadedAudio[index] = audio;
            return;
        }

        const preloader = new Audio();

        preloader.preload = 'auto';
        preloader.src = song.src;

        preloader.load();

        preloadedAudio[index] = preloader;

    });

}

function updatePlayerUI(song) {

    if (playerTitle) {
        playerTitle.textContent = song.title;
    }

    if (playerArtist) {
        playerArtist.textContent = song.artist;
    }

    if (playerCover) {

        playerCover.classList.remove(
            'cover-changing'
        );

        requestAnimationFrame(() => {

            playerCover.src = song.cover;

            playerCover.classList.add(
                'cover-changing'
            );

        });

    }

}

function toggleMusic() {

    if (!audio) return;

    if (audio.paused) {

        const playPromise = audio.play();

        if (playPromise) {

            playPromise.catch(error => {

                console.log(
                    'Music cannot play:',
                    error
                );

            });

        }

    } else {

        audio.pause();

    }

}

function changeSong(
    songSrc,
    songTitle,
    songArtist,
    coverSrc,
    shouldPlay = true
) {

    if (!audio) return;


    const foundIndex =
        playlist.findIndex(
            song => song.src === songSrc
        );


    if (foundIndex !== -1) {

        currentSongIndex =
            foundIndex;

    }


    const song =
        foundIndex !== -1
            ? playlist[foundIndex]
            : {
                src: songSrc,
                title: songTitle,
                artist: songArtist,
                cover: coverSrc
            };


    updatePlayerUI(song);

    if (
        audio.src.endsWith(songSrc) &&
        !isChangingSong
    ) {

        if (
            shouldPlay &&
            audio.paused
        ) {

            audio.play().catch(
                error =>
                    console.log(
                        'Music cannot play:',
                        error
                    )
            );

        }

        return;

    }


    isChangingSong = true;


    audio.pause();

    audio.src = song.src;

    audio.currentTime = 0;


    if (seekBar) {
        seekBar.value = 0;
    }

    if (currentTimeDisplay) {
        currentTimeDisplay.textContent =
            '0:00';
    }

    if (durationDisplay) {
        durationDisplay.textContent =
            '0:00';
    }


    audio.load();


    let started = false;


    const startPlayback = () => {

        if (started) return;

        started = true;

        isChangingSong = false;


        if (!shouldPlay) return;


        const playPromise =
            audio.play();


        if (playPromise) {

            playPromise.catch(
                error => {

                    console.log(
                        'Music cannot play:',
                        error
                    );

                }
            );

        }

    };

    if (audio.readyState >= 2) {

        startPlayback();

    } else {

        audio.addEventListener(
            'canplay',
            startPlayback,
            {
                once: true
            }
        );


        setTimeout(() => {

            if (!started) {

                startPlayback();

            }

        }, 1200);

    }

}

function nextSong() {

    currentSongIndex =
        (
            currentSongIndex + 1
        ) % playlist.length;


    const song =
        playlist[currentSongIndex];


    changeSong(
        song.src,
        song.title,
        song.artist,
        song.cover,
        true
    );

}

function previousSong() {

    currentSongIndex =
        (
            currentSongIndex -
            1 +
            playlist.length
        ) % playlist.length;


    const song =
        playlist[currentSongIndex];


    changeSong(
        song.src,
        song.title,
        song.artist,
        song.cover,
        true
    );

}

function formatTime(seconds) {

    if (
        isNaN(seconds) ||
        !isFinite(seconds)
    ) {

        return '0:00';

    }


    const minutes =
        Math.floor(seconds / 60);


    let secondsPart =
        Math.floor(seconds % 60);


    if (secondsPart < 10) {

        secondsPart =
            '0' + secondsPart;

    }


    return `${minutes}:${secondsPart}`;

}

if (seekBar) {

    seekBar.addEventListener(
        'input',
        () => {

            if (
                !isNaN(audio.duration) &&
                audio.duration > 0
            ) {

                const seekTime =
                    (
                        seekBar.value / 100
                    ) * audio.duration;


                audio.currentTime =
                    seekTime;


                updateSeekProgress();

            }

        }
    );

}

function updateSeekProgress() {

    if (
        !seekBar ||
        !audio ||
        !audio.duration
    ) {

        return;

    }


    const percent =
        (
            audio.currentTime /
            audio.duration
        ) * 100;


    seekBar.style.setProperty(
        '--progress',
        `${percent}%`
    );

}

if (audio) {


    audio.addEventListener(
        'timeupdate',
        () => {

            if (
                audio.duration &&
                !isNaN(audio.duration)
            ) {

                if (seekBar) {

                    const progressPercent =
                        (
                            audio.currentTime /
                            audio.duration
                        ) * 100;


                    seekBar.value =
                        progressPercent;


                    seekBar.style.setProperty(
                        '--progress',
                        `${progressPercent}%`
                    );

                }


                if (currentTimeDisplay) {

                    currentTimeDisplay.textContent =
                        formatTime(
                            audio.currentTime
                        );

                }


                if (durationDisplay) {

                    durationDisplay.textContent =
                        formatTime(
                            audio.duration
                        );

                }

            }

        }
    );


    audio.addEventListener(
        'loadedmetadata',
        () => {

            if (durationDisplay) {

                durationDisplay.textContent =
                    formatTime(
                        audio.duration
                    );

            }


            updateSeekProgress();

        }
    );


    audio.addEventListener(
        'pause',
        () => {

            if (playPauseBtn) {

                playPauseBtn.textContent =
                    '▶';

                playPauseBtn.classList.remove(
                    'is-playing'
                );

            }

        }
    );


    audio.addEventListener(
        'play',
        () => {

            if (playPauseBtn) {

                playPauseBtn.textContent =
                    '⏸';

                playPauseBtn.classList.add(
                    'is-playing'
                );

            }

        }
    );


    audio.addEventListener(
        'waiting',
        () => {

            if (playPauseBtn) {

                playPauseBtn.classList.add(
                    'is-loading'
                );

            }

        }
    );


    audio.addEventListener(
        'playing',
        () => {

            if (playPauseBtn) {

                playPauseBtn.classList.remove(
                    'is-loading'
                );

            }

        }
    );

    audio.addEventListener(
        'ended',
        () => {

            nextSong();

        }
    );


    audio.addEventListener(
        'error',
        () => {

            isChangingSong = false;

            if (playPauseBtn) {

                playPauseBtn.classList.remove(
                    'is-loading'
                );

            }

        }
    );

}

const petalsContainer =
    document.getElementById(
        'petals-container'
    );


if (petalsContainer) {

    for (
        let i = 0;
        i < 45;
        i++
    ) {

        const petal =
            document.createElement(
                'div'
            );


        petal.classList.add(
            'petal'
        );


        const size =
            Math.random() * 8 + 5;


        petal.style.width =
            size + 'px';


        petal.style.height =
            size * 0.78 + 'px';


        petal.style.left =
            Math.random() * 100 + 'vw';


        petal.style.animationDuration =
            (
                Math.random() * 7 + 7
            ) + 's';


        petal.style.animationDelay =
            Math.random() * 8 + 's';


        petal.style.setProperty(
            '--drift',
            (
                Math.random() * 160 -
                80
            ) + 'px'
        );


        petalsContainer.appendChild(
            petal
        );

    }

}

function createBurst() {

    const emojis = [
        '🌸',
        '🌺',
        '🌹',
        '✨',
        '💖',
        '🤍'
    ];


    const container =
        document.getElementById(
            'cover-screen'
        );


    if (!container) return;


    const burst =
        document.createElement(
            'div'
        );


    burst.className =
        'burst-layer';


    container.appendChild(
        burst
    );


    /*
     * Jumlah emoji dibuat lebih banyak
     * agar efek "meledak" terasa.
     */

    for (
        let i = 0;
        i < 42;
        i++
    ) {

        const flower =
            document.createElement(
                'div'
            );


        flower.textContent =
            emojis[
                Math.floor(
                    Math.random() *
                    emojis.length
                )
            ];


        flower.classList.add(
            'burst-flower'
        );


        const angle =
            Math.random() *
            Math.PI *
            2;


        const distance =
            120 +
            Math.random() *
            Math.min(
                window.innerWidth,
                window.innerHeight
            ) *
            0.42;


        const tx =
            Math.cos(angle) *
            distance;


        const ty =
            Math.sin(angle) *
            distance;


        flower.style.setProperty(
            '--tx',
            `${tx}px`
        );


        flower.style.setProperty(
            '--ty',
            `${ty}px`
        );


        flower.style.setProperty(
            '--rot',
            `${Math.random() * 720 - 360}deg`
        );


        flower.style.setProperty(
            '--scale',
            `${0.55 + Math.random() * 1.25}`
        );


        flower.style.setProperty(
            '--delay',
            `${Math.random() * 90}ms`
        );


        burst.appendChild(
            flower
        );

    }


    requestAnimationFrame(
        () => {

            burst.classList.add(
                'explode'
            );

        }
    );


    setTimeout(
        () => {

            burst.remove();

        },
        1800
    );

}

let isGiftOpened = false;


const popupOverlay =
    document.getElementById(
        'popup-overlay'
    );


const popupBox =
    document.getElementById(
        'popup-box'
    );


const btnNo =
    document.getElementById(
        'btn-no'
    );


const coverScreen =
    document.getElementById(
        'cover-screen'
    );


if (coverScreen) {

    coverScreen.addEventListener(
        'click',
        event => {

            if (
                event.target.closest(
                    '#gift-icon'
                ) ||
                event.target.closest(
                    '#tap-text'
                ) ||
                event.target ===
                    coverScreen
            ) {

                showPopup();

            }

        }
    );

}

function showPopup() {

    if (isGiftOpened) return;


    if (popupOverlay) {

        popupOverlay.classList.add(
            'show'
        );


        if (popupBox) {

            popupBox.classList.remove(
                'popup-pop'
            );


            requestAnimationFrame(
                () => {

                    popupBox.classList.add(
                        'popup-pop'
                    );

                }
            );

        }

    }

}

function confirmOpenGift() {

    if (popupOverlay) {

        popupOverlay.classList.remove(
            'show'
        );

    }


    executeOpenGift();

}

function moveButton() {

    if (
        !btnNo ||
        !popupBox
    ) {

        return;

    }


    btnNo.style.position =
        'absolute';


    const boxWidth =
        popupBox.clientWidth;


    const boxHeight =
        popupBox.clientHeight;


    const btnWidth =
        btnNo.clientWidth;


    const btnHeight =
        btnNo.clientHeight;


    const maxX =
        Math.max(
            10,
            boxWidth -
            btnWidth -
            20
        );


    const maxY =
        Math.max(
            10,
            boxHeight -
            btnHeight -
            20
        );


    const randomX =
        Math.floor(
            Math.random() *
            maxX
        ) + 10;


    const randomY =
        Math.floor(
            Math.random() *
            maxY
        ) + 10;


    btnNo.style.left =
        `${randomX}px`;


    btnNo.style.top =
        `${randomY}px`;

}


if (btnNo) {

    btnNo.addEventListener(
        'mouseenter',
        moveButton
    );


    btnNo.addEventListener(
        'touchstart',
        event => {

            event.preventDefault();

            moveButton();

        },
        {
            passive: false
        }
    );

}

function executeOpenGift() {

    if (isGiftOpened) return;


    isGiftOpened = true;

    createBurst();

    changeSong(
        'Something.mp3',
        'Something',
        'The Beatles',
        'Ranjena2.jpg',
        true
    );


    const giftIcon =
        document.getElementById(
            'gift-icon'
        );


    const tapText =
        document.getElementById(
            'tap-text'
        );


    if (giftIcon) {

        giftIcon.classList.add(
            'gift-opening'
        );

    }


    if (tapText) {

        tapText.style.opacity =
            '0';

        tapText.style.transform =
            'translateY(-8px)';

    }


    if (coverScreen) {

        coverScreen.classList.add(
            'opening'
        );


        setTimeout(
            () => {

                coverScreen.style.opacity =
                    '0';


                setTimeout(
                    () => {

                        coverScreen.style.display =
                            'none';


                        const mainContent =
                            document.getElementById(
                                'main-content'
                            );


                        if (mainContent) {

                            mainContent.style.display =
                                'block';


                            requestAnimationFrame(
                                () => {

                                    mainContent.classList.add(
                                        'visible'
                                    );


                                    observeSections();

                                }
                            );

                        }

                    },
                    850
                );

            },
            650
        );

    }

}

function nextSection(btn) {

    if (!btn) return;


    const currentSection =
        btn.closest(
            'section'
        );


    if (!currentSection) return;


    const nextSec =
        currentSection.nextElementSibling;


    if (
        nextSec &&
        nextSec.tagName ===
            'SECTION'
    ) {

        nextSec.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

    }

}

function observeSections() {

    const observerOptions = {

        root: null,

        rootMargin:
            '-8% 0px -8% 0px',

        threshold: 0.18

    };


    const sectionObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                'in-view'
                            );

                        }

                    }
                );

            },
            observerOptions
        );


    document
        .querySelectorAll(
            'section'
        )
        .forEach(
            section => {

                sectionObserver.observe(
                    section
                );

            }
        );

}

preloadPlaylist();

updatePlayerUI(
    playlist[0]
);

if (audio) {

    audio.load();

}

observeSections();
