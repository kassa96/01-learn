const closeBtn: HTMLButtonElement = document.getElementById(
  "close-btn"
) as HTMLButtonElement;
const panelError: HTMLDivElement = document.getElementById(
  "panel-error"
) as HTMLDivElement;
const videoUrlInput: HTMLInputElement = document.getElementById(
  "tutorial_url"
) as HTMLInputElement;
const divWarning: HTMLDivElement = document.getElementById(
  "panel-warning"
) as HTMLDivElement;
const divError: HTMLDivElement = document.getElementById(
  "panel-error"
) as HTMLDivElement;
const textError: HTMLDivElement = document.getElementById(
  "text-error"
) as HTMLDivElement;
const titleError: HTMLDivElement = document.getElementById(
  "title-error"
) as HTMLDivElement;
const loadingIndicator: HTMLDivElement = document.getElementById(
  "loading-indicator"
) as HTMLDivElement;
const progressBar = document.getElementById(
  "progress_download"
) as HTMLDivElement;
const progressBarContainer = document.getElementById(
  "progress-bar-container"
) as HTMLDivElement;
const progressText = document.getElementById("progress_text") as HTMLDivElement;
const infosElement: HTMLDivElement = document.getElementById(
  "video-info"
) as HTMLDivElement;
const btnDownload: HTMLElement = document.getElementById(
  "download-btn"
) as HTMLElement;

let isLoading = false;
let info_video = null;
let videoUrl: string | null = null;

videoUrlInput.addEventListener("keypress", (event: KeyboardEvent)=>{
  if (event.key === "Enter") {
    const url = videoUrlInput.value.trim()
    if (url != "")validateVideoUrl(url)
  }
});
videoUrlInput.addEventListener("paste", (event: ClipboardEvent) => {
  const clipboardData = event.clipboardData || (window as any).clipboardData;
  if (!clipboardData) return;
  if (clipboardData instanceof DataTransfer) {
    const url = clipboardData.getData("text").trim();
    if (url != "")validateVideoUrl(url)
  }
});

btnDownload.addEventListener("click", downloadTutorial);
closeBtn.addEventListener("click", function (event: MouseEvent) {
  panelError.style.display = "none";
});

async function validateVideoUrl(url: string) { 
    divError.style.display = "none";
    divWarning.style.display = "none";
    videoUrl = url.trim();
    infosElement.style.display = "none";
    if (!videoUrl) {
      return;
    }
    try {
      loadingIndicator.style.display = "flex";
      const response = await fetch(`/tutorial/validate?video_url=${videoUrl}`);
      const data = await response.json();
      if (data.status == "error") {
        console.log(data);
        titleError.innerText = "Error from the server";
        textError.innerText = data.message;
        divError.style.display = "block";
        divWarning.style.display = "none";
        loadingIndicator.style.display = "none";
        return;
      } else if (data.status === "video_downloaded") {
        loadingIndicator.style.display = "none";
        divError.style.display = "none";
        divWarning.style.display = "none";
        info_video = data.data;
        window.location.href = `/tutorial?video_id=${info_video.id}`;
        return;
      } else {
        divError.style.display = "none";
        divWarning.style.display = "none";
        loadingIndicator.style.display = "none";
        info_video = data.data;
        console.log(info_video);
        setVideoInfos(
          info_video.logo,
          info_video.title,
          info_video.duration,
          info_video.viewCount,
          info_video.likeCount
        );
        btnDownload.style.display = "block";
      }
    } catch (error) {
      titleError.innerText = "error connecting to the server";
      textError.innerText =
        "An error occurred when you are trying to connect to the server. Please check your internet connection. If the issue persists, please try again later or contact the site administrator at kassadiallo@gmail.com.";
      loadingIndicator.style.display = "none";
      divWarning.style.display = "none";
      videoUrlInput.disabled = false;
      videoUrlInput.classList.remove("disabled-input");
    }
}

async function downloadTutorial() {
  videoUrlInput.disabled = true;
  videoUrlInput.title = "the video is downloading...";
  videoUrlInput.classList.add("disabled-input");
  btnDownload.style.display = "none";
  launchDownloadingVideo(videoUrl);
}

function launchDownloadingVideo(videoUrl: string | null) {
  if (videoUrl === null) return;
  let socket = new WebSocket("ws://localhost:8000/ws/download/");
  socket.onopen = function (event) {
    console.log("WebSocket connected.");
    videoUrl = videoUrl as string;
    socket.send(videoUrl);
  };
  socket.onmessage = function (event) {
    var eventData = JSON.parse(event.data);
    console.log("--------data recieved:", eventData);
    if (
      eventData.status === "success" &&
      eventData.type === "starting_download"
    ) {
      loadingIndicator.style.display = "none";
      isLoading = true;
      videoUrlInput.disabled = true;
      videoUrlInput.classList.add("disabled-input");
      simulateDownload(info_video!.duration);
    } else if (
      (eventData.status === "success" &&
        eventData.type === "download_successful") ||
      eventData.type === "video_downloaded"
    ) {
      updateProgressBar(100);
      console.log(eventData);
      isLoading = false;
      window.location.href = `/tutorial?video_id=${eventData.video_id}`;
    } else if (
      eventData.status === "error" &&
      eventData.type === "tutorial_not_available"
    ) {
      titleError.innerText = "Tutorial not found";
      textError.innerText =
        "Your video is not available to download. Please wait and try later or download the video using tierce service and upload it.";
      loadingIndicator.style.display = "none";
      divWarning.style.display = "none";
      videoUrlInput.disabled = false;
      videoUrlInput.classList.remove("disabled-input");
    } else if (
      eventData.status === "error" &&
      eventData.type === "interruped_downloading_video"
    ) {
      titleError.innerText = "Downloading video interruped";
      textError.innerText =
        "The video download was instantly interrupted. Please try again or use an external service to download the video and then upload it.";
      loadingIndicator.style.display = "none";
      divWarning.style.display = "none";
      videoUrlInput.disabled = false;
      videoUrlInput.classList.remove("disabled-input");
    }
  };
  socket.onclose = function (event) {
    console.log("WebSocket closed.");
    divError.style.display = "none";
    loadingIndicator.style.display = "none";
    videoUrlInput.disabled = false;
    videoUrlInput.classList.remove("disabled-input");
  };

  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
    textError.innerText =
      "error downloading video. the video must be public acess.";
    divError.style.display = "block";
    loadingIndicator.style.display = "none";
    videoUrlInput.disabled = false;
    videoUrlInput.classList.remove("disabled-input");
  };
}

function simulateDownload(videoDuration: string): void {
  let [hours, minutes, seconds] = videoDuration.split(":").map(Number);
  let totalSeconds: number = hours * 3600 + minutes * 60 + seconds;
  const interval: number = 1000;
  let increment: number = 5;

  if (totalSeconds > 2 * 3600) {
    increment = 2;
  } else if (totalSeconds > 1 * 3600) {
    increment = 3;
  } else if (totalSeconds > 30 * 60) {
    increment = 5;
  } else if (totalSeconds > 20 * 60) {
    increment = 6;
  } else if (totalSeconds > 10 * 60) {
    increment = 7;
  } else if (totalSeconds > 5 * 60) {
    increment = 8;
  } else if (totalSeconds > 1 * 60) {
    increment = 9;
  } else {
    increment = 12;
  }
  let percent: number = 0;

  if (progressBar) {
    progressBarContainer.style.display = "block";
    let progressInterval = setInterval(function () {
      percent += increment;
      if (progressBar && isLoading) {
        updateProgressBar(percent);
      }
      if (percent >= 90) {
        clearInterval(progressInterval);
      }
    }, interval);
  } else {
    console.error('Element with ID "progress_download" not found.');
  }
}

function updateProgressBar(percent: number) {
  progressBar.style.width = percent + "%";
  progressText.textContent = percent + "%";
}

function setVideoInfos(
  photoUrl: string | null,
  title: string | null,
  duration: string | null,
  nbreView: number | null,
  nbreLike: number | null
) {
  const imageCouverture: HTMLImageElement = document.getElementById(
    "video-photo"
  ) as HTMLImageElement;
  const titleElement: HTMLSpanElement = document.getElementById(
    "video-title"
  ) as HTMLSpanElement;
  const likeElement: HTMLSpanElement = document.getElementById(
    "video-like"
  ) as HTMLSpanElement;
  const viewElement: HTMLSpanElement = document.getElementById(
    "video-view"
  ) as HTMLSpanElement;
  const duratioElement: HTMLSpanElement = document.getElementById(
    "video-duration"
  ) as HTMLSpanElement;
  if (photoUrl === null)
    document.getElementById("image-section")!.style.display = "none";
  else imageCouverture.src = photoUrl;
  if (title === null)
    document.getElementById("title-section")!.style.display = "none";
  else titleElement.innerText = title;
  if (nbreLike === null)
    document.getElementById("like-section")!.style.display = "none";
  else likeElement.innerText = "" + nbreLike;
  if (nbreView === null)
    document.getElementById("view-section")!.style.display = "none";
  else viewElement.innerText = "" + nbreView;
  if (duration === null)
    document.getElementById("duration-section")!.style.display = "none";
  else duratioElement.innerText = duration;
  infosElement.style.display = "flex";
}
