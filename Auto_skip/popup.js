let youtubeToggle = document.getElementById('youtubeToggle');
let netflixToggle = document.getElementById('netflixToggle');

let youtubeStatus = document.getElementById('youtubeStatus');
let netflixStatus = document.getElementById('netflixStatus');

// Use chrome.storage.local to get the saved states
chrome.storage.local.get(['youtubeState', 'netflixState'], function (data) {
    youtubeToggle.checked = data.youtubeState || false;
    netflixToggle.checked = data.netflixState || false;
});

// Use chrome.storage.local to save the states
youtubeToggle.addEventListener('change', function () {
    chrome.storage.local.set({ youtubeState: this.checked });
    youtubeStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
});

netflixToggle.addEventListener('change', function () {
    chrome.storage.local.set({ netflixState: this.checked });
    netflixStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
});
