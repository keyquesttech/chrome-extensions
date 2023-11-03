let youtubeToggle = document.getElementById('youtubeToggle');
let netflixToggle = document.getElementById('netflixToggle');
let hboToggle = document.getElementById('hboToggle');

let youtubeStatus = document.getElementById('youtubeStatus');
let netflixStatus = document.getElementById('netflixStatus');
let hboStatus = document.getElementById('hboStatus');

// Use chrome.storage.local to get the saved states
chrome.storage.local.get(['youtubeState', 'netflixState', 'hboState'], function (data) {
    youtubeToggle.checked = data.youtubeState || false;
    netflixToggle.checked = data.netflixState || false;
    hboToggle.checked = data.hboState || false;
});

// Use chrome.storage.local to save the states
youtubeToggle.addEventListener('change', function () {
    chrome.storage.local.set({ youtubeState: this.checked });
    youtubeStatus.textContent = this.checked ? 'Enabled' : 'Disabled'; // Optional: Update status text
});

netflixToggle.addEventListener('change', function () {
    chrome.storage.local.set({ netflixState: this.checked });
    netflixStatus.textContent = this.checked ? 'Enabled' : 'Disabled'; // Optional: Update status text
});

hboToggle.addEventListener('change', function () {
    chrome.storage.local.set({ hboState: this.checked });
    hboStatus.textContent = this.checked ? 'Enabled' : 'Disabled'; // Optional: Update status text
});
