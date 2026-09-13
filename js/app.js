/* =========================================================
   RADIO CAPRICHOS V2
   app.js

   BLOQUE 6C.2
   HLS ESTABLE + NOW PLAYING PRECISO

   AUDIO:
   - La Nueva 94 por HLS
   - fallback MP3 únicamente si falla AUDIO

   METADATA:
   - módulo independiente
   - busca específicamente la fila LIVE
   - ignora DJs, promos y station breaks
   ========================================================= */


/* =========================================================
   01 - CONFIGURACIÓN GENERAL
========================================================= */

const DEFAULT_VOLUME = 0.25;

const HLS_JS_URL =
    "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";


/* =========================================================
   01.1 - CONFIGURACIÓN NOW PLAYING
========================================================= */

const NOW_PLAYING_URL =
    "https://onlineradiobox.com/pr/woda/?lang=en";

const NOW_PLAYING_INTERVAL =
    30000;


const METADATA_PROXIES = [

    url =>
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,

    url =>
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`

];


/* =========================================================
   02 - RADIOS DISPONIBLES
========================================================= */

const RADIOS = {

    main: {

        name:
            "Radio Caprichos",

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
   04.1 - ESTADO NOW PLAYING
========================================================= */

let nowPlayingTimer =
    null;

let lastNowPlaying =
    "";


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
   07 - IDENTIFICAR TARJETAS
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
   08 - DESTRUIR HLS
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
   09 - RESET AUDIO
========================================================= */

function resetAudio() {

    audio.pause();

    destroyHls();

    audio.removeAttribute(
        "src"
    );

    audio.load();

}


/* =========================================================
   10 - CARGAR HLS.JS
========================================================= */

function loadHlsLibrary() {

    if (
        typeof window.Hls !==
        "undefined"
    ) {

        return Promise.resolve(
            window.Hls
        );

    }


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
   12 - FALLBACK DE AUDIO
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


    if (usingFallback) {

        return;

    }


    usingFallback =
        true;


    console.warn(
        "La Nueva 94 no respondió. Activando respaldo MP3."
    );


    setQuality(
        "MP3 · RESPALDO"
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
   13 - PREPARAR HLS
========================================================= */

async function prepareHlsStream(
    shouldPlay = false
) {

    destroyHls();

    usingFallback =
        false;


    const streamUrl =
        currentRadio.stream;


    const nativeHls =
        audio.canPlayType(
            "application/vnd.apple.mpegurl"
        );


    if (nativeHls) {

        audio.src =
            streamUrl;

        audio.load();


        if (shouldPlay) {

            try {

                await audio.play();

            } catch (error) {

                await activateFallback(
                    true
                );

            }

        }


        return;

    }


    try {

        setStatus(

            shouldPlay
                ? "Conectando con La Nueva 94..."
                : "La Nueva 94 preparada · pulsa ▶ para escuchar"

        );


        const HlsClass =
            await loadHlsLibrary();


        if (
            selectedRadio !== "urbana" ||
            currentRadio !== RADIOS.urbana
        ) {

            return;

        }


        if (
            !HlsClass.isSupported()
        ) {

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


                if (!data.fatal) {

                    return;

                }


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
   14 - CARGAR RADIO
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
   15 - REPRODUCIR
========================================================= */

async function playCurrentRadio() {

    if (!currentRadio) {

        setStatus(
            "Esta radio estará disponible próximamente"
        );

        return;

    }


    if (
        selectedRadio === "urbana" &&
        currentRadio.type === "hls"
    ) {

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

                await activateFallback(
                    true
                );


                return;

            }

        }


        await prepareHlsStream(
            true
        );


        return;

    }


    try {

        await audio.play();

    } catch (error) {

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
   16 - PAUSAR
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
   18 - EVENTOS AUDIO
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

        }

    }

);


audio.addEventListener(

    "error",

    async () => {

        /*
           SOLO ERRORES DE AUDIO.
           METADATA NO LLAMA A ESTO.
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


        setStatus(
            "Error al cargar el audio"
        );

    }

);


/* =========================================================
   19 - NOW PLAYING
========================================================= */


/* =========================================================
   19.1 - DECODIFICAR HTML
========================================================= */

function decodeHtml(text) {

    if (!text) {

        return "";

    }


    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.innerHTML =
        text;


    return textarea.value;

}


/* =========================================================
   19.2 - LIMPIAR TEXTO
========================================================= */

function cleanSongName(text) {

    if (!text) {

        return "";

    }


    return decodeHtml(
        String(text)
    )

        .replace(
            /\u00a0/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .replace(
            /^\s*live\s*[:|\-]?\s*/i,
            ""
        )

        .replace(
            /^\s*en directo\s*[:|\-]?\s*/i,
            ""
        )

        .replace(
            /^\s*\d{1,2}:\d{2}\s*[:|\-]?\s*/,
            ""
        )

        .trim();

}


/* =========================================================
   19.3 - SABER SI ES UNA CANCIÓN VÁLIDA
========================================================= */

function isRealSong(text) {

    if (!text) {

        return false;

    }


    const value =
        cleanSongName(
            text
        );


    const lower =
        value.toLowerCase();


    /*
       No aceptamos textos demasiado cortos.
    */

    if (
        value.length < 5
    ) {

        return false;

    }


    /*
       Tampoco textos enormes de la página.
    */

    if (
        value.length > 180
    ) {

        return false;

    }


    /*
       LOCUTORES / DJs
    */

    if (
        /^dj\s+/i.test(
            value
        )
    ) {

        return false;

    }


    if (
        /\bdj koby\b/i.test(
            value
        )
    ) {

        return false;

    }


    /*
       TEXTOS NO MUSICALES
    */

    const blockedWords = [

        "station break",

        "we'll be right back",

        "well be right back",

        "after this message",

        "commercial",

        "advertisement",

        "publicidad",

        "promo",

        "sweeper",

        "woda station",

        "radio host",

        "locutor",

        "presentador",

        "on air personality",

        "la #1 en musica nueva",

        "la #1 en música nueva",

        "listen live",

        "escuchar en vivo",

        "on the air la nueva",

        "en directo ahora la nueva",

        "la nueva 94 fm playlist",

        "top songs",

        "top canciones"

    ];


    if (
        blockedWords.some(

            word =>
                lower.includes(
                    word
                )

        )
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   19.4 - EXTRAER FILA LIVE DE LA TABLA
========================================================= */

function extractLiveTableSong(doc) {

    /*
       Online Radio Box muestra normalmente:

       Live | ARTISTA / CANCIÓN

       Por eso buscamos específicamente
       una fila cuya primera celda sea LIVE.
    */

    const rows =
        doc.querySelectorAll(
            "table tr"
        );


    for (
        const row
        of rows
    ) {

        const cells =
            Array.from(
                row.querySelectorAll(
                    "td"
                )
            );


        if (
            cells.length < 2
        ) {

            continue;

        }


        const time =
            cleanSongName(
                cells[0].textContent
            );


        const candidate =
            cleanSongName(
                cells
                    .slice(1)
                    .map(
                        cell =>
                            cell.textContent
                    )
                    .join(" ")
            );


        const isLiveRow =
            /^live$/i.test(
                time
            ) ||
            /^en directo$/i.test(
                time
            ) ||
            /^ahora$/i.test(
                time
            );


        if (
            isLiveRow &&
            isRealSong(
                candidate
            )
        ) {

            return candidate;

        }

    }


    return "";

}


/* =========================================================
   19.5 - EXTRAER DESDE LA SECCIÓN "ON THE AIR"
========================================================= */

function extractOnAirSectionSong(doc) {

    const headings =
        Array.from(
            doc.querySelectorAll(
                "h1, h2, h3, h4"
            )
        );


    const heading =
        headings.find(

            element => {

                const text =
                    cleanSongName(
                        element.textContent
                    ).toLowerCase();


                return (
                    text.includes(
                        "on the air la nueva 94"
                    ) ||
                    text.includes(
                        "en directo ahora la nueva 94"
                    )
                );

            }

        );


    if (!heading) {

        return "";

    }


    /*
       Desde el título avanzamos por los
       siguientes elementos hasta localizar
       una tabla.
    */

    let element =
        heading.nextElementSibling;


    let steps =
        0;


    while (
        element &&
        steps < 10
    ) {

        /*
           Puede ser directamente TABLE.
        */

        if (
            element.tagName === "TABLE"
        ) {

            const rows =
                element.querySelectorAll(
                    "tr"
                );


            for (
                const row
                of rows
            ) {

                const cells =
                    Array.from(
                        row.querySelectorAll(
                            "td"
                        )
                    );


                if (
                    cells.length < 2
                ) {

                    continue;

                }


                const first =
                    cleanSongName(
                        cells[0].textContent
                    );


                const song =
                    cleanSongName(
                        cells
                            .slice(1)
                            .map(
                                cell =>
                                    cell.textContent
                            )
                            .join(" ")
                    );


                if (
                    (
                        /^live$/i.test(first) ||
                        /^en directo$/i.test(first)
                    ) &&
                    isRealSong(song)
                ) {

                    return song;

                }

            }

        }


        /*
           Puede contener una tabla dentro.
        */

        const table =
            element.querySelector?.(
                "table"
            );


        if (table) {

            const rows =
                table.querySelectorAll(
                    "tr"
                );


            for (
                const row
                of rows
            ) {

                const cells =
                    Array.from(
                        row.querySelectorAll(
                            "td"
                        )
                    );


                if (
                    cells.length < 2
                ) {

                    continue;

                }


                const first =
                    cleanSongName(
                        cells[0].textContent
                    );


                const song =
                    cleanSongName(
                        cells
                            .slice(1)
                            .map(
                                cell =>
                                    cell.textContent
                            )
                            .join(" ")
                    );


                if (
                    (
                        /^live$/i.test(first) ||
                        /^en directo$/i.test(first)
                    ) &&
                    isRealSong(song)
                ) {

                    return song;

                }

            }

        }


        element =
            element.nextElementSibling;


        steps++;

    }


    return "";

}


/* =========================================================
   19.6 - EXTRAER DESDE TEXTO PLANO
========================================================= */

function extractFromPlainText(doc) {

    const text =
        doc.body?.innerText || "";


    if (!text) {

        return "";

    }


    const rawLines =
        text

            .split(/\r?\n/)

            .map(
                line =>
                    line.trim()
            )

            .filter(
                Boolean
            );


    /*
       Localizamos exactamente el título
       "On the air La Nueva 94 FM".
    */

    let markerIndex =
        -1;


    for (
        let i = 0;
        i < rawLines.length;
        i++
    ) {

        const lower =
            rawLines[i]
                .toLowerCase();


        if (
            lower.includes(
                "on the air la nueva 94"
            ) ||
            lower.includes(
                "en directo ahora la nueva 94"
            )
        ) {

            markerIndex =
                i;

            break;

        }

    }


    if (
        markerIndex === -1
    ) {

        return "";

    }


    /*
       Revisamos únicamente una pequeña zona
       después del encabezado.

       No recorremos toda la página.
       Así no recogemos DJs como DJ Koby.
    */

    const end =
        Math.min(
            markerIndex + 12,
            rawLines.length
        );


    for (
        let i =
            markerIndex + 1;

        i < end;

        i++
    ) {

        const line =
            rawLines[i];


        /*
           CASO:
           Live | Ozuna ZIZI
        */

        const liveSameLine =
            line.match(
                /^(?:live|en directo)\s*[|:\-]?\s*(.+)$/i
            );


        if (
            liveSameLine &&
            liveSameLine[1]
        ) {

            const candidate =
                cleanSongName(
                    liveSameLine[1]
                );


            if (
                isRealSong(
                    candidate
                )
            ) {

                return candidate;

            }

        }


        /*
           CASO:
           una línea dice "Live"
           y la siguiente contiene la canción.
        */

        if (
            /^(live|en directo)$/i.test(
                line
            )
        ) {

            for (
                let j = i + 1;
                j < Math.min(
                    i + 4,
                    end
                );
                j++
            ) {

                const candidate =
                    cleanSongName(
                        rawLines[j]
                    );


                if (
                    isRealSong(
                        candidate
                    )
                ) {

                    return candidate;

                }

            }

        }

    }


    return "";

}


/* =========================================================
   19.7 - EXTRACTOR PRINCIPAL
========================================================= */

function extractNowPlaying(html) {

    if (!html) {

        return "";

    }


    try {

        const parser =
            new DOMParser();


        const doc =
            parser.parseFromString(
                html,
                "text/html"
            );


        /*
           MÉTODO 1
           Buscar la fila LIVE de las tablas.
        */

        const tableSong =
            extractLiveTableSong(
                doc
            );


        if (tableSong) {

            console.log(
                "Now Playing encontrado por TABLE:",
                tableSong
            );


            return tableSong;

        }


        /*
           MÉTODO 2
           Buscar exclusivamente dentro
           de "On the air La Nueva 94 FM".
        */

        const sectionSong =
            extractOnAirSectionSong(
                doc
            );


        if (sectionSong) {

            console.log(
                "Now Playing encontrado por SECTION:",
                sectionSong
            );


            return sectionSong;

        }


        /*
           MÉTODO 3
           Fallback texto plano,
           pero únicamente alrededor de
           la sección "On the air".
        */

        const textSong =
            extractFromPlainText(
                doc
            );


        if (textSong) {

            console.log(
                "Now Playing encontrado por TEXT:",
                textSong
            );


            return textSong;

        }


    } catch (error) {

        console.warn(
            "Error analizando Now Playing:",
            error
        );

    }


    return "";

}


/* =========================================================
   19.8 - OBTENER HTML DE METADATA
========================================================= */

async function fetchMetadataHtml() {

    /*
       Intento directo.
    */

    try {

        const direct =
            await fetch(

                NOW_PLAYING_URL,

                {

                    cache:
                        "no-store"

                }

            );


        if (direct.ok) {

            const html =
                await direct.text();


            if (
                html &&
                html.length > 100
            ) {

                return html;

            }

        }


    } catch (error) {

        console.log(
            "Metadata directa bloqueada. Probando proxy..."
        );

    }


    /*
       Intentamos proxies.

       IMPORTANTE:
       ninguno tiene relación con el AUDIO.
    */

    for (
        const buildProxyUrl
        of METADATA_PROXIES
    ) {

        try {

            const proxyUrl =
                buildProxyUrl(
                    NOW_PLAYING_URL
                );


            const response =
                await fetch(

                    proxyUrl,

                    {

                        cache:
                            "no-store"

                    }

                );


            if (!response.ok) {

                continue;

            }


            const html =
                await response.text();


            if (
                html &&
                html.length > 100
            ) {

                return html;

            }


        } catch (error) {

            console.warn(
                "Proxy metadata no disponible:",
                error
            );

        }

    }


    return "";

}


/* =========================================================
   19.9 - ACTUALIZAR NOW PLAYING
========================================================= */

async function updateNowPlaying() {

    if (
        selectedRadio !== "urbana"
    ) {

        return;

    }


    try {

        const html =
            await fetchMetadataHtml();


        /*
           SI FALLA METADATA:
           no tocar HLS,
           no tocar audio,
           no activar fallback.
        */

        if (!html) {

            console.warn(
                "Now Playing: fuente no disponible"
            );


            if (!lastNowPlaying) {

                setMetadata(
                    "🎵 Información de canción no disponible"
                );

            }


            return;

        }


        const song =
            extractNowPlaying(
                html
            );


        /*
           Si estamos en una pausa publicitaria
           o no encontramos un track válido,
           mantenemos la última canción buena.
        */

        if (!song) {

            console.log(
                "Now Playing: sin canción válida. Conservando anterior."
            );


            if (!lastNowPlaying) {

                setMetadata(
                    "🎵 Esperando información de la canción..."
                );

            }


            return;

        }


        /*
           Si no cambió, no hacemos nada.
        */

        if (
            song === lastNowPlaying
        ) {

            return;

        }


        lastNowPlaying =
            song;


        console.log(
            "🎵 CANCIÓN ACTUAL:",
            song
        );


        setMetadata(
            `🎵 ${song}`
        );


        updateMediaSession(
            song
        );


    } catch (error) {

        console.warn(
            "Now Playing error:",
            error
        );

    }

}


/* =========================================================
   19.10 - INICIAR NOW PLAYING
========================================================= */

function startNowPlaying() {

    stopNowPlaying();


    lastNowPlaying =
        "";


    setMetadata(
        "🎵 Buscando canción actual..."
    );


    updateNowPlaying();


    nowPlayingTimer =
        setInterval(

            updateNowPlaying,

            NOW_PLAYING_INTERVAL

        );

}


/* =========================================================
   19.11 - DETENER NOW PLAYING
========================================================= */

function stopNowPlaying() {

    if (nowPlayingTimer) {

        clearInterval(
            nowPlayingTimer
        );


        nowPlayingTimer =
            null;

    }

}


/* =========================================================
   20 - CAMBIO DE ESTACIÓN
========================================================= */

stationCards.forEach(

    card => {

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


                /* -----------------------------------------
                   PRÓXIMAMENTE
                ----------------------------------------- */

                if (
                    radioId === "coming"
                ) {

                    selectedRadio =
                        "coming";

                    currentRadio =
                        null;


                    stopNowPlaying();

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


                /* -----------------------------------------
                   RADIO DISPONIBLE
                ----------------------------------------- */

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

                    startNowPlaying();

                } else {

                    stopNowPlaying();


                    setMetadata(
                        ""
                    );

                }


                setStatus(

                    radioId === "urbana"
                        ? "Preparando La Nueva 94..."
                        : "Pulsa ▶ para escuchar · MODO TEST"

                );


                await loadCurrentRadio();


                updateMediaSession();

            }

        );

    }

);


/* =========================================================
   21 - ANTERIOR / SIGUIENTE
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
   22 - MEDIA SESSION
========================================================= */

function updateMediaSession(
    song = ""
) {

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
                    song ||
                    currentRadio.name,


                artist:

                    song
                        ? currentRadio.name
                        : currentRadio.description,


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


        navigator.mediaSession.setActionHandler(

            "play",

            async () => {

                await playCurrentRadio();

            }

        );


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
   23 - INICIALIZACIÓN
========================================================= */

async function initializeRadio() {

    selectedRadio =
        "urbana";


    currentRadio =
        RADIOS.urbana;


    usingFallback =
        false;


    stationCards.forEach(

        card => {

            card.classList.toggle(

                "active",

                detectRadio(
                    card
                ) === "urbana"

            );

        }

    );


    audio.volume =
        DEFAULT_VOLUME;


    if (volumeControl) {

        volumeControl.value =
            DEFAULT_VOLUME;

    }


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


    setStatus(
        "Preparando La Nueva 94..."
    );


    /*
       AUDIO HLS
    */

    await loadCurrentRadio();


    /*
       METADATA AISLADA
    */

    startNowPlaying();


    /*
       MEDIA SESSION
    */

    updateMediaSession();


    console.log(
        "Radio Caprichos V2 · BLOQUE 6C.2"
    );


    console.log(
        "HLS estable + extractor LIVE preciso"
    );

}


/* =========================================================
   24 - ARRANQUE
========================================================= */

initializeRadio();