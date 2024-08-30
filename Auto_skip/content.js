let youtubeState = false;
let hasDisliked = false;

chrome.storage.local.get(['youtubeState'], function (data) {
    youtubeState = data.youtubeState || false;
    if (youtubeState) {
        initAdSkipper();
        initAutoDislike();
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.youtubeState) {
        youtubeState = changes.youtubeState.newValue;
        if (youtubeState) {
            initAdSkipper();
            initAutoDislike();
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
                return;
            }
        }
    } catch (error) {
        // Error handling removed
    }
}

function initAutoDislike() {
    const observer = new MutationObserver(() => {
        if (youtubeState && !hasDisliked) {
            setTimeout(checkChannelAndDislike, 10000); // 10 second delay
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function checkChannelAndDislike() {
    const channelNameElement = document.querySelector('ytd-channel-name yt-formatted-string#text');
    if (channelNameElement && window.channelsToDislike.includes(channelNameElement.textContent.trim())) {
        const dislikeButton = document.querySelector('dislike-button-view-model button') || 
                              document.querySelector('button[aria-label="Dislike this video"]') ||
                              document.querySelector('ytd-menu-renderer button[aria-label^="Dislike"]');
        if (dislikeButton) {
            if (dislikeButton.getAttribute('aria-pressed') === 'false') {
                dislikeButton.click();
                hasDisliked = true;
            }
        }
    }
}

function resetDislikeStatus() {
    hasDisliked = false;
}

// Listen for YouTube navigation events
let lastUrl = location.href; 
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        resetDislikeStatus();
    }
}).observe(document, {subtree: true, childList: true});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkForAds") {
        trySkipAd();
        setTimeout(checkChannelAndDislike, 10000); // 10 second delay
        sendResponse({status: "Checked for ads and dislikes"});
    }
});