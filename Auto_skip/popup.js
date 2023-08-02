let youtubeToggle = document.getElementById('youtubeToggle');
let netflixToggle = document.getElementById('netflixToggle');

let youtubeStatus = document.getElementById('youtubeStatus');
let netflixStatus = document.getElementById('netflixStatus');

chrome.storage.sync.get(['youtubeState', 'netflixState'], function (data) {
    youtubeToggle.checked = data.youtubeState || false;
    netflixToggle.checked = data.netflixState || false;
});

youtubeToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ youtubeState: this.checked });
});

netflixToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ netflixState: this.checked });
});
