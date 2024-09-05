let youtubeState = true;
let hasDisliked = false;

chrome.storage.local.get(['youtubeState'], function (data) {
    youtubeState = data.youtubeState !== undefined ? data.youtubeState : true;
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
    
    function observeBody() {
        if (document.body) {
            const config = { childList: true, subtree: true };

            const callback = function(mutationsList, observer) {
                if (youtubeState) {
                    skipAd();
                }
            };

            const observer = new MutationObserver(callback);
            observer.observe(document.body, config);

            // Interval-based approach as a fallback
            setInterval(skipAd, 300);

            // Add CSS to hide ad overlays
            const style = document.createElement('style');
            style.textContent = `
                .ytp-ad-overlay-container, #player-ads, .ytp-ad-text-overlay {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        } else {
            // If body is not available yet, try again after a short delay
            setTimeout(observeBody, 50);
        }
    }

    observeBody();
}

function skipAd() {
    if (!youtubeState) return;

    console.log('Checking for ads...');

    const adOverlay = document.querySelector('.ytp-ad-player-overlay');
    const video = document.querySelector('video');

    if (adOverlay && video) {
        console.log('Ad detected');
        const skipButton = document.querySelector('.ytp-skip-ad-button, .ytp-skip-ad-button-modern, .ytp-skip-button');
        
        if (skipButton) {
            console.log('Skip button detected');
            skipButton.click();
        } else {
            console.log('No skip button found, fast-forwarding ad');
            video.currentTime = video.duration;
        }
    } else {
        console.log('No ad detected');
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
        
        if (window.channelsToDislike.includes(channelName)) {
            const dislikeButton = document.querySelector('button[aria-label="Dislike this video"]');
            if (dislikeButton) {
                if (dislikeButton.getAttribute('aria-pressed') === 'false') {
                    dislikeButton.click();
                    hasDisliked = true;
                    console.log('Video disliked for channel:', channelName);
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
