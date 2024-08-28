let youtubeState = false;
let hasDisliked = false;

chrome.storage.local.get(['youtubeState'], function (data) {
    youtubeState = data.youtubeState || false;
    console.log('YouTube state loaded:', youtubeState);
    if (youtubeState) {
        initAdSkipper();
        initAutoDislike();
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.youtubeState) {
        youtubeState = changes.youtubeState.newValue;
        console.log('YouTube state changed:', youtubeState);
        if (youtubeState) {
            initAdSkipper();
            initAutoDislike();
        }
    }
});

function initAdSkipper() {
    console.log('Initializing ad skipper');
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

function initAutoDislike() {
    console.log('Initializing auto dislike');
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
    console.log('Checking channel and dislike status');
    const channelLink = document.querySelector('a.yt-simple-endpoint[href="/@LinusTechTips"]');
    if (channelLink && channelLink.textContent === 'Linus Tech Tips') {
        console.log('Linus Tech Tips channel detected');
        const dislikeButton = document.querySelector('button[aria-label="Dislike this video"]');
        if (dislikeButton) {
            if (dislikeButton.getAttribute('aria-pressed') === 'false') {
                console.log('Attempting to dislike video');
                dislikeButton.click();
                hasDisliked = true;
                console.log('Video disliked: Linus Tech Tips');
            } else {
                console.log('Video already disliked');
            }
        } else {
            console.log('Dislike button not found');
        }
    } else {
        console.log('Not a Linus Tech Tips video');
    }
}

// Reset hasDisliked when navigating to a new video
function resetDislikeStatus() {
    hasDisliked = false;
    console.log('Dislike status reset');
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
        console.log('Received checkForAds message');
        trySkipAd();
        setTimeout(checkChannelAndDislike, 10000); // 10 second delay
        sendResponse({status: "Checked for ads and dislikes"});
    }
});