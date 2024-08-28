chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ youtubeState: false, netflixState: false }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error setting initial states:", chrome.runtime.lastError);
        }
    });
});
