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
import { Rectangle } from "./capture.js";
var watchLink = document.getElementById("watch-link");
var askLink = document.getElementById("ask-link");
var captureLink = document.getElementById("capture-link");
var extractLink = document.getElementById("extract-link");
var videoSection = document.getElementById("video-panel");
var discussionSection = document.getElementById("discussion-panel");
var video = document.getElementById("tuto");
var canvas = document.getElementById("canvas");
var textError = document.getElementById("text-error");
var titleError = document.getElementById("title-error");
var divError = document.getElementById("panel-error");
var codeSection = document.getElementById("code-section");
var codeText = document.getElementById("code-text");
var codeImage = document.getElementById("code-image");
var scanningIndicator = document.getElementById("typing-indicator");
var alertScan = document.getElementById("alert-scan");
var titleScan = document.getElementById("title-scan");
var copyLink = document.getElementById("copy-link");
var langageName = document.getElementById("langage-name");
var rectangle = null;
var showRectangle = false;
var is_scanning = false;
var scanning_success = false;
window.addEventListener("resize", repositionCanvas);
if (video !== null) {
    canvas.addEventListener("mousedown", function (e) { return rectangle.mouseDown(e); });
    canvas.addEventListener("mousemove", function (e) { return rectangle.mouseMove(e); });
    canvas.addEventListener("mouseup", function () { return rectangle.mouseUp(); });
    canvas.addEventListener("mouseleave", function () { return rectangle.mouseUp(); });
}
watchLink.addEventListener("click", function (e) {
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
extractLink.addEventListener("click", function (e) {
    e.preventDefault();
    if (showRectangle) {
        captureLink.style.display = "flex";
        extractLink.style.display = "none";
        activeLink("discussion-section");
        processCapture();
    }
});
captureLink.addEventListener("click", function (e) {
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
    rectangle = new Rectangle(canvas, video);
    rectangle.drawRectInCanvas();
});
askLink.addEventListener("click", function (e) {
    e.preventDefault();
    showDiscussionSection();
    activeLink("discussion-section");
    captureLink.style.display = "flex";
    extractLink.style.display = "none";
    showRectangle = false;
    if (!video.paused) {
        video.pause();
    }
});
copyLink.addEventListener("click", function () {
    var textToCopy = codeText.textContent;
    copyToClipboard(textToCopy);
    copyLink.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"20px\" viewBox=\"0 -960 960 960\" width=\"20px\" fill=\"#5f6368\"><path d=\"M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z\"/></svg>\n  <span>Copied</span>";
    setTimeout(function () {
        copyLink.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"none\" viewBox=\"0 0 24 24\" class=\"icon-sm\"><path fill=\"currentColor\" fill-rule=\"evenodd\" d=\"M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1zM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z\" clip-rule=\"evenodd\"></path></svg>\n    <span>Copy the code</span>";
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
    if (scanning_success || is_scanning)
        codeImage.style.display = "block";
    else
        codeImage.style.display = "none";
    if (is_scanning)
        scanningIndicator.style.display = "flex";
    else
        scanningIndicator.style.display = "none";
    if (scanning_success) {
        titleScan.style.display = "block";
        alertScan.style.display = "none";
    }
    else if (is_scanning) {
        alertScan.style.display = "none";
    }
    else {
        titleScan.style.display = "none";
        alertScan.style.display = "block";
    }
}
function activeLink(name) {
    var link = document.querySelector("a.active-link");
    if (link) {
        link.classList.remove("active-link");
    }
    if (name == "watch-section") {
        watchLink.classList.add("active-link");
        watchLink.classList.remove("link");
    }
    else if (name == "discussion-section") {
        askLink.classList.add("active-link");
        askLink.classList.remove("link");
    }
    else if (name == "extract-section") {
        extractLink.classList.add("active-link");
        extractLink.classList.remove("link");
    }
    else if (name == "capture-section") {
        captureLink.classList.add("active-link");
        captureLink.classList.remove("link");
    }
}
function repositionCanvas() {
    if (rectangle != null) {
        rectangle.repositionCanvas(video);
    }
}
function getCapture() {
    return new Promise(function (resolve, reject) {
        if (rectangle != null && video != null) {
            var tempCanvas = document.createElement("canvas");
            var _a = video.getBoundingClientRect(), width = _a.width, height = _a.height;
            tempCanvas.width = width;
            tempCanvas.height = height;
            var tempCtx = tempCanvas.getContext("2d");
            if (tempCtx) {
                tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
                var imageData = tempCtx.getImageData(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
                var cutCanvas = document.createElement("canvas");
                var cutCtx = cutCanvas.getContext("2d");
                cutCanvas.width = rectangle.width;
                cutCanvas.height = rectangle.height;
                cutCtx.putImageData(imageData, 0, 0);
                cutCanvas.toBlob(function (blob) {
                    if (!blob) {
                        titleError.innerText = "Error while capturing image";
                        textError.innerText =
                            "An unexpected error occurred during the image capture process. Please refresh the page and try again.";
                        divError.style.display = "block";
                        scanningIndicator.style.display = "none";
                        reject(new Error("Failed to create blob"));
                        return;
                    }
                    var reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = function () {
                        var _a;
                        var base64data = (_a = reader.result) === null || _a === void 0 ? void 0 : _a.toString();
                        if (base64data !== null) {
                            resolve(base64data);
                        }
                        else {
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
            }
            else {
                titleError.innerText = "Error while capturing image";
                textError.innerText =
                    "An unexpected error occurred during the image capture process. Please refresh the page and try again.";
                divError.style.display = "block";
                reject(new Error("Failed to create blob"));
            }
        }
        else {
            titleError.innerText = "Error while capturing image";
            textError.innerText =
                "An unexpected error occurred during the image capture process. Please refresh the page and try again.";
            divError.style.display = "block";
            scanningIndicator.style.display = "none";
            reject(new Error("Failed to create blob"));
        }
    });
}
function uploadImage(base64Data) {
    return __awaiter(this, void 0, void 0, function () {
        var controller_1, signal, timeoutId, response, responseData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!base64Data) {
                        console.error("No image data provided");
                        titleError.innerText = "Error while capturing image";
                        textError.innerText =
                            "An unexpected error occurred during the image capture process. Please refresh the page and try again.";
                        divError.style.display = "block";
                        scanningIndicator.style.display = "none";
                        return [2 /*return*/, null];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    controller_1 = new AbortController();
                    signal = controller_1.signal;
                    timeoutId = setTimeout(function () {
                        controller_1.abort();
                        titleError.innerText = "Timeout exceeded";
                        textError.innerText =
                            "The request took too long and was canceled. Please try again later.";
                        divError.style.display = "block";
                        scanningIndicator.style.display = "none";
                    }, 120000);
                    return [4 /*yield*/, fetch("/scan/image", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ image_data: base64Data }),
                            signal: signal,
                        })];
                case 2:
                    response = _a.sent();
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error("Failed to upload file");
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    responseData = _a.sent();
                    return [2 /*return*/, responseData.code];
                case 4:
                    error_1 = _a.sent();
                    titleError.innerText = "Internal server error";
                    textError.innerText = "An error occurred when you are trying \n                              to connect to the server. Please check your internet connection. \n                              If the issue persists, please try again later or \n                              contact the site administrator at kassadiallo@gmail.com.";
                    divError.style.display = "block";
                    scanningIndicator.style.display = "none";
                    console.error("Error uploading file:", error_1);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function processCapture() {
    return __awaiter(this, void 0, void 0, function () {
        var base64Data, rawCode, langage_name, formatedCode, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, getCapture()];
                case 1:
                    base64Data = _a.sent();
                    if (!base64Data) return [3 /*break*/, 3];
                    is_scanning = true;
                    showDiscussionSection();
                    activeLink("discussion-section");
                    codeSection.style.display = "none";
                    codeImage.src = base64Data;
                    return [4 /*yield*/, uploadImage(base64Data)];
                case 2:
                    rawCode = _a.sent();
                    if (!rawCode) {
                        titleError.innerText = "error when extracting code";
                        textError.innerText = "An error occurred while scanning the image to extract the code. Please try again.";
                        divError.style.display = "block";
                        scanningIndicator.style.display = "none";
                        is_scanning = false;
                        return [2 /*return*/];
                    }
                    rawCode = rawCode.replace(/\/n/g, "").trim();
                    if (rawCode === "<no__code/>") {
                        titleError.innerText = "no code found";
                        textError.innerText = "No code was found during the document scan.";
                        divError.style.display = "block";
                        scanningIndicator.style.display = "none";
                        is_scanning = false;
                        return [2 /*return*/];
                    }
                    langage_name = getLanguageName(rawCode);
                    langageName.innerText = langage_name;
                    formatedCode = getCode(rawCode);
                    divError.style.display = "none";
                    codeText.textContent = formatedCode;
                    codeSection.style.display = "flex";
                    divError.style.display = "none";
                    scanningIndicator.style.display = "none";
                    scanning_success = true;
                    is_scanning = false;
                    return [3 /*break*/, 4];
                case 3:
                    console.log("Failed to capture image.");
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    console.error("Error processing capture:", error_2);
                    is_scanning = false;
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function copyToClipboard(text) {
    if (text === null || text == "") {
        return;
    }
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard
        .writeText(text)
        .then(function () {
        console.log("Text copied to clipboard");
    })
        .catch(function (err) {
        console.error("Error in copying text: ", err);
    });
}
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        var successful = document.execCommand("copy");
        var msg = successful ? "successful" : "unsuccessful";
        console.log("Fallback: Text copy " + msg);
    }
    catch (err) {
        console.error("Fallback: Unable to copy text", err);
    }
    document.body.removeChild(textArea);
}
function getLanguageName(texte) {
    var regex = new RegExp('<lg__code>(.*?)<\/lg__code>', 's');
    var matches = texte.match(regex);
    if (matches && matches.length > 1) {
        return matches[1];
    }
    else {
        return "";
    }
}
function getCode(texte) {
    var regex = new RegExp('<txt__code>(.*?)<\/txt__code>', 's');
    var matches = texte.match(regex);
    if (matches && matches.length > 1) {
        return matches[1];
    }
    else {
        return texte;
    }
}
