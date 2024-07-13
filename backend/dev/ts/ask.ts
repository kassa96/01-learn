import { Rectangle } from "./capture.js";

const watchLink = document.getElementById("watch-link") as HTMLLinkElement
const askLink = document.getElementById("ask-link") as HTMLLinkElement
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
    showRectangle = false
    if (video.paused) {
        video.play();
      }
})

extractLink.addEventListener("click", (e)=>{
    e.preventDefault()
    if (showRectangle){
        const imageData = getCapture()
        if (imageData != null){
            const render = imageRender(imageData)
            const content = discussionSection.innerHTML + render
            discussionSection.innerHTML = content
            showDiscussionSection()
            activeLink("discussion-section")
            window.scrollTo(0, document.body.scrollHeight);
           // mainContent.scrollTop = mainContent.scrollHeight
           console.log("okkkkkkk")
        }
        return
    }
    showVideoSection()
    showRectangle = true
    activeLink("extract-section")
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
    }
}

function repositionCanvas(){
    console.log("reposition")
    if (rectangle != null){
      rectangle.repositionCanvas(video)
    }
  }
  
  function getCapture(): String | null {
    if (rectangle != null && video != null) {
      const tempCanvas = document.createElement('canvas');
      const { width, height } = video.getBoundingClientRect();
      tempCanvas.width = width 
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const imageData = tempCtx.getImageData(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
        const cutCanvas = document.createElement('canvas');
        const cutCtx = cutCanvas.getContext('2d');
        cutCanvas.width = rectangle.width;
        cutCanvas.height = rectangle.height;
        cutCanvas.classList.remove("hidden");
        cutCtx!.putImageData(imageData, 0, 0);
        tempCtx.clip();
        return cutCanvas.toDataURL();
      }
      return null
    }
    return null
  }  


function imageRender(dataUrl: String | null){
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