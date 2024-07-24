"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var closeBtn = document.getElementById("close-btn");
var panelError = document.getElementById("panel-error");
var videoUrlInput = document.getElementById("tutorial_url");
var divWarning = document.getElementById("panel-warning");
var divError = document.getElementById("panel-error");
var textError = document.getElementById("text-error");
var titleError = document.getElementById("title-error");
var loadingIndicator = document.getElementById("loading-indicator");
var progressBar = document.getElementById("progress_download");
var progressBarContainer = document.getElementById("progress-bar-container");
var progressText = document.getElementById("progress_text");
var infosElement = document.getElementById("video-info");
var btnDownload = document.getElementById("download-btn");
var isLoading = false;
var info_video = null;
var videoUrl = null;
videoUrlInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        var url = videoUrlInput.value.trim();
        if (url != "")
            validateVideoUrl(url);
    }
});
videoUrlInput.addEventListener("paste", function (event) {
    var clipboardData = event.clipboardData || window.clipboardData;
    if (!clipboardData)
        return;
    if (clipboardData instanceof DataTransfer) {
        var url = clipboardData.getData("text").trim();
        if (url != "")
            validateVideoUrl(url);
    }
});
btnDownload.addEventListener("click", downloadTutorial);
closeBtn.addEventListener("click", function (event) {
    panelError.style.display = "none";
});
function validateVideoUrl(url) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    divError.style.display = "none";
                    divWarning.style.display = "none";
                    videoUrl = url.trim();
                    infosElement.style.display = "none";
                    if (!videoUrl) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    loadingIndicator.style.display = "flex";
                    return [4 /*yield*/, fetch("/tutorial/validate?video_url=".concat(videoUrl))];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.status == "error") {
                        console.log(data);
                        titleError.innerText = "Error from the server";
                        textError.innerText = data.message;
                        divError.style.display = "block";
                        divWarning.style.display = "none";
                        loadingIndicator.style.display = "none";
                        return [2 /*return*/];
                    }
                    else if (data.status === "video_downloaded") {
                        loadingIndicator.style.display = "none";
                        divError.style.display = "none";
                        divWarning.style.display = "none";
                        info_video = data.data;
                        window.location.href = "/tutorial?video_id=".concat(info_video.id);
                        return [2 /*return*/];
                    }
                    else {
                        divError.style.display = "none";
                        divWarning.style.display = "none";
                        loadingIndicator.style.display = "none";
                        info_video = data.data;
                        console.log(info_video);
                        setVideoInfos(info_video.logo, info_video.title, info_video.duration, info_video.viewCount, info_video.likeCount);
                        btnDownload.style.display = "block";
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    titleError.innerText = "error connecting to the server";
                    textError.innerText =
                        "An error occurred when you are trying to connect to the server. Please check your internet connection. If the issue persists, please try again later or contact the site administrator at kassadiallo@gmail.com.";
                    loadingIndicator.style.display = "none";
                    divWarning.style.display = "none";
                    videoUrlInput.disabled = false;
                    videoUrlInput.classList.remove("disabled-input");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function downloadTutorial() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            videoUrlInput.disabled = true;
            videoUrlInput.title = "the video is downloading...";
            videoUrlInput.classList.add("disabled-input");
            btnDownload.style.display = "none";
            launchDownloadingVideo(videoUrl);
            return [2 /*return*/];
        });
    });
}
function launchDownloadingVideo(videoUrl) {
    if (videoUrl === null)
        return;
    var socket = new WebSocket("ws://localhost:8000/ws/download/");
    socket.onopen = function (event) {
        console.log("WebSocket connected.");
        videoUrl = videoUrl;
        socket.send(videoUrl);
    };
    socket.onmessage = function (event) {
        var eventData = JSON.parse(event.data);
        console.log("--------data recieved:", eventData);
        if (eventData.status === "success" &&
            eventData.type === "starting_download") {
            loadingIndicator.style.display = "none";
            isLoading = true;
            videoUrlInput.disabled = true;
            videoUrlInput.classList.add("disabled-input");
            simulateDownload(info_video.duration);
        }
        else if ((eventData.status === "success" &&
            eventData.type === "download_successful") ||
            eventData.type === "video_downloaded") {
            updateProgressBar(100);
            console.log(eventData);
            isLoading = false;
            window.location.href = "/tutorial?video_id=".concat(eventData.video_id);
        }
        else if (eventData.status === "error" &&
            eventData.type === "tutorial_not_available") {
            titleError.innerText = "Tutorial not found";
            textError.innerText =
                "Your video is not available to download. Please wait and try later or download the video using tierce service and upload it.";
            loadingIndicator.style.display = "none";
            divWarning.style.display = "none";
            videoUrlInput.disabled = false;
            videoUrlInput.classList.remove("disabled-input");
        }
        else if (eventData.status === "error" &&
            eventData.type === "interruped_downloading_video") {
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
function simulateDownload(videoDuration) {
    var _a = videoDuration.split(":").map(Number), hours = _a[0], minutes = _a[1], seconds = _a[2];
    var totalSeconds = hours * 3600 + minutes * 60 + seconds;
    var interval = 1000;
    var increment = 5;
    if (totalSeconds > 2 * 3600) {
        increment = 2;
    }
    else if (totalSeconds > 1 * 3600) {
        increment = 3;
    }
    else if (totalSeconds > 30 * 60) {
        increment = 5;
    }
    else if (totalSeconds > 20 * 60) {
        increment = 6;
    }
    else if (totalSeconds > 10 * 60) {
        increment = 7;
    }
    else if (totalSeconds > 5 * 60) {
        increment = 8;
    }
    else if (totalSeconds > 1 * 60) {
        increment = 9;
    }
    else {
        increment = 12;
    }
    var percent = 0;
    if (progressBar) {
        progressBarContainer.style.display = "block";
        var progressInterval_1 = setInterval(function () {
            percent += increment;
            if (progressBar && isLoading) {
                updateProgressBar(percent);
            }
            if (percent >= 90) {
                clearInterval(progressInterval_1);
            }
        }, interval);
    }
    else {
        console.error('Element with ID "progress_download" not found.');
    }
}
function updateProgressBar(percent) {
    progressBar.style.width = percent + "%";
    progressText.textContent = percent + "%";
}
function setVideoInfos(photoUrl, title, duration, nbreView, nbreLike) {
    var imageCouverture = document.getElementById("video-photo");
    var titleElement = document.getElementById("video-title");
    var likeElement = document.getElementById("video-like");
    var viewElement = document.getElementById("video-view");
    var duratioElement = document.getElementById("video-duration");
    if (photoUrl === null)
        document.getElementById("image-section").style.display = "none";
    else
        imageCouverture.src = photoUrl;
    if (title === null)
        document.getElementById("title-section").style.display = "none";
    else
        titleElement.innerText = title;
    if (nbreLike === null)
        document.getElementById("like-section").style.display = "none";
    else
        likeElement.innerText = "" + nbreLike;
    if (nbreView === null)
        document.getElementById("view-section").style.display = "none";
    else
        viewElement.innerText = "" + nbreView;
    if (duration === null)
        document.getElementById("duration-section").style.display = "none";
    else
        duratioElement.innerText = duration;
    infosElement.style.display = "flex";
}
