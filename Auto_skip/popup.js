document.addEventListener('DOMContentLoaded', function () {
    const youtubeToggle = document.getElementById('youtubeToggle');
    const youtubeStatus = document.getElementById('youtubeStatus');

    // Show the donate screen for 1 seconds
    const donateScreen = document.getElementById('donateScreen');
    const timerElement = document.getElementById('timer');
    let seconds = 1;

    donateScreen.style.display = 'flex';

    const countdown = setInterval(() => {
        timerElement.textContent = `${--seconds}s`;
        if (seconds <= -1) {
            clearInterval(countdown);
            donateScreen.style.display = 'none';
        }
    }, 1000);

    chrome.storage.local.get(['youtubeState'], function (data) {
        youtubeToggle.checked = data.youtubeState || false;
        updateStatusText(youtubeToggle.checked, youtubeStatus);
    });

    youtubeToggle.addEventListener('change', function () {
        chrome.storage.local.set({ youtubeState: this.checked });
        updateStatusText(this.checked, youtubeStatus);
    });

    function updateStatusText(isEnabled, statusElement) {
        statusElement.textContent = isEnabled ? 'Enabled' : 'Disabled';
        statusElement.style.marginLeft = '10px'; // Add space between label and button
    }
});