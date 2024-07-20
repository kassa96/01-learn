import { Rectangle } from "./capture.js";

const watchLink = document.getElementById("watch-link") as HTMLLinkElement
const askLink = document.getElementById("ask-link") as HTMLLinkElement
const captureLink = document.getElementById("capture-link") as HTMLLinkElement
const extractLink = document.getElementById("extract-link") as HTMLLinkElement
const videoSection = document.getElementById("video-panel") as HTMLElement
const discussionSection = document.getElementById("discussion-panel") as HTMLElement
const video = document.getElementById("tuto") as HTMLVideoElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement
const textError = document.getElementById("text-error") as HTMLDivElement;
const titleError = document.getElementById("title-error") as HTMLDivElement;
const divError = document.getElementById("panel-error") as HTMLDivElement;
const codeSection = document.getElementById('code-section') as HTMLDivElement;
const codeText = document.getElementById("code-text") as HTMLElement;
const codeImage = document.getElementById("code-image") as HTMLImageElement;
const scanningIndicator = document.getElementById("typing-indicator") as HTMLDivElement;

let rectangle: Rectangle | null = null
let showRectangle = false

window.addEventListener("resize", repositionCanvas);

if (video !== null){
        canvas.addEventListener('mousedown', (e) => rectangle!.mouseDown(e));
        canvas.addEventListener('mousemove', (e) => rectangle!.mouseMove(e));
        canvas.addEventListener('mouseup', () => rectangle!.mouseUp());
        canvas.addEventListener('mouseleave', () => rectangle!.mouseUp());
  }

watchLink.addEventListener("click", (e)=>{
    e.preventDefault()
    canvas.style.display = "none"
    showVideoSection()
    activeLink("watch-section")
    captureLink.style.display = "flex"
    extractLink.style.display = "none"
    showRectangle = false
    if (video.paused){
      video.play()
    }
})

extractLink.addEventListener("click", (e)=>{
    e.preventDefault()
    if (showRectangle){
        captureLink.style.display = "flex"
        extractLink.style.display = "none"
        activeLink("discussion-section") 
        processCapture();     
    }
})

captureLink.addEventListener("click", (e)=>{
  e.preventDefault()
  showVideoSection()
  showRectangle = true
  activeLink("extract-section")
  captureLink.style.display = "none"
  extractLink.style.display = "flex"
  if (!video.paused) {
      video.pause();
    }
    canvas.style.display = "block";
    rectangle = new Rectangle(canvas!, video);
    rectangle.drawRectInCanvas();
})


askLink.addEventListener("click", (e)=>{
    e.preventDefault()
    showDiscussionSection()
    activeLink("discussion-section")
    captureLink.style.display = "flex"
    extractLink.style.display = "none"
    showRectangle = false
    if (!video.paused) {
        video.pause();
      }
})

function showVideoSection(){
    videoSection.classList.remove("hidden")
    videoSection.classList.add("flex")
    discussionSection.classList.remove("flex")
    discussionSection.classList.add("hidden")
}

function showDiscussionSection(){
    videoSection.classList.remove("flex")
    videoSection.classList.add("hidden")
    discussionSection.classList.remove("hidden")
    discussionSection.classList.add("flex")
    codeSection.style.display = "none"
    divError.style.display = "none"
    scanningIndicator.style.display = "none"
}

function activeLink(name: String){
    const link = document.querySelector<HTMLAnchorElement>('a.active-link');
    if (link) {
        link.classList.remove('active-link');
    }
    if (name == "watch-section") {
        watchLink.classList.add("active-link")
        watchLink.classList.remove("link")
    }else if (name == "discussion-section"){
        askLink.classList.add("active-link")
        askLink.classList.remove("link") 
    } else if (name == "extract-section"){
        extractLink.classList.add("active-link")
        extractLink.classList.remove("link") 
    }else if (name == "capture-section"){
      captureLink.classList.add("active-link")
      captureLink.classList.remove("link") 
  }
}

function repositionCanvas(){
    if (rectangle != null){
      rectangle.repositionCanvas(video)
    }
  }

function getCapture(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (rectangle != null && video != null) {
        const tempCanvas = document.createElement('canvas');
        const { width, height } = video.getBoundingClientRect();
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
          const imageData = tempCtx.getImageData(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
          const cutCanvas = document.createElement('canvas');
          const cutCtx = cutCanvas.getContext('2d');
          cutCanvas.width = rectangle.width;
          cutCanvas.height = rectangle.height;
          cutCtx!.putImageData(imageData, 0, 0);
          cutCanvas.toBlob((blob) => {
            if (!blob) {
              titleError.innerText = "Error while capturing image"
              textError.innerText = "An unexpected error occurred during the image capture process. Please refresh the page and try again."
              divError.style.display="block"
              scanningIndicator.style.display = "none"
              reject(new Error('Failed to create blob'));
              return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              const base64data = reader.result?.toString() as string;
              if (base64data !== null){
                resolve(base64data);
              }else{
                titleError.innerText = "Error while capturing image"
                textError.innerText = "An unexpected error occurred during the image capture process. Please refresh the page and try again."
                divError.style.display="block"
                scanningIndicator.style.display = "none"
                reject(new Error('Failed to create blob'));
                return;
              }
            };
          }, 'image/png');
        } else {
             titleError.innerText = "Error while capturing image"
              textError.innerText = "An unexpected error occurred during the image capture process. Please refresh the page and try again."
              divError.style.display="block"
              reject(new Error('Failed to create blob'));
        }
      } else {
        titleError.innerText = "Error while capturing image"
        textError.innerText = "An unexpected error occurred during the image capture process. Please refresh the page and try again."
        divError.style.display="block"
        scanningIndicator.style.display = "none"
        reject(new Error('Failed to create blob')); 
      }
    });
  }

  async function uploadImage(base64Data: string | null): Promise<string | null> {
    if (!base64Data) {
        console.error('No image data provided');
        titleError.innerText = "Error while capturing image"
        textError.innerText = "An unexpected error occurred during the image capture process. Please refresh the page and try again."
        divError.style.display="block"
        scanningIndicator.style.display = "none"
        return null;
    }
    try {
      const controller = new AbortController();
      const signal = controller.signal;  
      const timeoutId = setTimeout(() => {
          controller.abort(); 
          titleError.innerText = "Timeout exceeded"
          textError.innerText = "The request took too long and was canceled. Please try again later."
          divError.style.display="block"
          scanningIndicator.style.display = "none"
      }, 120000);
  
      const response = await fetch('/scan/image', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image_data: base64Data }),
          signal: signal 
      });
  
      clearTimeout(timeoutId);
  
      if (!response.ok) {
          throw new Error('Failed to upload file');
      }
  
      const responseData = await response.json();
      return responseData.code;
  } catch (error) {
      titleError.innerText = "Internal server error"
      textError.innerText = `An error occurred when you are trying 
                              to connect to the server. Please check your internet connection. 
                              If the issue persists, please try again later or 
                              contact the site administrator at kassadiallo@gmail.com.`
      divError.style.display="block"
      scanningIndicator.style.display = "none"
      console.error('Error uploading file:', error);
      return null;
  }
}

  
  async function processCapture() {
    try {
      const base64Data = await getCapture();
      if (base64Data) {
            showDiscussionSection()
            activeLink("discussion-section")
            codeImage.src= base64Data
            scanningIndicator.style.display = "block"
           const code = await uploadImage(base64Data);
            if (code) {
                divError.style.display="none"
                let formated_code = code.replace(/^`|`$/g, '')
                codeText.textContent = formated_code    
                codeSection.style.display = "flex"
                divError.style.display = "none"            
                scanningIndicator.style.display = "none"
            } else {
            console.log('Failed to save image.');
            }
      } else {
        console.log('Failed to capture image.');
      }
    } catch (error) {
      console.error('Error processing capture:', error);
    }
  }

  