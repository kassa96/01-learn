import { Rectangle } from "./capture.js";
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
