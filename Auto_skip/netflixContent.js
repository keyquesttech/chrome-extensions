setInterval(() => {
    chrome.storage.sync.get(['netflixState'], function (data) {
        if (data.netflixState) {
            let skipBtn = document.querySelector('button[data-uia="player-skip-intro"]') ||
                Array.from(document.querySelectorAll('button')).find(el => /(?:[Ss]kip [Ii]ntro)/.test(el.textContent));
            if (skipBtn) {
                skipBtn.click();
            }
        }
    });
}, 1000);
