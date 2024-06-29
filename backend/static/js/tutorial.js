import { Rectangle } from "./capture.js";
var canvas = null;
var video = document.getElementById("tuto");
var watch_link = document.querySelectorAll(".watch-link");
var extract_link = document.querySelectorAll(".extract-link");
var captureButton = document.querySelectorAll('.summarize-link');
var rectangle = null;
if (video !== null) {
    video.addEventListener('loadeddata', function () {
        canvas = document.querySelector("#canvas");
        captureButton.forEach(function (capture) {
            capture.addEventListener('click', captureAndDisplay);
        });
        canvas.addEventListener('mousedown', function (e) { return rectangle.mouseDown(e); });
        canvas.addEventListener('mousemove', function (e) { return rectangle.mouseMove(e); });
        canvas.addEventListener('mouseup', function () { return rectangle.mouseUp(); });
        canvas.addEventListener('mouseleave', function () { return rectangle.mouseUp(); });
        watch_link.forEach(function (watch) {
            watch.addEventListener('click', function () {
                canvas.style.display = "none";
            });
        });
        extract_link.forEach(function (extract) {
            extract.addEventListener('click', function () {
                // Réinitialiser le canvas et le rectangle par défaut
                canvas.style.display = "block";
                rectangle = new Rectangle(canvas, video);
                console.log("extract", rectangle);
                rectangle.drawRectInCanvas(); // Dessiner le rectangle
            });
        });
    });
}
function repositionCanvas() {
    console.log("reposition");
    if (rectangle != null) {
        rectangle.repositionCanvas(video);
    }
}
function captureAndDisplay() {
    if (rectangle != null && video != null) {
        var tempCanvas = document.createElement('canvas');
        var _a = video.getBoundingClientRect(), width = _a.width, height = _a.height;
        tempCanvas.width = width;
        tempCanvas.height = height;
        var tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
            var imageData = tempCtx.getImageData(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
            var cutCanvas = document.createElement('canvas');
            var cutCtx = cutCanvas.getContext('2d');
            cutCanvas.width = rectangle.width;
            cutCanvas.height = rectangle.height;
            cutCanvas.classList.remove("hidden");
            cutCtx.putImageData(imageData, 0, 0);
            tempCtx.clip();
            var capturedImage = document.getElementById("capturedImage");
            capturedImage.src = cutCanvas.toDataURL();
            capturedImage.classList.remove("hidden");
        }
    }
}
window.addEventListener("resize", repositionCanvas);
