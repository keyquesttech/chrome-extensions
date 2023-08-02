let youtubeToggle = document.getElementById('youtubeToggle');
let netflixToggle = document.getElementById('netflixToggle');
let hboToggle = document.getElementById('hboToggle');

let youtubeStatus = document.getElementById('youtubeStatus');
let netflixStatus = document.getElementById('netflixStatus');
let hboStatus = document.getElementById('hboStatus');

chrome.storage.sync.get(['youtubeState', 'netflixState', 'hboState'], function (data) {
    youtubeToggle.checked = data.youtubeState || false;
    netflixToggle.checked = data.netflixState || false;
    hboToggle.checked = data.hboState || false;
});

youtubeToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ youtubeState: this.checked });
});

netflixToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ netflixState: this.checked });
});

hboToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ hboState: this.checked });
});
