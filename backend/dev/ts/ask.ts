import { Rectangle } from "./capture.js";

const watchLink = document.getElementById("watch-link") as HTMLLinkElement
const askLink = document.getElementById("ask-link") as HTMLLinkElement
const captureLink = document.getElementById("capture-link") as HTMLLinkElement
const extractLink = document.getElementById("extract-link") as HTMLLinkElement
const videoSection = document.getElementById("video-panel") as HTMLElement
const discussionSection = document.getElementById("discussion-panel") as HTMLElement
const video = document.getElementById("tuto") as HTMLVideoElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement
const mainContent = document.getElementById("main-content") as HTMLDivElement
let rectangle: Rectangle | null = null
let showRectangle = false

window.addEventListener("resize", repositionCanvas);


if (video !== null){
    video.addEventListener('loadeddata', () => {
        canvas.addEventListener('mousedown', (e) => rectangle!.mouseDown(e));
        canvas.addEventListener('mousemove', (e) => rectangle!.mouseMove(e));
        canvas.addEventListener('mouseup', () => rectangle!.mouseUp());
        canvas.addEventListener('mouseleave', () => rectangle!.mouseUp());
  });
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
        processCapture(); 
        showDiscussionSection()  
        activeLink("discussion-section")     
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

              }
            };
          }, 'image/png');
        } else {
            reject(new Error('Failed to create blob'));
        }
      } else {
        reject(new Error('Failed to create blob')); 
      }
    });
  }

  async function uploadImage(base64Data: string | null): Promise<string | null> {
    if (!base64Data) {
        console.error('No image data provided');
        return null;
    }
    try {
        const response = await fetch('/save/image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_data: base64Data })
        });
        if (!response.ok) {
            throw new Error('Failed to upload file');
        }

        const responseData = await response.json();
        return responseData.code;
    } catch (error: any) {
      console.error('Error uploading file:', error);
        return null;
    }
}

  
  async function processCapture() {
    try {
      const base64Data = await getCapture();
      if (base64Data) {
            const render = imageRender(base64Data)
            const content = discussionSection.innerHTML + render
            discussionSection.innerHTML = content
            showDiscussionSection()
            activeLink("discussion-section")
            window.scrollTo(0, document.body.scrollHeight);
            discussionSection.scrollTop = discussionSection.scrollHeight
           const code = await uploadImage(base64Data);
            if (code) {
                const render = messageRender(code)
                const content = discussionSection.innerHTML + render
                discussionSection.innerHTML = content
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

  function imageRender(dataUrl: String){
    return ` <div
    class="flex w-full p-4  gap-1 shrink-0 bg-skin-secondary rounded-3xl border border-skin-primary">
    <span class="">
        <svg xmlns="http://www.w3.org/2000/svg" height="41px" viewBox="0 -960 960 960" width="41px"  class="icon-md" role="img" fill="#000000"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
    </span>
    <div class="flex flex-col">
            <p class="px-5 py-3">extract this code for me</p>
            <p>
                <img src="${dataUrl}" class="object-contain rounded-2xl" />
            </p>
    </div>
</div>`
}

function messageRender(message: String){
    return `<div
    class="w-full p-4 flex flex-row gap-1 shrink-0 bg-skin-secondary rounded-3xl border border-skin-primary">
    <span class="">
        <svg xmlns="http://www.w3.org/2000/svg" height="41px" viewBox="0 -960 960 960" width="41px" fill="#5f6368"><path d="M200-120q-33 0-56.5-23.5T120-200v-400q0-100 70-170t170-70h240q100 0 170 70t70 170v400q0 33-23.5 56.5T760-120H200Zm0-80h560v-400q0-66-47-113t-113-47H360q-66 0-113 47t-47 113v400Zm160-280q-33 0-56.5-23.5T280-560q0-33 23.5-56.5T360-640q33 0 56.5 23.5T440-560q0 33-23.5 56.5T360-480Zm240 0q-33 0-56.5-23.5T520-560q0-33 23.5-56.5T600-640q33 0 56.5 23.5T680-560q0 33-23.5 56.5T600-480ZM280-200v-80q0-33 23.5-56.5T360-360h240q33 0 56.5 23.5T680-280v80h-80v-80h-80v80h-80v-80h-80v80h-80Zm-80 0h560-560Z"/></svg>
    </span>
    <span class="flex flex-col">
        <p>${message}</p>
    </span>
</div>`
}

