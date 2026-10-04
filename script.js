// pobieranie elementow z html
var guzikPlay = document.getElementById('playBtn');
var listaSciezek = document.getElementById('trackList');
var napisTytul = document.getElementById('titleText');
var napisWykonawca = document.getElementById('artistText');
var suwakTempo = document.getElementById('speedRange');
var tekstBpm = document.getElementById('bpmText');
var tekstProcent = document.getElementById('percentText');
var guzikOdliczanie = document.getElementById('countInBtn');
var guzikMetronom = document.getElementById('metronomeBtn');
var kontenerTabow = document.querySelector('.tab-area');
var strefaUpuszczania = document.getElementById('dropZone');
var plikInput = document.getElementById('fileInput');

var domyslneBpm = 120;

// wlaczenie alphataba
var api = new alphaTab.AlphaTabApi(document.getElementById('alphatab'), {
    engine: 'svg',
    player: {
        enablePlayer: true,
        enableCursor: true, // wlaczenie kursorow
        soundFont: 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2',
        scrollElement: kontenerTabow // autoscroll za kursorem
    },
    display: {
        staveProfile: 'Tab',
        suppressInfo: true
    }
});

// jak wczyta piosenke
api.scoreLoaded.on(function(score) {
    napisTytul.innerText = score.title || 'Bez tytułu';
    napisWykonawca.innerText = score.artist || 'Nieznany wykonawca';

    domyslneBpm = score.tempo || 120;
    suwakTempo.value = 1;
    zmienTempo();

    // tworzenie listy instrumentow
    listaSciezek.innerHTML = '';
    score.tracks.forEach(function(track, idx) {
        var li = document.createElement('li');
        li.className = 'track-item' + (idx === 0 ? ' active' : '');
        
        li.innerHTML = '<span>' + (track.name || 'Ścieżka ' + (idx + 1)) + '</span>' +
            '<div>' +
                '<button class="track-btn mute-btn">M</button> ' +
                '<button class="track-btn solo-btn">S</button>' +
            '</div>';

        li.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON') return;
            var elem = document.querySelectorAll('.track-item');
            for(var i = 0; i < elem.length; i++) {
                elem[i].classList.remove('active');
            }
            li.classList.add('active');
            api.renderTracks([track]);
        });

        var guzikMute = li.querySelector('.mute-btn');
        var guzikSolo = li.querySelector('.solo-btn');

        guzikMute.addEventListener('click', function() {
            var czyWyciszony = !track.playbackInfo.isMute;
            track.playbackInfo.isMute = czyWyciszony;
            api.changeTrackMute([track], czyWyciszony);
            guzikMute.classList.toggle('active-mute', czyWyciszony);

            if (czyWyciszony && track.playbackInfo.isSolo) {
                track.playbackInfo.isSolo = false;
                api.changeTrackSolo([track], false);
                guzikSolo.classList.remove('active-solo');
            }
        });

        guzikSolo.addEventListener('click', function() {
            var czySolo = !track.playbackInfo.isSolo;
            track.playbackInfo.isSolo = czySolo;
            api.changeTrackSolo([track], czySolo);
            guzikSolo.classList.toggle('active-solo', czySolo);

            if (czySolo && track.playbackInfo.isMute) {
                track.playbackInfo.isMute = false;
                api.changeTrackMute([track], false);
                guzikMute.classList.remove('active-mute');
            }
        });

        listaSciezek.appendChild(li);
    });
});

// wczytywanie pliku gp
function wczytajPlik(plik) {
    if (!plik) return;
    var czytnik = new FileReader();
    czytnik.onload = function(e) {
        var bufor = e.target.result;
        var bajty = new Uint8Array(bufor);
        api.load(bajty);
    };
    czytnik.readAsArrayBuffer(plik);
}

// otwieranie przez przycisk
plikInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        wczytajPlik(e.target.files[0]);
    }
});

// przeciąganie pliku myszką
strefaUpuszczania.addEventListener('dragover', function(e) {
    e.preventDefault();
    strefaUpuszczania.classList.add('drag-over');
});

strefaUpuszczania.addEventListener('dragleave', function() {
    strefaUpuszczania.classList.remove('drag-over');
});

strefaUpuszczania.addEventListener('drop', function(e) {
    e.preventDefault();
    strefaUpuszczania.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
        wczytajPlik(e.dataTransfer.files[0]);
    }
});

// przyciski do odtwarzania
guzikPlay.addEventListener('click', function() {
    api.playPause();
});

function zmienTempo() {
    var predkosc = parseFloat(suwakTempo.value);
    var aktualneBpm = Math.round(domyslneBpm * predkosc);
    var procenty = Math.round(predkosc * 100);

    tekstBpm.innerText = aktualneBpm + ' BPM';
    tekstProcent.innerText = procenty + '%';
    api.playbackSpeed = predkosc;
}

suwakTempo.addEventListener('input', zmienTempo);

guzikMetronom.addEventListener('click', function() {
    guzikMetronom.classList.toggle('active');
    api.metronomeVolume = guzikMetronom.classList.contains('active') ? 1 : 0;
});

guzikOdliczanie.addEventListener('click', function() {
    guzikOdliczanie.classList.toggle('active');
    api.countInVolume = guzikOdliczanie.classList.contains('active') ? 1 : 0;
});