let youtubeState = true;
let hasDisliked = false;

chrome.storage.local.get(['youtubeState'], function (data) {
    youtubeState = data.youtubeState !== undefined ? data.youtubeState : true;
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
    setInterval(skipAd, 250);  // Check more frequently
}

function skipAd() {
    if (!youtubeState) return;

    const adElements = [
        '#contents > ytd-promoted-sparkles-web-renderer',
        'ytd-ad-slot-renderer',
        'ytd-player-legacy-desktop-watch-ads-renderer',
        '#masthead-ad',
        '#player-ads',
        '.ytp-ad-overlay-container',
        '.ytp-ad-overlay-slot',
        'ytd-promoted-sparkles-text-search-renderer',
        'ytd-player-legacy-desktop-watch-ads-renderer',
        '.ytd-video-masthead-ad-v3-renderer',
        '.ytd-ad-slot-renderer'
    ];

    adElements.forEach(selector => {
        const adElement = document.querySelector(selector);
        if (adElement) {
            adElement.remove();
        }
    });

    // Updated skip button selectors and click logic
    const skipButtonSelectors = [
        '.ytp-ad-skip-button',
        '.ytp-ad-skip-button-modern',
        'button.ytp-ad-skip-button-modern',
        '.ytp-skip-ad-button',
        'button[data-tooltip-target-id="ad-skip-button"]',
        '.videoAdUiSkipButton',
        '.ytp-ad-skip-button-modern'
    ];

    for (let selector of skipButtonSelectors) {
        const skipButton = document.querySelector(selector);
        if (skipButton) {
            skipButton.click();
            console.log('Skip button clicked');
            break;  // Exit the loop after clicking a button
        }
    }

    const video = document.querySelector('video');
    if (video && video.duration) {
        if (document.querySelector('.ad-showing')) {
            video.currentTime = video.duration;
            console.log('Ad fast-forwarded');
        }
    }
}

function initAutoDislike() {
    const observer = new MutationObserver(() => {
        if (youtubeState && !hasDisliked) {
            setTimeout(checkChannelAndDislike, 10000);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function checkChannelAndDislike() {
    const channelNameElement = document.querySelector('ytd-channel-name yt-formatted-string#text');
    
    if (channelNameElement) {
        const channelName = channelNameElement.textContent.trim();
        
        if (channelName === 'Linus Tech Tips') {
            const dislikeButton = document.querySelector('button[aria-label="Dislike this video"]');
            if (dislikeButton) {
                if (dislikeButton.getAttribute('aria-pressed') === 'false') {
                    dislikeButton.click();
                    hasDisliked = true;
                    console.log('Video disliked');
                }
            }
        }
    }
}

function resetDislikeStatus() {
    hasDisliked = false;
}

let lastUrl = location.href; 
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        resetDislikeStatus();
    }
}).observe(document, {subtree: true, childList: true});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkForAds") {
        skipAd();
        setTimeout(checkChannelAndDislike, 10000);
        sendResponse({status: "Checked for ads and dislikes"});
    }
});