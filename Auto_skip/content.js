let youtubeState = true;
let hasDisliked = false;

function debugLog(message) {
    console.log(`[Ad Skip Debug] ${message}`);
    chrome.runtime.sendMessage({ action: "logDebug", message: message });
}

// Request initial state from background script
chrome.runtime.sendMessage({ action: "getYoutubeState" }, function(response) {
    youtubeState = response.youtubeState;
    debugLog('YouTube state loaded: ' + youtubeState);
    if (youtubeState) {
        initAdSkipper();
        initAutoDislike();
    }
});

// Listen for state changes from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "youtubeStateChanged") {
        youtubeState = request.youtubeState;
        debugLog('YouTube state changed: ' + youtubeState);
        if (youtubeState) {
            initAdSkipper();
            initAutoDislike();
        }
    } else if (request.action === "checkForAds") {
        if (youtubeState) {
            debugLog('Checking for ads...');
            attemptSkipAd();
        }
        setTimeout(checkChannelAndDislike, 10000);
        sendResponse({status: "Checked for ads and dislikes"});
    }
});

function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            } else {
                setTimeout(checkElement, 100);
            }
        };
        checkElement();
    });
}

async function attemptSkipAd() {
    debugLog('Attempting to skip ad...');

    const selectors = [
        '.ytp-ad-skip-button',
        '.ytp-ad-skip-button-modern',
        'button[aria-label="Skip Ad"]',
        'button[data-tooltip-target-id="ytp-ad-skip-button-container"]'
    ];

    for (const selector of selectors) {
        try {
            const button = await waitForElement(selector, 5000);
            debugLog(`Skip button found: ${selector}`);
            
            const buttonInfo = {
                visible: button.offsetWidth > 0 && button.offsetHeight > 0,
                enabled: !button.disabled,
                clickable: window.getComputedStyle(button).pointerEvents !== 'none'
            };
            debugLog(`Button state: ${JSON.stringify(buttonInfo)}`);

            // Attempt to click using different methods
            debugLog('Attempting direct click...');
            button.click();

            debugLog('Dispatching mousedown, mouseup, and click events...');
            ['mousedown', 'mouseup', 'click'].forEach(eventType => {
                const event = new MouseEvent(eventType, {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                button.dispatchEvent(event);
            });

            debugLog('Attempting to trigger onclick handler...');
            if (typeof button.onclick === 'function') {
                button.onclick();
            }

            // Check if the ad was skipped
            setTimeout(() => {
                const adStillPlaying = document.querySelector('.ytp-ad-player-overlay');
                if (adStillPlaying) {
                    debugLog('Ad still playing after skip attempts.');
                } else {
                    debugLog('Ad appears to have been skipped successfully.');
                }
            }, 1000);

            return;
        } catch (error) {
            debugLog(`Error with selector ${selector}: ${error.message}`);
        }
    }

    debugLog('No skip button found.');
}

function initAdSkipper() {
    debugLog('Initializing ad skipper');
    
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.target.classList.contains('ytp-ad-player-overlay')) {
                debugLog('Ad detected. Attempting to skip...');
                attemptSkipAd();
                break;
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    // Add CSS to hide ad overlays
    const style = document.createElement('style');
    style.textContent = `
        .ytp-ad-overlay-container, #player-ads, .ytp-ad-text-overlay {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
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
                    debugLog('Video disliked for channel: ' + channelName);
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

debugLog('Ad skip debug script loaded. Waiting for ads...');