import "./style.css";
import { Rectangle } from "./capture";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<main class="flex min-h-screen flex-col items-center p-5 gap-4">
<div class="w-full flex items-center justify-center">
<nav class="max-lg:hidden flex gap-7 bg-purple-500 dark:bg-slate-600 
 px-10 py-3 shadow-xl rounded-3xl text-xl font-bold
 ">
   <a class="watch-link hover:text-slate-700 p-2 bg-slate-300 rounded-3xl" href="#">Watch the tutorial</a>
   <a class="summarize-link hover:text-slate-300 p-2" href="#">Summarize the tutorial</a>
   <a class="extract-link hover:text-slate-300 p-2" href="#">Extract code in the tutorial</a>
   <a class="bot-link hover:text-slate-300 p-2" href="#">Ask question</a>
 </nav>
 <nav class="lg:hidden flex gap-6  bg-purple-500 dark:bg-slate-600 
 px-10 py-3 shadow-xl rounded-3xl text-lg font-bold">
   <a class="watch-link hover:text-slate-700 p-2 bg-slate-300 rounded-3xl" href="#">Watch</a>
   <a class="summarize-link hover:text-slate-300 p-2" href="#">Summarize</a>
   <a class="extract-link hover:text-slate-300 p-2" href="#">Code</a>
   <a class="bot-link hover:text-slate-300 p-2" href="#">Question</a>
 </nav>
</div>
 <div class="w-full flex flex-col justify-center items-center">
 <div style="position:relative" class ="shadow-2xl rounded-md max-sm:w-full md:w-8/12 " >
 <video id="tuto" class="w-full object-cover"
 width="auto" height="auto" controls>
  <source src="tuto1.mp4" type="video/mp4">
  <source src="tuto1.webm" type="video/webm">
  Votre navigateur ne prend pas en charge la lecture de vidéos au format HTML5.
</video>
 <canvas id="canvas" 
         style="display:none; position:absolute;left: 0px;top: 0px;width: 100%;height: 100%;">
</canvas>
 </div>
 <img class="hidden border-2 border-green-800" id="capturedImage" src="" alt="Captured Image">
 </div>
</main>
`;

let canvas: HTMLCanvasElement | null = null;
let video = <HTMLVideoElement>document.getElementById("tuto");
let watch_link = document.querySelectorAll(".watch-link");
let extract_link = document.querySelectorAll(".extract-link");
const captureButton = document.querySelectorAll('.summarize-link');
let rectangle: Rectangle | null = null


if (video !== null){
  video.addEventListener('loadeddata', () => {
      canvas = document.querySelector("#canvas")
      captureButton.forEach((capture)=>{
        capture!.addEventListener('click', captureAndDisplay);
      })
      canvas!.addEventListener('mousedown', (e) => rectangle!.mouseDown(e));
      canvas!.addEventListener('mousemove', (e) => rectangle!.mouseMove(e));
      canvas!.addEventListener('mouseup', () => rectangle!.mouseUp());
      canvas!.addEventListener('mouseleave', () => rectangle!.mouseUp());
      watch_link!.forEach((watch)=>{
        watch.addEventListener('click', ()=>{
          canvas!.style.display = "none"
          })
      })
      extract_link.forEach((extract)=>{
        extract.addEventListener('click', ()=>{
          // Réinitialiser le canvas et le rectangle par défaut
          canvas!.style.display = "block";
          rectangle = new Rectangle(canvas!, video);
          console.log("extract", rectangle)
          rectangle.drawRectInCanvas(); // Dessiner le rectangle
        })
      })
});
}

function repositionCanvas(){
  console.log("reposition")
  if (rectangle != null){
    rectangle.repositionCanvas(video)
  }
}

function captureAndDisplay(): void {
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
      const capturedImage = document.getElementById("capturedImage") as HTMLImageElement;
      capturedImage.src = cutCanvas.toDataURL();
      capturedImage.classList.remove("hidden");
    }
  }
}
window.addEventListener("resize", repositionCanvas);
