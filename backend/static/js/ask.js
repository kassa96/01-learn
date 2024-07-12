"use strict";
var watchLink = document.getElementById("watch-link");
var askLink = document.getElementById("ask-link");
var extractLink = document.getElementById("extract-link");
var videoSection = document.getElementById("video-panel");
var discussionSection = document.getElementById("discussion-panel");
watchLink.addEventListener("click", function (e) {
    console.log("ok");
    e.preventDefault();
    showVideoSection();
    activeLink("watch-section");
});
extractLink.addEventListener("click", function (e) {
    console.log("ok");
    e.preventDefault();
    showVideoSection();
    activeLink("extract-section");
});
askLink.addEventListener("click", function (e) {
    console.log("ok");
    e.preventDefault();
    showDiscussionSection();
    activeLink("discussion-section");
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
