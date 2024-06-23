console.log("script Runnig....");
let songs;
let currfolder;
let currentsong = new Audio();

function secondsToMinutes(seconds) {
  // Ensure the input is a valid finite number
  if (typeof seconds !== "number" || !isFinite(seconds)) {
    return "00:00";
    throw new TypeError("Input must be a finite number");
  }

  // Ensure that we are working with an integer number of seconds
  const totalSeconds = Math.floor(seconds);

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  // Pad single digit minutes and seconds with leading zeros
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(remainingSeconds).padStart(2, "0");

  // Format the result as MM:SS
  return `${paddedMinutes}:${paddedSeconds}`;
}

async function getsongs(folder) {
  currfolder = folder;
  const a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  const res = await a.text();
  console.log(res);
  const div = document.createElement("div");
  div.innerHTML = res;
  const elment = div.getElementsByTagName("a");
  // console.log(elment);
  songs = [];
  for (let index = 0; index < elment.length; index++) {
    const element = elment[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all the songs in the playlist
  let songurl = document
    .querySelector(".songslist")
    .getElementsByTagName("ul")[0];
  songurl.innerHTML = "";
  for (const song of songs) {
    songurl.innerHTML =
      songurl.innerHTML +
      ` <li>
    <div><i class="fa-solid fa-music"></i></div>
    <div class="info">
        <div>${song.slice(0)}</div>
        <div>pankaj</div>
    </div>
    <div class="playnow">
    <span>Play now</span>
        <i class="fa-solid fa-circle-play"></i>
    </div>
</li>`;
  }
  console.log(songurl);

  let songli = Array.from(
    document.querySelector(".songslist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
    const playDiv = document.getElementById("play");
    const icon = playDiv.querySelector("i");
    icon.className = "fa-regular fa-circle-play";
  });
  // console.log(songli);
  return songs;
}

function playMusic(track, pause = false) {
  // const audio = new Audio();
  currentsong.src = `/${currfolder}/` + track;

  if (!pause) {
    currentsong.play();
    const playDiv = document.getElementById("play");
    const icon = playDiv.querySelector("i");
    icon.className = "fa-regular fa-circle-stop";
  } else {
    const playDiv = document.getElementById("play");
    const icon = playDiv.querySelector("i");
    icon.className = "fa-regular fa-circle-play";
  }

  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = " 00.00/00.00";
}

async function displayAlbums() {
  console.log("Displaying All Albums");
  let cardContainer = document.querySelector(".cardContainer");
  const a = await fetch(`http://127.0.0.1:5500/songs/`);
  const res = await a.text();
  // console.log(res);
  const div = document.createElement("div");
  div.innerHTML = res;
  const anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      let foldername = e.href.split("/").slice(-1)[0];
      const a = await fetch(
        `http://127.0.0.1:5500/songs/${foldername}/info.json`
      );
      const res = await a.json();
      // console.log(res);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${foldername}" class="card" style="width: 18rem;">
      <div class="play"><i class="fa-solid fa-play"></i>
      </div>
      <img src="/songs/${foldername}/cover.jpeg" class="card-img-top"
          alt="...">
      <div class="card-body">
      <h2>${res.title}</h2>
          <p class="card-text">${res.description}</p>

      </div>
  </div>`;
    }
  }
  // console.log(achor);

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  songs = await getsongs("songs/ncs");
  playMusic(songs[0], true);
  console.log(songs);

  // Display all the albums on the page
  await displayAlbums();

  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      const playDiv = document.getElementById("play");

      const icon = playDiv.querySelector("i");

      icon.className = "fa-regular fa-circle-stop";
    } else {
      currentsong.pause();
      const playDiv = document.getElementById("play");
      const icon = playDiv.querySelector("i");
      icon.className = "fa-regular fa-circle-play";
    }
  });

  // listen for time update

  currentsong.addEventListener("timeupdate", () => {
    // console.log(currentsong.currentTime, currentsong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutes(
      currentsong.currentTime
    )}/ ${secondsToMinutes(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let persent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = persent + "%";
    currentsong.currentTime = (currentsong.duration * persent) / 100;
  });

  // event listener for previous
  previous.addEventListener("click", () => {
    currentsong.pause();

    console.log("clicked previous");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
    console.log(songs, index);
  });
  next.addEventListener("click", () => {
    currentsong.pause();
    console.log("clicked next");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      alert("no more songs");
    }
  });
  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentsong.volume = parseInt(e.target.value) / 100;
    });

  // Add event listener to mute the track
  document.querySelector(".volume>i").addEventListener("click", (e) => {
    console.log(e.target.className.includes("fa-volume-high"));
    if (e.target.className.includes("fa-volume-high")) {
      e.target.className = e.target.className.replace(
        "fa-volume-high",
        "fa-volume-xmark"
      );
      currentsong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.className = e.target.className.replace(
        "fa-volume-xmark",
        "fa-volume-high"
      );
      currentsong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0.5;
    }
  });

  document.querySelector(".humbergur").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
}

main();
{
  /* <i class="fa-solid fa-volume-xmark"></i> */
}
