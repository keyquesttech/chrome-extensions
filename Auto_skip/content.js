setInterval(() => {
    chrome.storage.sync.get(['youtubeState'], function (data) {
        if (data.youtubeState) {
            let skipBtn = document.querySelector('.ytp-ad-skip-button.ytp-button') ||
                document.querySelector('.ytp-ad-overlay-close-button') ||
                Array.from(document.querySelectorAll('button')).find(el => /(?:[Ss]kip [Aa]d|[Oo]mitir [Aa]nuncio)/.test(el.textContent));
            if (skipBtn) {
                skipBtn.click();
            }
        }
    });
}, 1000);
