document.addEventListener('DOMContentLoaded', function () {
    let youtubeToggle = document.getElementById('youtubeToggle');
    let netflixToggle = document.getElementById('netflixToggle');
    let youtubeStatus = document.getElementById('youtubeStatus');
    let netflixStatus = document.getElementById('netflixStatus');

    // Show the donate screen for 5 seconds
    const donateScreen = document.getElementById('donateScreen');
    const timerElement = document.getElementById('timer');
    let seconds = 5;

    donateScreen.style.display = 'flex';

    const countdown = setInterval(() => {
        seconds--;
        timerElement.textContent = seconds + 's';
        if (seconds <= 0) {
            clearInterval(countdown);
            donateScreen.style.display = 'none';
        }
    }, 1000);

    chrome.storage.local.get(['youtubeState', 'netflixState'], function (data) {
        youtubeToggle.checked = data.youtubeState || false;
        netflixToggle.checked = data.netflixState || false;
    });

    youtubeToggle.addEventListener('change', function () {
        chrome.storage.local.set({ youtubeState: this.checked });
        youtubeStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
    });

    netflixToggle.addEventListener('change', function () {
        chrome.storage.local.set({ netflixState: this.checked });
        netflixStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
    });
});
