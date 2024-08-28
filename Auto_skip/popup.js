document.addEventListener('DOMContentLoaded', function () {
    const youtubeToggle = document.getElementById('youtubeToggle');
    const netflixToggle = document.getElementById('netflixToggle');
    const youtubeStatus = document.getElementById('youtubeStatus');
    const netflixStatus = document.getElementById('netflixStatus');

    // Show the donate screen for 5 seconds
    const donateScreen = document.getElementById('donateScreen');
    const timerElement = document.getElementById('timer');
    let seconds = 5;

    donateScreen.style.display = 'flex';

    const countdown = setInterval(() => {
        timerElement.textContent = `${--seconds}s`;
        if (seconds <= 0) {
            clearInterval(countdown);
            donateScreen.style.display = 'none';
        }
    }, 1000);

    chrome.storage.local.get(['youtubeState', 'netflixState'], function (data) {
        youtubeToggle.checked = data.youtubeState || false;
        netflixToggle.checked = data.netflixState || false;
        updateStatusText(youtubeToggle.checked, youtubeStatus);
        updateStatusText(netflixToggle.checked, netflixStatus);
    });

    youtubeToggle.addEventListener('change', function () {
        chrome.storage.local.set({ youtubeState: this.checked });
        updateStatusText(this.checked, youtubeStatus);
    });

    netflixToggle.addEventListener('change', function () {
        chrome.storage.local.set({ netflixState: this.checked });
        updateStatusText(this.checked, netflixStatus);
    });

    function updateStatusText(isEnabled, statusElement) {
        statusElement.textContent = isEnabled ? 'Enabled' : 'Disabled';
    }
});
