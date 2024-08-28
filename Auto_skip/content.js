let youtubeState = false;

chrome.storage.local.get(['youtubeState'], function (data) {
    youtubeState = data.youtubeState || false;
    if (youtubeState) {
        initAdSkipper();
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.youtubeState) {
        youtubeState = changes.youtubeState.newValue;
        if (youtubeState) {
            initAdSkipper();
        }
    }
});

function initAdSkipper() {
    const observer = new MutationObserver(() => {
        if (youtubeState) {
            trySkipAd();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function trySkipAd() {
    try {
        const skipSelectors = [
            '.ytp-ad-skip-button',
            '.ytp-ad-skip-button-modern',
            '.ytp-skip-ad-button',
            '.ytp-ad-skip-button-container button',
            'button[data-tooltip-target-id="ad-skip-button"]'
        ];
        
        for (let selector of skipSelectors) {
            const skipBtn = document.querySelector(selector);
            if (skipBtn) {
                skipBtn.click();
                console.log('Ad skipped successfully');
                return;
            }
        }
    } catch (error) {
        console.error('Error trying to skip YouTube ad:', error);
    }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkForAds") {
        trySkipAd();
    }
});