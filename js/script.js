console.log("Welcome to my project");

let currentSong = new Audio();
let currFolder = "";
let songs = [];

/* ================= TIME FORMAT ================= */
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

/* ================= PLAY MUSIC ================= */
function playMusic(track, pause = false) {
    currentSong.src = `${currFolder}/${track}`;

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

/* ================= LOAD ALBUM ================= */
async function loadAlbum(folder) {
    let res = await fetch("/songs/albums.json");
    let albums = await res.json();

    let album = albums.find(a => a.folder === folder);
    if (!album) return;

    currFolder = `/songs/${folder}`;
    songs = album.songs;

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    songs.forEach(song => {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg">
            <div class="info">
                <div>${song}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    });

    Array.from(songUL.children).forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.querySelector(".info div").innerText);
        });
    });

    playMusic(songs[0], true);
}

/* ================= DISPLAY ALBUMS ================= */
async function displayAlbums() {
    let res = await fetch("/songs/albums.json");
    let albums = await res.json();

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    albums.forEach(album => {
        cardContainer.innerHTML += `
        <div data-folder="${album.folder}" class="card">
            <div class="play">
                <img src="img/play.svg">
            </div>
            <img src="${album.cover}">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`;
    });

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", () => {
            loadAlbum(card.dataset.folder);
        });
    });
}

/* ================= MAIN ================= */
async function main() {

    await displayAlbums();
    await loadAlbum("ncs");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = e.target.value / 100;
        document.querySelector(".volume img").src =
            currentSong.volume > 0 ? "img/volume.svg" : "img/mute.svg";
    });

    document.querySelector(".volume img").addEventListener("click", e => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            e.target.src = "img/mute.svg";
            document.querySelector(".range input").value = 0;
        } else {
            currentSong.volume = 0.1;
            e.target.src = "img/volume.svg";
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
