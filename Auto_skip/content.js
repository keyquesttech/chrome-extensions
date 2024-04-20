setInterval(() => {
    chrome.storage.local.get(['youtubeState'], function (data) {
        if (data.youtubeState) {
            try {
                let skipBtn = document.querySelector('.ytp-ad-skip-button.ytp-button') ||
                              document.querySelector('.ytp-ad-overlay-close-button') ||
                              document.querySelector('.ytp-ad-skip-button-modern.ytp-button') || 
                              document.querySelector('.ytp-skip-ad-button.ytp-skip-ad-button--new--pos.ytp-ad-skip-button-modern') || 
                              document.querySelector('.ytp-skip-ad-button');  // Direct class for the button provided
                if (skipBtn) {
                    skipBtn.click();
                }
            } catch (error) {
                console.error('Error trying to skip ad:', error);
            }
        }
    });
}, 1000);
