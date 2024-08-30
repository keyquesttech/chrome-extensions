chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ youtubeState: true }, () => {
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