let youtubeState = true;

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ youtubeState: true }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error setting initial state:", chrome.runtime.lastError);
        }
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes("youtube.com")) {
        chrome.tabs.sendMessage(tabId, { action: "checkForAds" });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getYoutubeState") {
        chrome.storage.sync.get(['youtubeState'], function(data) {
            youtubeState = data.youtubeState !== undefined ? data.youtubeState : true;
            sendResponse({youtubeState: youtubeState});
        });
        return true; // Indicates that the response is asynchronous
    } else if (request.action === "logDebug") {
        console.log("[Ad Skip Debug]", request.message);
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.youtubeState && namespace === 'sync') {
        youtubeState = changes.youtubeState.newValue;
        chrome.tabs.query({url: "*://*.youtube.com/*"}, function(tabs) {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: "youtubeStateChanged",
                    youtubeState: youtubeState
                });
            });
        });
    }
});