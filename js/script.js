const songSelect = document.getElementById('songSelect');
const playBtn = document.getElementById('playBtn');
const trackList = document.getElementById('trackList');
const titleText = document.getElementById('titleText');
const artistText = document.getElementById('artistText');
const speedRange = document.getElementById('speedRange');
const bpmText = document.getElementById('bpmText');
const percentText = document.getElementById('percentText');
const countInBtn = document.getElementById('countInBtn');
const metronomeBtn = document.getElementById('metronomeBtn');
const tabArea = document.querySelector('.tab-area');

let defaultBpm = 120;

// URUCHAMIANIE ALPHA TAB
const api = new alphaTab.AlphaTabApi(document.getElementById('alphatab'), {
    file: songSelect.value,
    engine: 'svg',
    player: {
        enablePlayer: true,
        enableCursor: true,
        soundFont: 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2'
    },
    display: {
        staveProfile: 'Tab',
        suppressInfo: true
    },
    scrollElement: tabArea
});

// ŁADOWANIE
api.scoreLoaded.on(score => {
    const selectedOpt = songSelect.options[songSelect.selectedIndex];
    titleText.innerText = selectedOpt ? (selectedOpt.getAttribute('data-title') || score.title) : score.title;
    artistText.innerText = score.artist || 'Nieznany wykonawca';

    // READING BPM FROM TAB
    defaultBpm = score.tempo || 120;
    speedRange.value = 1;
    updateBpm();

    // TRACKS
    trackList.innerHTML = '';
    score.tracks.forEach((track, index) => {
        const li = document.createElement('li');
        li.className = 'track-item' + (index === 0 ? ' active' : '');
        
        li.innerHTML = `
            <span>${track.name || 'Ścieżka ' + (index + 1)}</span>
            <div>
                <button class="track-btn mute-btn">M</button>
                <button class="track-btn solo-btn">S</button>
            </div>
        `;

        // TRACK SWITCHER
        li.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            document.querySelectorAll('.track-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            api.renderTracks([track]);
        });

        const muteBtn = li.querySelector('.mute-btn');
        const soloBtn = li.querySelector('.solo-btn');

        // MUTE
        muteBtn.addEventListener('click', () => {
            const isMuted = !track.playbackInfo.isMute;
            track.playbackInfo.isMute = isMuted;
            api.changeTrackMute([track], isMuted);
            muteBtn.classList.toggle('active-mute', isMuted);

            if (isMuted && track.playbackInfo.isSolo) {
                track.playbackInfo.isSolo = false;
                api.changeTrackSolo([track], false);
                soloBtn.classList.remove('active-solo');
            }
        });

        // SOLO
        soloBtn.addEventListener('click', () => {
            const isSolo = !track.playbackInfo.isSolo;
            track.playbackInfo.isSolo = isSolo;
            api.changeTrackSolo([track], isSolo);
            soloBtn.classList.toggle('active-solo', isSolo);

            if (isSolo && track.playbackInfo.isMute) {
                track.playbackInfo.isMute = false;
                api.changeTrackMute([track], false);
                muteBtn.classList.remove('active-mute');
            }
        });

        trackList.appendChild(li);
    });
});

// PLAYER
playBtn.addEventListener('click', () => {
    api.playPause();
});

// SONG SWITCHER
songSelect.addEventListener('change', () => {
    api.load(songSelect.value);
});

// BPM COUNTER
function updateBpm() {
    const speed = parseFloat(speedRange.value);
    const currentBpm = Math.round(defaultBpm * speed);
    const percentage = Math.round(speed * 100);

    bpmText.innerText = currentBpm + ' BPM';
    percentText.innerText = percentage + '%';
    api.playbackSpeed = speed;
}

speedRange.addEventListener('input', updateBpm);

// SETTINGS

// MetronomToggle
metronomeBtn.addEventListener('click', () => {
    metronomeBtn.classList.toggle('active');
    api.metronomeVolume = metronomeBtn.classList.contains('active') ? 1 : 0;
});

// CoutIntoggle
countInBtn.addEventListener('click', () => {
    countInBtn.classList.toggle('active');
    api.countInVolume = countInBtn.classList.contains('active') ? 1 : 0;
});
