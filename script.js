const audioPlayer = document.getElementById('audioPlayer');
const playlistArea = document.getElementById('playlistArea');
const trackTitleDisplay = document.getElementById('trackTitle');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const totalDurationDisplay = document.getElementById('totalDuration');
const volumeBar = document.getElementById('volumeBar');
const tempoDisplay = document.getElementById('tempoDisplay');
const controllerContainer = document.getElementById('controllerContainer');

let playlist = []; // Array untuk menyimpan objek nada/lagu
let currentTrackIndex = -1;
let isPlaying = false;
let isMuted = false;

// --- Fungsi Utilitas ---

// Konversi detik ke format MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// --- Fungsi Playlist dan Tampilan ---

// Memuat file audio dari input (Ganti Nada & Tambah Nada)
window.handleFileUpload = function(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    for (const file of files) {
        // Buat URL Blob untuk file audio
        const fileURL = URL.createObjectURL(file);
        const track = {
            name: file.name,
            url: fileURL
        };
        playlist.push(track);
    }
    renderPlaylist();
    // Jika ini adalah lagu pertama, atur sebagai yang sedang diputar
    if (currentTrackIndex === -1 && playlist.length > 0) {
        currentTrackIndex = 0;
        loadTrack(currentTrackIndex);
    }
    updateTrackCount();
};

// Menampilkan daftar nada di area playlist
function renderPlaylist() {
    playlistArea.innerHTML = '';
    playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.classList.add('track-item');
        if (index === currentTrackIndex) {
            item.classList.add('active');
            trackTitleDisplay.textContent = track.name;
        }
        item.dataset.index = index;
        item.textContent = track.name;
        item.onclick = () => selectTrack(index);
        playlistArea.appendChild(item);
    });
}

// Memilih nada dari playlist
window.selectTrack = function(index) {
    if (index === currentTrackIndex && isPlaying) {
        // Jika nada yang sama diklik, tidak perlu memuat ulang
        return;
    }

    currentTrackIndex = index;
    const wasPlaying = isPlaying;
    
    loadTrack(index);
    if (wasPlaying) {
        playTrack();
    } else {
        pauseTrack(); // Tetap pause jika sebelumnya pause
    }
    renderPlaylist();
}

// Menghapus nada yang sedang dipilih
window.deleteSelectedTrack = function() {
    if (currentTrackIndex === -1 || playlist.length === 0) {
        alert("Tidak ada nada yang dipilih untuk dihapus.");
        return;
    }

    // Hapus dari array
    playlist.splice(currentTrackIndex, 1);
    
    // Reset status jika playlist kosong
    if (playlist.length === 0) {
        currentTrackIndex = -1;
        trackTitleDisplay.textContent = '000-NO TRAKS';
        stopTrack(); // Berhenti memutar
    } else {
        // Pindah ke nada berikutnya atau ke awal jika nada terakhir dihapus
        currentTrackIndex = Math.min(currentTrackIndex, playlist.length - 1);
        loadTrack(currentTrackIndex);
        if (isPlaying) {
             playTrack();
        } else {
            pauseTrack();
        }
    }
    renderPlaylist();
    updateTrackCount();
}

// Fungsi dummy untuk tombol "Tambah" (menggunakan fungsi file upload di sini)
window.addSongPlaceholder = function() {
    document.getElementById('audioFile').click();
}

// Fungsi Shuffle Playlist
window.shufflePlaylist = function() {
    for (let i = playlist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playlist[i], playlist[j]] = [playlist[j], playlist[i]]; // Tukar elemen
    }
    renderPlaylist();
    alert("Playlist berhasil diacak!");
}

function updateTrackCount() {
    const countSpan = document.querySelector('.track-count');
    countSpan.textContent = `${currentTrackIndex + 1} / ${playlist.length}`;
}

// --- Fungsi Kontrol Audio ---

// Memuat nada ke elemen audio
function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    const track = playlist[index];
    audioPlayer.src = track.url;
    audioPlayer.load();
    trackTitleDisplay.textContent = track.name;
    updateTrackCount();
}

// Putar/Jeda Nada (Bisa Bunyi Nada / Stop Nada)
window.playPause = function() {
    if (playlist.length === 0) {
        alert("Silakan tambahkan nada terlebih dahulu.");
        return;
    }

    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

function playTrack() {
    audioPlayer.play().catch(e => console.error("Error playing audio:", e));
    playPauseBtn.textContent = 'Pause';
    isPlaying = true;
    renderPlaylist(); // Update status aktif di UI
}

function pauseTrack() {
    audioPlayer.pause();
    playPauseBtn.textContent = 'Play';
    isPlaying = false;
}

// Stop Nada
window.stopTrack = function() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    playPauseBtn.textContent = 'Play';
    isPlaying = false;
}

// Nada Sebelumnya
window.prevTrack = function() {
    if (playlist.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    selectTrack(currentTrackIndex);
}

// Nada Berikutnya
window.nextTrack = function() {
    if (playlist.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    selectTrack(currentTrackIndex);
}

// Atur Volume
window.setVolume = function() {
    audioPlayer.volume = volumeBar.value / 100;
}

// Atur Mute
window.toggleMute = function() {
    isMuted = !isMuted;
    audioPlayer.muted = isMuted;
    document.getElementById('volBtn').textContent = isMuted ? 'Mute' : 'Vol';
}

// Pindah Durasi
window.seekTo = function() {
    const seekTime = audioPlayer.duration * (progressBar.value / 100);
    audioPlayer.currentTime = seekTime;
}

// Atur Repeat
window.toggleRepeat = function() {
    audioPlayer.loop = !audioPlayer.loop;
    const btn = document.querySelector('[onclick="toggleRepeat()"]');
    if (audioPlayer.loop) {
        btn.style.backgroundColor = '#007bff';
        btn.textContent = 'Repeat ON';
    } else {
        btn.style.backgroundColor = '#333';
        btn.textContent = 'Repeat';
    }
}

// Ganti Background
window.changeBackground = function() {
    const colors = ['#f0f0f0', '#f9f9f9', '#cceeff', '#ffccdd', '#eeffcc'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.backgroundColor = randomColor;
    controllerContainer.style.backgroundColor = 'white'; // Kontainer tetap putih
}


// --- Event Listeners Audio ---

// Ketika metadata lagu dimuat
audioPlayer.onloadedmetadata = () => {
    progressBar.max = 100;
    progressBar.value = 0;
    totalDurationDisplay.textContent = formatTime(audioPlayer.duration);
};

// Ketika lagu sedang diputar, update progress bar
audioPlayer.ontimeupdate = () => {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progress;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    }
};

// Ketika lagu berakhir, putar lagu berikutnya (jika tidak loop)
audioPlayer.onended = () => {
    if (!audioPlayer.loop) {
        nextTrack();
    }
};

// Inisialisasi
audioPlayer.volume = 0.7; // Volume awal
updateTrackCount();
