chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ youtubeState: false });
    chrome.storage.local.set({ netflixState: false });
});
