import { Rectangle } from "./capture.js";

const watchLink = document.getElementById("watch-link") as HTMLLinkElement;
const askLink = document.getElementById("ask-link") as HTMLLinkElement;
const captureLink = document.getElementById("capture-link") as HTMLLinkElement;
const extractLink = document.getElementById("extract-link") as HTMLLinkElement;
const videoSection = document.getElementById("video-panel") as HTMLElement;
const discussionSection = document.getElementById(
  "discussion-panel"
) as HTMLElement;
const video = document.getElementById("tuto") as HTMLVideoElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const textError = document.getElementById("text-error") as HTMLDivElement;
const titleError = document.getElementById("title-error") as HTMLDivElement;
const divError = document.getElementById("panel-error") as HTMLDivElement;
const codeSection = document.getElementById("code-section") as HTMLDivElement;
const codeText = document.getElementById("code-text") as HTMLElement;
const codeImage = document.getElementById("code-image") as HTMLImageElement;
const scanningIndicator = document.getElementById(
  "typing-indicator"
) as HTMLDivElement;
const alertScan = document.getElementById("alert-scan") as HTMLDivElement;
const titleScan = document.getElementById("title-scan") as HTMLDivElement;
const copyLink = document.getElementById("copy-link") as HTMLAnchorElement;
const langageName: HTMLElement = document.getElementById(
  "langage-name"
) as HTMLElement;

let rectangle: Rectangle | null = null;
let showRectangle = false;
let is_scanning = false;
let scanning_success = false;
let lastCaptureScan = ""
let lastCodeScan = ""
let lastCodeTitle = ""

window.addEventListener("resize", repositionCanvas);

if (video !== null) {
  video.addEventListener('loadedmetadata', () => {
    video.play()
    console.log("okkkkk")
  })
  canvas.addEventListener("mousedown", (e) => rectangle!.mouseDown(e));
  canvas.addEventListener("mousemove", (e) => rectangle!.mouseMove(e));
  canvas.addEventListener("mouseup", () => rectangle!.mouseUp());
  canvas.addEventListener("mouseleave", () => rectangle!.mouseUp());
}

watchLink.addEventListener("click", (e) => {
  e.preventDefault();
  canvas.style.display = "none";
  showVideoSection();
  activeLink("watch-section");
  captureLink.style.display = "flex";
  extractLink.style.display = "none";
  showRectangle = false;
  if (video.paused) {
    video.play();
  }
});

extractLink.addEventListener("click", (e) => {
  e.preventDefault();
  if (showRectangle) {
    captureLink.style.display = "flex";
    extractLink.style.display = "none";
    activeLink("discussion-section");
    processCapture();
  }
});

captureLink.addEventListener("click", (e) => {
  e.preventDefault();
  showVideoSection();
  showRectangle = true;
  activeLink("extract-section");
  captureLink.style.display = "none";
  extractLink.style.display = "flex";
  if (!video.paused) {
    video.pause();
  }
  canvas.style.display = "block";
  rectangle = new Rectangle(canvas!, video);
  rectangle.drawRectInCanvas();
});

askLink.addEventListener("click", (e) => {
  e.preventDefault();
  showDiscussionSection();
  activeLink("discussion-section");
  captureLink.style.display = "flex";
  extractLink.style.display = "none";
  showRectangle = false;
  if (!video.paused) {
    video.pause();
  }
  if (lastCaptureScan != "" && lastCodeScan != ""){
    codeImage.src = lastCaptureScan
    codeText.textContent = lastCodeScan
    langageName.textContent = lastCodeTitle
  }
});

copyLink.addEventListener("click", () => {
  const textToCopy = codeText.textContent;
  copyToClipboard(textToCopy);
  copyLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
  <span>Copied</span>`;
  setTimeout(() => {
    copyLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" class="icon-sm"><path fill="currentColor" fill-rule="evenodd" d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" clip-rule="evenodd"></path></svg>
    <span>Copy the code</span>`;
  }, 3000);
});

function showVideoSection() {
  videoSection.classList.remove("hidden");
  videoSection.classList.add("flex");
  discussionSection.classList.remove("flex");
  discussionSection.classList.add("hidden");
}

function showDiscussionSection() {
  videoSection.classList.remove("flex");
  videoSection.classList.add("hidden");
  discussionSection.classList.remove("hidden");
  discussionSection.classList.add("flex");
  if (scanning_success) {
    codeSection.style.display = "flex";
  }
  divError.style.display = "none";
  if (scanning_success || is_scanning) codeImage.style.display = "block";
  else codeImage.style.display = "none";
  if (is_scanning) scanningIndicator.style.display = "flex";
  else scanningIndicator.style.display = "none";
  if (scanning_success) {
    titleScan.style.display = "block";
    alertScan.style.display = "none";
  } else if (is_scanning) {
    alertScan.style.display = "none";
  } else {
    titleScan.style.display = "none";
    alertScan.style.display = "block";
  }
}

function activeLink(name: String) {
  const link = document.querySelector<HTMLAnchorElement>("a.active-link");
  if (link) {
    link.classList.remove("active-link");
  }
  if (name == "watch-section") {
    watchLink.classList.add("active-link");
    watchLink.classList.remove("link");
  } else if (name == "discussion-section") {
    askLink.classList.add("active-link");
    askLink.classList.remove("link");
  } else if (name == "extract-section") {
    extractLink.classList.add("active-link");
    extractLink.classList.remove("link");
  } else if (name == "capture-section") {
    captureLink.classList.add("active-link");
    captureLink.classList.remove("link");
  }
}

function repositionCanvas() {
  if (rectangle != null) {
    rectangle.repositionCanvas(video);
  }
}

function getCapture(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (rectangle != null && video != null) {
      const tempCanvas = document.createElement("canvas");
      const { width, height } = video.getBoundingClientRect();
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const imageData = tempCtx.getImageData(
          rectangle.left,
          rectangle.top,
          rectangle.width,
          rectangle.height
        );
        const cutCanvas = document.createElement("canvas");
        const cutCtx = cutCanvas.getContext("2d");
        cutCanvas.width = rectangle.width;
        cutCanvas.height = rectangle.height;
        cutCtx!.putImageData(imageData, 0, 0);
        cutCanvas.toBlob((blob) => {
          if (!blob) {
            titleError.innerText = "Error while capturing image";
            textError.innerText =
              "An unexpected error occurred during the image capture process. Please refresh the page and try again.";
            divError.style.display = "block";
            scanningIndicator.style.display = "none";
            reject(new Error("Failed to create blob"));
            return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64data = reader.result?.toString() as string;
            if (base64data !== null) {
              resolve(base64data);
            } else {
              titleError.innerText = "Error while capturing image";
              textError.innerText =
                "An unexpected error occurred during the image capture process. Please refresh the page and try again.";
              divError.style.display = "block";
              scanningIndicator.style.display = "none";
              reject(new Error("Failed to create blob"));
              return;
            }
          };
        }, "image/png");
      } else {
        titleError.innerText = "Error while capturing image";
        textError.innerText =
          "An unexpected error occurred during the image capture process. Please refresh the page and try again.";
        divError.style.display = "block";
        reject(new Error("Failed to create blob"));
      }
    } else {
      titleError.innerText = "Error while capturing image";
      textError.innerText =
        "An unexpected error occurred during the image capture process. Please refresh the page and try again.";
      divError.style.display = "block";
      scanningIndicator.style.display = "none";
      reject(new Error("Failed to create blob"));
    }
  });
}

async function uploadImage(base64Data: string | null): Promise<string | null> {
  if (!base64Data) {
    console.error("No image data provided");
    titleError.innerText = "Error while capturing image";
    textError.innerText =
      "An unexpected error occurred during the image capture process. Please refresh the page and try again.";
    divError.style.display = "block";
    scanningIndicator.style.display = "none";
    return null;
  }
  try {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => {
      controller.abort();
      titleError.innerText = "Timeout exceeded";
      textError.innerText =
        "The request took too long and was canceled. Please try again later.";
      divError.style.display = "block";
      scanningIndicator.style.display = "none";
    }, 120000);

    const response = await fetch("/scan/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_data: base64Data }),
      signal: signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const responseData = await response.json();
    return responseData.code;
  } catch (error) {
    titleError.innerText = "Internal server error";
    textError.innerText = `An error occurred when you are trying 
                              to connect to the server. Please check your internet connection. 
                              If the issue persists, please try again later or 
                              contact the site administrator at kassadiallo@gmail.com.`;
    divError.style.display = "block";
    scanningIndicator.style.display = "none";
    console.error("Error uploading file:", error);
    return null;
  }
}

async function processCapture() {
  try {
    const base64Data = await getCapture();
    if (base64Data) {
      is_scanning = true;
      showDiscussionSection();
      activeLink("discussion-section");
      codeSection.style.display = "none";
      codeImage.src = base64Data;
      let rawCode = await uploadImage(base64Data);
      if (!rawCode) {
        titleError.innerText = "error when extracting code";
        textError.innerText = `An error occurred while scanning the image to extract the code. Please try again.`;
        divError.style.display = "block";
        scanningIndicator.style.display = "none";
        is_scanning = false;
        return;
      }
      rawCode = rawCode.replace(/\/n/g, "").trim();
      if (rawCode === "<no__code/>") {
        titleError.innerText = "no code found";
        textError.innerText = `No code was found during the document scan.`;
        divError.style.display = "block";
        scanningIndicator.style.display = "none";
        is_scanning = false;
        return;
      }
      let langage_name = getLanguageName(rawCode);
      langageName.innerText = langage_name;
      lastCodeTitle = langage_name
      lastCaptureScan = base64Data
      let formatedCode = getCode(rawCode);
      divError.style.display = "none";
      codeText.textContent = formatedCode;
      lastCodeScan = formatedCode as string
      codeSection.style.display = "flex";
      divError.style.display = "none";
      scanningIndicator.style.display = "none";
      scanning_success = true;
      is_scanning = false;
    } else {
      console.log("Failed to capture image.");
    }
  } catch (error) {
    console.error("Error processing capture:", error);
    is_scanning = false;
  }
}

function copyToClipboard(text: string | null) {
  if (text === null || text == "") {
    return;
  }
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Text copied to clipboard");
    })
    .catch((err) => {
      console.error("Error in copying text: ", err);
    });
}

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "-9999px";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    const msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Text copy " + msg);
  } catch (err) {
    console.error("Fallback: Unable to copy text", err);
  }

  document.body.removeChild(textArea);
}

function getLanguageName(texte: string): string {
  const regex = new RegExp('<lg__code>(.*?)<\/lg__code>', 's');
  const matches = texte.match(regex);
  if (matches && matches.length > 1) {
    return matches[1];
  } else {
    return "";
  }
}

function getCode(texte: string): string | null {
  const regex = new RegExp('<txt__code>(.*?)<\/txt__code>', 's');
  const matches = texte.match(regex);
  if (matches && matches.length > 1) {
    return matches[1];
  } else {
    return texte;
  }
}
