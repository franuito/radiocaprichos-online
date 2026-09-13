/* =========================================================
   RADIO CAPRICHOS V2
   app.js

   BLOQUE 6A - URBANA POR DEFECTO / MOTOR ESTABLE
   ========================================================= */


/* =========================================================
   01 - CONFIGURACIÓN GENERAL
========================================================= */

const DEFAULT_VOLUME = 0.25;


/* =========================================================
   02 - RADIOS DISPONIBLES
========================================================= */

const RADIOS = {

    main: {
        name: "Radio Caprichos",
        description: "La música que nos une",
        image: "assets/images/stations/radio-caprichos.png",
        stream: "assets/audio/test/test-radio.mp3",
        mode: "test",
        badge: "● MODO TEST",
        quality: "MP3 · TEST"
    },

    urbana: {
        name: "Urbana / Reggaeton",
        description: "Más que música, una misma vibra",
        image: "assets/images/stations/urbana-reggaeton.png",
        stream: "https://c13.radioboss.fm:18182/stream",
        mode: "live",
        badge: "● EN DIRECTO",
        quality: "MP3 · 64 kbps"
    }

};


/* =========================================================
   03 - ELEMENTOS HTML
========================================================= */

const audio =
    document.getElementById("radioAudio");

const playButton =
    document.getElementById("playButton");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

const volumeControl =
    document.getElementById("volumeControl");

const playerStatus =
    document.getElementById("playerStatus");

const equalizer =
    document.getElementById("equalizer");

const trackTitle =
    document.getElementById("trackTitle");

const trackArtist =
    document.getElementById("trackArtist");

const trackMetadata =
    document.getElementById("trackMetadata");

const playerCover =
    document.getElementById("playerCover");

const liveBadge =
    document.getElementById("liveBadge");

const qualityBadge =
    document.getElementById("qualityBadge");

const stationCards =
    document.querySelectorAll(".station-card");


/* =========================================================
   04 - ESTADO
========================================================= */

let selectedRadio = "urbana";

let currentRadio =
    RADIOS.urbana;


/* =========================================================
   05 - VOLUMEN
========================================================= */

audio.volume = DEFAULT_VOLUME;

if (volumeControl) {

    volumeControl.value =
        DEFAULT_VOLUME;

    volumeControl.addEventListener(
        "input",
        () => {

            audio.volume =
                Number(volumeControl.value);

        }
    );

}


/* =========================================================
   06 - FUNCIONES VISUALES
========================================================= */

function setStatus(text) {

    if (playerStatus) {
        playerStatus.textContent = text;
    }

}


function setPlayButton(playing) {

    if (!playButton) {
        return;
    }

    playButton.textContent =
        playing
            ? "❚❚"
            : "▶";

}


function setEqualizer(playing) {

    if (!equalizer) {
        return;
    }

    equalizer.classList.toggle(
        "playing",
        playing
    );

}


function setBadge(text) {

    if (liveBadge) {
        liveBadge.textContent = text;
    }

}


function setQuality(text) {

    if (qualityBadge) {
        qualityBadge.textContent = text;
    }

}


function setMetadata(text = "") {

    if (trackMetadata) {
        trackMetadata.textContent = text;
    }

}


/* =========================================================
   07 - IDENTIFICAR RADIO
========================================================= */

function detectRadio(card) {

    const radioType =
        card.dataset.radio || "";

    const name =
        (
            card.dataset.name || ""
        ).toLowerCase();


    if (
        radioType === "urbana" ||
        name.includes("urbana") ||
        name.includes("reggaeton") ||
        name.includes("reggaetón")
    ) {

        return "urbana";

    }


    if (
        radioType === "main" ||
        name.includes("radio caprichos")
    ) {

        return "main";

    }


    return "coming";

}


/* =========================================================
   08 - CARGAR AUDIO
========================================================= */

function loadCurrentRadio() {

    if (!currentRadio) {
        return;
    }

    audio.pause();

    audio.src =
        currentRadio.stream;

    audio.load();

}


/* =========================================================
   09 - PLAY
========================================================= */

async function playCurrentRadio() {

    if (!currentRadio) {

        setStatus(
            "Esta radio estará disponible próximamente"
        );

        return;

    }


    try {

        setStatus(
            currentRadio.mode === "live"
                ? "Conectando con el stream..."
                : "Cargando audio..."
        );


        await audio.play();


    } catch (error) {

        console.error(
            "Error de reproducción:",
            error
        );


        setPlayButton(false);

        setEqualizer(false);


        setStatus(
            "No se pudo reproducir la radio"
        );

    }

}


/* =========================================================
   10 - PAUSA
========================================================= */

function pauseCurrentRadio() {

    audio.pause();

}


/* =========================================================
   11 - BOTÓN PLAY
========================================================= */

playButton?.addEventListener(
    "click",
    async () => {

        if (!currentRadio) {

            setStatus(
                "Esta radio estará disponible próximamente"
            );

            return;

        }


        if (audio.paused) {

            await playCurrentRadio();

        } else {

            pauseCurrentRadio();

        }

    }
);


/* =========================================================
   12 - EVENTOS AUDIO
========================================================= */

audio.addEventListener(
    "play",
    () => {

        setPlayButton(true);

        setEqualizer(true);


        if (currentRadio?.mode === "live") {

            setStatus(
                currentRadio.name +
                " está sonando EN DIRECTO"
            );

        } else {

            setStatus(
                "Radio Caprichos está sonando · MODO TEST"
            );

        }

    }
);


audio.addEventListener(
    "pause",
    () => {

        setPlayButton(false);

        setEqualizer(false);

    }
);


audio.addEventListener(
    "waiting",
    () => {

        setStatus(
            "Conectando..."
        );

    }
);


audio.addEventListener(
    "playing",
    () => {

        if (!currentRadio) {
            return;
        }


        setStatus(
            currentRadio.mode === "live"
                ? currentRadio.name +
                  " está sonando EN DIRECTO"
                : "Radio Caprichos está sonando · MODO TEST"
        );

    }
);


audio.addEventListener(
    "error",
    () => {

        setPlayButton(false);

        setEqualizer(false);


        setStatus(
            "Error al cargar el audio"
        );

    }
);


/* =========================================================
   13 - CAMBIO DE ESTACIÓN
========================================================= */

stationCards.forEach(
    (card) => {

        card.addEventListener(
            "click",
            () => {

                stationCards.forEach(
                    station => {

                        station.classList.remove(
                            "active"
                        );

                    }
                );


                card.classList.add(
                    "active"
                );


                const radioId =
                    detectRadio(card);


                if (radioId === "coming") {

                    selectedRadio =
                        "coming";

                    currentRadio =
                        null;


                    audio.pause();


                    setPlayButton(false);

                    setEqualizer(false);


                    const name =
                        card.dataset.name || "Radio";

                    const description =
                        card.dataset.description || "";

                    const image =
                        card.dataset.image || "";


                    trackTitle.textContent =
                        name;

                    trackArtist.textContent =
                        description;


                    if (image) {

                        playerCover.src =
                            image;

                        playerCover.alt =
                            name;

                    }


                    setBadge(
                        "PRÓXIMAMENTE"
                    );

                    setQuality(
                        "—"
                    );

                    setMetadata("");

                    setStatus(
                        "Esta radio estará disponible próximamente"
                    );


                    return;

                }


                selectedRadio =
                    radioId;

                currentRadio =
                    RADIOS[radioId];


                trackTitle.textContent =
                    currentRadio.name;

                trackArtist.textContent =
                    currentRadio.description;

                playerCover.src =
                    currentRadio.image;

                playerCover.alt =
                    currentRadio.name;


                setBadge(
                    currentRadio.badge
                );

                setQuality(
                    currentRadio.quality
                );


                if (
                    currentRadio.mode === "live"
                ) {

                    setMetadata(
                        "Metadatos de canción aún no disponibles"
                    );

                    setStatus(
                        "Pulsa ▶ para escuchar Urbana 24/7"
                    );

                } else {

                    setMetadata("");

                    setStatus(
                        "Pulsa ▶ para escuchar · MODO TEST"
                    );

                }


                loadCurrentRadio();

                updateMediaSession();

            }
        );

    }
);


/* =========================================================
   14 - ANTERIOR / SIGUIENTE
========================================================= */

function clickRadioCard(id) {

    const card =
        Array.from(
            stationCards
        ).find(
            item =>
                detectRadio(item) === id
        );


    card?.click();

}


previousButton?.addEventListener(
    "click",
    () => {

        if (selectedRadio === "urbana") {

            clickRadioCard("main");

        } else {

            clickRadioCard("urbana");

        }

    }
);


nextButton?.addEventListener(
    "click",
    () => {

        if (selectedRadio === "main") {

            clickRadioCard("urbana");

        } else {

            clickRadioCard("main");

        }

    }
);


/* =========================================================
   15 - MEDIA SESSION
========================================================= */

function updateMediaSession() {

    if (
        !currentRadio ||
        !("mediaSession" in navigator)
    ) {

        return;

    }


    try {

        const artwork =
            new URL(
                currentRadio.image,
                window.location.href
            ).href;


        navigator.mediaSession.metadata =
            new MediaMetadata({

                title:
                    currentRadio.name,

                artist:
                    currentRadio.description,

                album:
                    "Radio Caprichos",

                artwork: [

                    {
                        src:
                            artwork,

                        sizes:
                            "512x512",

                        type:
                            "image/png"
                    }

                ]

            });

    } catch (error) {

        console.warn(
            "Media Session:",
            error
        );

    }

}


/* =========================================================
   16 - INICIALIZACIÓN
========================================================= */

function initializeRadio() {

    selectedRadio =
        "urbana";

    currentRadio =
        RADIOS.urbana;


    /*
       Al abrir la página hacemos que
       la tarjeta Urbana aparezca activa.
    */

    stationCards.forEach(
        (card) => {

            card.classList.toggle(
                "active",
                detectRadio(card) === "urbana"
            );

        }
    );


    audio.volume =
        DEFAULT_VOLUME;


    if (volumeControl) {

        volumeControl.value =
            DEFAULT_VOLUME;

    }


    trackTitle.textContent =
        currentRadio.name;

    trackArtist.textContent =
        currentRadio.description;

    playerCover.src =
        currentRadio.image;

    playerCover.alt =
        currentRadio.name;


    setBadge(
        currentRadio.badge
    );

    setQuality(
        currentRadio.quality
    );

    setMetadata(
        "Metadatos de canción aún no disponibles"
    );

    setStatus(
        "Pulsa ▶ para escuchar Urbana 24/7"
    );


    loadCurrentRadio();

    updateMediaSession();


    console.log(
        "Radio Caprichos V2 - Urbana preparada por defecto"
    );

}


/* =========================================================
   17 - ARRANQUE
========================================================= */

initializeRadio();