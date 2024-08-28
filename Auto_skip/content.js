function handleYouTube() {
    chrome.storage.local.get(['youtubeState'], function (data) {
        if (data.youtubeState) {
            try {
                const skipSelectors = [
                    '.ytp-ad-skip-button.ytp-button',
                    '.ytp-ad-overlay-close-button',
                    '.ytp-ad-skip-button-modern.ytp-button',
                    '.ytp-skip-ad-button.ytp-skip-ad-button--new--pos.ytp-ad-skip-button-modern',
                    '.ytp-skip-ad-button'
                ];
                const skipBtn = skipSelectors.map(selector => document.querySelector(selector)).find(btn => btn);
                if (skipBtn) {
                    skipBtn.click();
                }
            } catch (error) {
                console.error('Error trying to skip YouTube ad:', error);
            }
        }
    });
}

setInterval(handleYouTube, 1000);
