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
var extractLink = document.getElementById("extract-link");
var videoSection = document.getElementById("video-panel");
var discussionSection = document.getElementById("discussion-panel");
var video = document.getElementById("tuto");
var canvas = document.getElementById("canvas");
var mainContent = document.getElementById("main-content");
var rectangle = null;
var showRectangle = false;
window.addEventListener("resize", repositionCanvas);
if (video !== null) {
    video.addEventListener('loadeddata', function () {
        canvas.addEventListener('mousedown', function (e) { return rectangle.mouseDown(e); });
        canvas.addEventListener('mousemove', function (e) { return rectangle.mouseMove(e); });
        canvas.addEventListener('mouseup', function () { return rectangle.mouseUp(); });
        canvas.addEventListener('mouseleave', function () { return rectangle.mouseUp(); });
    });
}
watchLink.addEventListener("click", function (e) {
    e.preventDefault();
    canvas.style.display = "none";
    showVideoSection();
    activeLink("watch-section");
    showRectangle = false;
    if (video.paused) {
        video.play();
    }
});
extractLink.addEventListener("click", function (e) {
    e.preventDefault();
    if (showRectangle) {
        processCapture();
        return;
    }
    showVideoSection();
    showRectangle = true;
    activeLink("extract-section");
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
    showRectangle = false;
    if (!video.paused) {
        video.pause();
    }
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
}
function activeLink(name) {
    var link = document.querySelector('a.active-link');
    if (link) {
        link.classList.remove('active-link');
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
}
function repositionCanvas() {
    if (rectangle != null) {
        rectangle.repositionCanvas(video);
    }
}
function getCapture() {
    return new Promise(function (resolve, reject) {
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
                cutCtx.putImageData(imageData, 0, 0);
                cutCanvas.toBlob(function (blob) {
                    if (!blob) {
                        reject(new Error('Failed to create blob'));
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
                        }
                    };
                }, 'image/png');
            }
            else {
                reject(new Error('Failed to create blob'));
            }
        }
        else {
            reject(new Error('Failed to create blob'));
        }
    });
}
function uploadImage(base64Data) {
    return __awaiter(this, void 0, void 0, function () {
        var response, responseData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!base64Data) {
                        console.error('No image data provided');
                        return [2 /*return*/, null];
                    }
                    console.log("image data:", base64Data);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/save/image', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ image_data: base64Data }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to upload file');
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    responseData = _a.sent();
                    return [2 /*return*/, responseData.code];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error uploading file:', error_1);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function processCapture() {
    return __awaiter(this, void 0, void 0, function () {
        var base64Data, render, content, code, render_1, content_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, getCapture()];
                case 1:
                    base64Data = _a.sent();
                    if (!base64Data) return [3 /*break*/, 3];
                    render = imageRender(base64Data);
                    content = discussionSection.innerHTML + render;
                    discussionSection.innerHTML = content;
                    showDiscussionSection();
                    activeLink("discussion-section");
                    window.scrollTo(0, document.body.scrollHeight);
                    discussionSection.scrollTop = discussionSection.scrollHeight;
                    return [4 /*yield*/, uploadImage(base64Data)];
                case 2:
                    code = _a.sent();
                    if (code) {
                        render_1 = messageRender(code);
                        content_1 = discussionSection.innerHTML + render_1;
                        discussionSection.innerHTML = content_1;
                    }
                    else {
                        console.log('Failed to save image.');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    console.log('Failed to capture image.');
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    console.error('Error processing capture:', error_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function imageRender(dataUrl) {
    return " <div\n    class=\"flex w-full p-4  gap-1 shrink-0 bg-skin-secondary rounded-3xl border border-skin-primary\">\n    <span class=\"\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" height=\"41px\" viewBox=\"0 -960 960 960\" width=\"41px\"  class=\"icon-md\" role=\"img\" fill=\"#000000\"><path d=\"M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z\"/></svg>\n    </span>\n    <div class=\"flex flex-col\">\n            <p class=\"px-5 py-3\">extract this code for me</p>\n            <p>\n                <img src=\"".concat(dataUrl, "\" class=\"object-contain rounded-2xl\" />\n            </p>\n    </div>\n</div>");
}
function messageRender(message) {
    return "<div\n    class=\"w-full p-4 flex flex-row gap-1 shrink-0 bg-skin-secondary rounded-3xl border border-skin-primary\">\n    <span class=\"\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" height=\"41px\" viewBox=\"0 -960 960 960\" width=\"41px\" fill=\"#5f6368\"><path d=\"M200-120q-33 0-56.5-23.5T120-200v-400q0-100 70-170t170-70h240q100 0 170 70t70 170v400q0 33-23.5 56.5T760-120H200Zm0-80h560v-400q0-66-47-113t-113-47H360q-66 0-113 47t-47 113v400Zm160-280q-33 0-56.5-23.5T280-560q0-33 23.5-56.5T360-640q33 0 56.5 23.5T440-560q0 33-23.5 56.5T360-480Zm240 0q-33 0-56.5-23.5T520-560q0-33 23.5-56.5T600-640q33 0 56.5 23.5T680-560q0 33-23.5 56.5T600-480ZM280-200v-80q0-33 23.5-56.5T360-360h240q33 0 56.5 23.5T680-280v80h-80v-80h-80v80h-80v-80h-80v80h-80Zm-80 0h560-560Z\"/></svg>\n    </span>\n    <span class=\"flex flex-col\">\n        <p>".concat(message, "</p>\n    </span>\n</div>");
}
