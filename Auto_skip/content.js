setInterval(() => {
    // Use chrome.storage.local instead of chrome.storage.sync
    chrome.storage.local.get(['youtubeState'], function (data) {
        if (data.youtubeState) {
            try {
                // Attempt to click the skip button if it exists
                let skipBtn = document.querySelector('.ytp-ad-skip-button.ytp-button') ||
                    document.querySelector('.ytp-ad-overlay-close-button') ||
                    Array.from(document.querySelectorAll('button')).find(el => /(?:[Ss]kip [Aa]d|[Oo]mitir [Aa]nuncio)/.test(el.textContent));
                if (skipBtn) {
                    skipBtn.click();
                }
            } catch (error) {
                // Log any errors to the console for troubleshooting
                console.error('Error trying to skip ad:', error);
            }
        }
    });
}, 1000);
