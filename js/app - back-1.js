/* =========================================================
   RADIO CAPRICHOS V2
   app.js

   BLOQUE 6B
   LA NUEVA 94 + HLS.JS + FALLBACK MP3
   ========================================================= */


/* =========================================================
   01 - CONFIGURACIÓN GENERAL
========================================================= */

const DEFAULT_VOLUME = 0.25;

const HLS_JS_URL =
    "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";


/* =========================================================
   02 - RADIOS DISPONIBLES
========================================================= */

const RADIOS = {

    main: {

        name: "Radio Caprichos",

        description:
            "La música que nos une",

        image:
            "assets/images/stations/radio-caprichos.png",

        stream:
            "assets/audio/test/test-radio.mp3",

        type:
            "mp3",

        mode:
            "test",

        badge:
            "● MODO TEST",

        quality:
            "MP3 · TEST"

    },


    urbana: {

        name:
            "La Nueva 94",

        description:
            "Urbana / Reggaeton · Puerto Rico",

        image:
            "assets/images/stations/urbana-reggaeton.png",

        stream:
            "https://liveaudio.lamusica.com/PR_WODA/playlist.m3u8?aw_0_1st.playerId=lamusica.iheart",

        fallback:
            "https://c13.radioboss.fm:18182/stream",

        type:
            "hls",

        mode:
            "live",

        badge:
            "● EN DIRECTO",

        quality:
            "HLS · LIVE"

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
   04 - ESTADO DEL REPRODUCTOR
========================================================= */

let selectedRadio =
    "urbana";

let currentRadio =
    RADIOS.urbana;

let hls =
    null;

let usingFallback =
    false;

let hlsLibraryPromise =
    null;


/* =========================================================
   05 - VOLUMEN
========================================================= */

audio.volume =
    DEFAULT_VOLUME;


if (volumeControl) {

    volumeControl.value =
        DEFAULT_VOLUME;


    volumeControl.addEventListener(

        "input",

        () => {

            audio.volume =
                Number(
                    volumeControl.value
                );

        }

    );

}


/* =========================================================
   06 - FUNCIONES VISUALES
========================================================= */

function setStatus(text) {

    if (playerStatus) {

        playerStatus.textContent =
            text;

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

        liveBadge.textContent =
            text;

    }

}


function setQuality(text) {

    if (qualityBadge) {

        qualityBadge.textContent =
            text;

    }

}


function setMetadata(text = "") {

    if (trackMetadata) {

        trackMetadata.textContent =
            text;

    }

}


/* =========================================================
   07 - IDENTIFICAR LAS TARJETAS DE RADIO
========================================================= */

function detectRadio(card) {

    const radioType =
        card.dataset.radio || "";

    const name =
        (
            card.dataset.name || ""
        ).toLowerCase();


    /*
       Urbana puede venir identificada
       directamente mediante data-radio.
    */

    if (
        radioType === "urbana" ||
        name.includes("urbana") ||
        name.includes("reggaeton") ||
        name.includes("reggaetón") ||
        name.includes("nueva 94")
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
   08 - DESTRUIR INSTANCIA HLS ANTERIOR
========================================================= */

function destroyHls() {

    if (hls) {

        try {

            hls.destroy();

        } catch (error) {

            console.warn(
                "No se pudo destruir HLS:",
                error
            );

        }

        hls =
            null;

    }

}


/* =========================================================
   09 - LIMPIAR AUDIO ANTERIOR
========================================================= */

function resetAudio() {

    audio.pause();

    destroyHls();


    audio.removeAttribute(
        "src"
    );


    /*
       El HTML original tiene un <source>.
       Al asignar audio.src desde JavaScript,
       nuestro stream tendrá prioridad.
    */

    audio.load();

}


/* =========================================================
   10 - CARGAR HLS.JS DINÁMICAMENTE
========================================================= */

function loadHlsLibrary() {

    /*
       Si HLS.js ya está cargado,
       no volvemos a descargarlo.
    */

    if (
        typeof window.Hls !== "undefined"
    ) {

        return Promise.resolve(
            window.Hls
        );

    }


    /*
       Si ya existe una petición en curso,
       reutilizamos la misma.
    */

    if (hlsLibraryPromise) {

        return hlsLibraryPromise;

    }


    hlsLibraryPromise =
        new Promise(
            (resolve, reject) => {

                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    HLS_JS_URL;


                script.async =
                    true;


                script.onload =
                    () => {

                        if (
                            typeof window.Hls !==
                            "undefined"
                        ) {

                            resolve(
                                window.Hls
                            );

                        } else {

                            reject(
                                new Error(
                                    "HLS.js no está disponible"
                                )
                            );

                        }

                    };


                script.onerror =
                    () => {

                        hlsLibraryPromise =
                            null;


                        reject(
                            new Error(
                                "No se pudo cargar HLS.js"
                            )
                        );

                    };


                document.head.appendChild(
                    script
                );

            }
        );


    return hlsLibraryPromise;

}


/* =========================================================
   11 - CARGAR MP3
========================================================= */

function loadMp3(url) {

    destroyHls();


    audio.pause();

    audio.src =
        url;

    audio.load();

}


/* =========================================================
   12 - FALLBACK URBANA
========================================================= */

async function activateFallback(
    shouldPlay = false
) {

    if (
        !currentRadio ||
        selectedRadio !== "urbana"
    ) {

        return;

    }


    /*
       Evitamos entrar varias veces
       en el fallback.
    */

    if (usingFallback) {

        return;

    }


    usingFallback =
        true;


    console.warn(
        "La Nueva 94 no está disponible. Activando respaldo MP3."
    );


    setQuality(
        "MP3 · RESPALDO"
    );


    setMetadata(
        "Stream alternativo de Urbana"
    );


    setStatus(
        "La Nueva 94 no respondió · conectando radio urbana de respaldo..."
    );


    loadMp3(
        currentRadio.fallback
    );


    if (shouldPlay) {

        try {

            await audio.play();

        } catch (error) {

            console.error(
                "Error fallback:",
                error
            );


            setStatus(
                "No se pudo iniciar el stream de respaldo"
            );

        }

    }

}


/* =========================================================
   13 - PREPARAR LA NUEVA 94
========================================================= */

async function prepareHlsStream(
    shouldPlay = false
) {

    destroyHls();

    usingFallback =
        false;


    const streamUrl =
        currentRadio.stream;


    /*
       Safari / iPhone / algunos navegadores
       pueden reproducir HLS directamente.
    */

    const nativeHls =
        audio.canPlayType(
            "application/vnd.apple.mpegurl"
        );


    if (nativeHls) {

        console.log(
            "Radio Caprichos: HLS nativo"
        );


        audio.src =
            streamUrl;

        audio.load();


        if (shouldPlay) {

            try {

                await audio.play();

            } catch (error) {

                console.error(
                    "Error HLS nativo:",
                    error
                );


                await activateFallback(
                    true
                );

            }

        }


        return;

    }


    /*
       Chrome / Edge / Firefox:
       cargamos HLS.js.
    */

    try {

        setStatus(
            shouldPlay
                ? "Conectando con La Nueva 94..."
                : "La Nueva 94 preparada · pulsa ▶ para escuchar"
        );


        const HlsClass =
            await loadHlsLibrary();


        /*
           El usuario puede haber cambiado
           de estación mientras cargaba HLS.js.
           */

        if (
            selectedRadio !== "urbana" ||
            currentRadio !== RADIOS.urbana
        ) {

            return;

        }


        if (
            !HlsClass.isSupported()
        ) {

            console.warn(
                "HLS.js no compatible"
            );


            await activateFallback(
                shouldPlay
            );


            return;

        }


        hls =
            new HlsClass({

                enableWorker:
                    true,

                lowLatencyMode:
                    false

            });


        hls.loadSource(
            streamUrl
        );


        hls.attachMedia(
            audio
        );


        hls.on(

            HlsClass.Events.MANIFEST_PARSED,

            async () => {

                console.log(
                    "La Nueva 94: manifiesto HLS cargado"
                );


                setQuality(
                    "HLS · LIVE"
                );


                setStatus(
                    shouldPlay
                        ? "La Nueva 94 lista"
                        : "Pulsa ▶ para escuchar La Nueva 94"
                );


                if (shouldPlay) {

                    try {

                        await audio.play();

                    } catch (error) {

                        console.error(
                            "Error al iniciar La Nueva 94:",
                            error
                        );


                        await activateFallback(
                            true
                        );

                    }

                }

            }

        );


        hls.on(

            HlsClass.Events.ERROR,

            async (
                event,
                data
            ) => {

                console.error(
                    "Error HLS:",
                    data
                );


                /*
                   Los errores no fatales
                   pueden recuperarse solos.
                */

                if (!data.fatal) {

                    return;

                }


                /*
                   Error fatal:
                   usamos el stream MP3
                   que ya sabemos que funciona.
                */

                destroyHls();


                await activateFallback(
                    shouldPlay
                );

            }

        );


    } catch (error) {

        console.error(
            "No se pudo preparar HLS:",
            error
        );


        await activateFallback(
            shouldPlay
        );

    }

}


/* =========================================================
   14 - CARGAR RADIO ACTUAL
========================================================= */

async function loadCurrentRadio() {

    if (!currentRadio) {

        return;

    }


    audio.pause();

    destroyHls();

    usingFallback =
        false;


    if (
        currentRadio.type === "hls"
    ) {

        await prepareHlsStream(
            false
        );

        return;

    }


    loadMp3(
        currentRadio.stream
    );

}


/* =========================================================
   15 - REPRODUCIR RADIO
========================================================= */

async function playCurrentRadio() {

    if (!currentRadio) {

        setStatus(
            "Esta radio estará disponible próximamente"
        );

        return;

    }


    /*
       LA NUEVA 94
    */

    if (
        selectedRadio === "urbana" &&
        currentRadio.type === "hls"
    ) {

        /*
           Si ya estamos usando fallback,
           simplemente reproducimos MP3.
        */

        if (usingFallback) {

            try {

                await audio.play();

            } catch (error) {

                console.error(
                    "Error reproduciendo respaldo:",
                    error
                );

            }


            return;

        }


        /*
           Si HLS ya está preparado,
           intentamos reproducirlo.
        */

        if (
            hls ||
            audio.canPlayType(
                "application/vnd.apple.mpegurl"
            )
        ) {

            try {

                setStatus(
                    "Conectando con La Nueva 94..."
                );


                await audio.play();


                return;

            } catch (error) {

                console.error(
                    "La Nueva 94 no inició:",
                    error
                );


                await activateFallback(
                    true
                );


                return;

            }

        }


        /*
           Si todavía no está preparado,
           lo preparamos y reproducimos.
        */

        await prepareHlsStream(
            true
        );


        return;

    }


    /*
       RADIO CAPRICHOS TEST
    */

    try {

        setStatus(
            "Cargando audio..."
        );


        await audio.play();


    } catch (error) {

        console.error(
            "Error de reproducción:",
            error
        );


        setPlayButton(
            false
        );


        setEqualizer(
            false
        );


        setStatus(
            "No se pudo reproducir la radio"
        );

    }

}


/* =========================================================
   16 - PAUSAR RADIO
========================================================= */

function pauseCurrentRadio() {

    audio.pause();

}


/* =========================================================
   17 - BOTÓN PLAY
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
   18 - EVENTOS DEL AUDIO
========================================================= */

audio.addEventListener(

    "play",

    () => {

        setPlayButton(
            true
        );


        setEqualizer(
            true
        );

    }

);


audio.addEventListener(

    "playing",

    () => {

        setPlayButton(
            true
        );


        setEqualizer(
            true
        );


        if (!currentRadio) {

            return;

        }


        if (
            selectedRadio === "urbana"
        ) {

            if (usingFallback) {

                setStatus(
                    "Urbana / Reggaeton está sonando · STREAM DE RESPALDO"
                );


                setQuality(
                    "MP3 · RESPALDO"
                );

            } else {

                setStatus(
                    "La Nueva 94 está sonando EN DIRECTO"
                );


                setQuality(
                    "HLS · LIVE"
                );

            }


            return;

        }


        setStatus(
            "Radio Caprichos está sonando · MODO TEST"
        );

    }

);


audio.addEventListener(

    "pause",

    () => {

        setPlayButton(
            false
        );


        setEqualizer(
            false
        );

    }

);


audio.addEventListener(

    "waiting",

    () => {

        if (
            selectedRadio === "urbana"
        ) {

            setStatus(
                usingFallback
                    ? "Cargando stream urbano de respaldo..."
                    : "Conectando con La Nueva 94..."
            );

        } else {

            setStatus(
                "Cargando..."
            );

        }

    }

);


audio.addEventListener(

    "error",

    async () => {

        /*
           Si La Nueva 94 genera un error
           y todavía no estamos en fallback,
           probamos el MP3 alternativo.
        */

        if (
            selectedRadio === "urbana" &&
            currentRadio === RADIOS.urbana &&
            !usingFallback
        ) {

            await activateFallback(
                true
            );


            return;

        }


        setPlayButton(
            false
        );


        setEqualizer(
            false
        );


        setStatus(
            "Error al cargar el audio"
        );

    }

);


/* =========================================================
   19 - CAMBIO DE ESTACIÓN
========================================================= */

stationCards.forEach(

    (card) => {

        card.addEventListener(

            "click",

            async () => {

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
                    detectRadio(
                        card
                    );


                /*
                   RADIO PRÓXIMAMENTE
                */

                if (
                    radioId === "coming"
                ) {

                    selectedRadio =
                        "coming";

                    currentRadio =
                        null;


                    resetAudio();


                    setPlayButton(
                        false
                    );


                    setEqualizer(
                        false
                    );


                    const name =
                        card.dataset.name ||
                        "Radio";


                    const description =
                        card.dataset.description ||
                        "";


                    const image =
                        card.dataset.image ||
                        "";


                    if (trackTitle) {

                        trackTitle.textContent =
                            name;

                    }


                    if (trackArtist) {

                        trackArtist.textContent =
                            description;

                    }


                    if (
                        playerCover &&
                        image
                    ) {

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


                    setMetadata(
                        ""
                    );


                    setStatus(
                        "Esta radio estará disponible próximamente"
                    );


                    return;

                }


                /*
                   RADIO DISPONIBLE
                */

                selectedRadio =
                    radioId;


                currentRadio =
                    RADIOS[
                        radioId
                    ];


                if (trackTitle) {

                    trackTitle.textContent =
                        currentRadio.name;

                }


                if (trackArtist) {

                    trackArtist.textContent =
                        currentRadio.description;

                }


                if (playerCover) {

                    playerCover.src =
                        currentRadio.image;

                    playerCover.alt =
                        currentRadio.name;

                }


                setBadge(
                    currentRadio.badge
                );


                setQuality(
                    currentRadio.quality
                );


                if (
                    radioId === "urbana"
                ) {

                    setMetadata(
                        "Stream oficial La Nueva 94"
                    );


                    setStatus(
                        "Preparando La Nueva 94..."
                    );

                } else {

                    setMetadata(
                        ""
                    );


                    setStatus(
                        "Pulsa ▶ para escuchar · MODO TEST"
                    );

                }


                await loadCurrentRadio();


                updateMediaSession();

            }

        );

    }

);


/* =========================================================
   20 - ANTERIOR / SIGUIENTE
========================================================= */

function clickRadioCard(id) {

    const card =
        Array.from(
            stationCards
        ).find(

            item =>
                detectRadio(
                    item
                ) === id

        );


    card?.click();

}


previousButton?.addEventListener(

    "click",

    () => {

        if (
            selectedRadio === "urbana"
        ) {

            clickRadioCard(
                "main"
            );

        } else {

            clickRadioCard(
                "urbana"
            );

        }

    }

);


nextButton?.addEventListener(

    "click",

    () => {

        if (
            selectedRadio === "main"
        ) {

            clickRadioCard(
                "urbana"
            );

        } else {

            clickRadioCard(
                "main"
            );

        }

    }

);


/* =========================================================
   21 - MEDIA SESSION
   iPHONE / ANDROID / LOCK SCREEN
========================================================= */

function updateMediaSession() {

    if (
        !currentRadio ||
        !(
            "mediaSession"
            in navigator
        )
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


        /*
           Botón PLAY del sistema
        */

        navigator.mediaSession.setActionHandler(

            "play",

            async () => {

                await playCurrentRadio();

            }

        );


        /*
           Botón PAUSA del sistema
        */

        navigator.mediaSession.setActionHandler(

            "pause",

            () => {

                pauseCurrentRadio();

            }

        );


    } catch (error) {

        console.warn(
            "Media Session:",
            error
        );

    }

}


/* =========================================================
   22 - INICIALIZACIÓN
========================================================= */

async function initializeRadio() {

    /*
       LA NUEVA 94
       es nuestra radio urbana
       seleccionada por defecto.
    */

    selectedRadio =
        "urbana";


    currentRadio =
        RADIOS.urbana;


    usingFallback =
        false;


    /*
       Seleccionamos visualmente
       la tarjeta Urbana.
    */

    stationCards.forEach(

        (card) => {

            card.classList.toggle(

                "active",

                detectRadio(
                    card
                ) === "urbana"

            );

        }

    );


    /*
       Volumen inicial 25 %
    */

    audio.volume =
        DEFAULT_VOLUME;


    if (volumeControl) {

        volumeControl.value =
            DEFAULT_VOLUME;

    }


    /*
       Información del player
    */

    if (trackTitle) {

        trackTitle.textContent =
            currentRadio.name;

    }


    if (trackArtist) {

        trackArtist.textContent =
            currentRadio.description;

    }


    if (playerCover) {

        playerCover.src =
            currentRadio.image;

        playerCover.alt =
            currentRadio.name;

    }


    setBadge(
        currentRadio.badge
    );


    setQuality(
        currentRadio.quality
    );


    setMetadata(
        "Stream oficial La Nueva 94"
    );


    setStatus(
        "Preparando La Nueva 94..."
    );


    /*
       Preparamos HLS,
       pero NO reproducimos automáticamente.
    */

    await loadCurrentRadio();


    updateMediaSession();


    console.log(
        "Radio Caprichos V2"
    );


    console.log(
        "La Nueva 94 preparada como Urbana"
    );

}


/* =========================================================
   23 - ARRANQUE
========================================================= */

initializeRadio();