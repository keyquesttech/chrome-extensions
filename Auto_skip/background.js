chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ youtubeState: false });
    chrome.storage.sync.set({ netflixState: false });
    chrome.storage.sync.set({ hboState: false });
});
