setInterval(() => {
    chrome.storage.sync.get(['youtubeState'], function (data) {
        if (data.youtubeState) {
            let skipBtn = document.querySelector('.ytp-ad-skip-button.ytp-button') ||
                Array.from(document.querySelectorAll('button')).find(el => /(?:[Ss]kip [Aa]d)/.test(el.textContent));

            if (skipBtn) {
                skipBtn.click();
            }
        }
    });
}, 1000);
