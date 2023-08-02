let youtubeState = false;
let netflixState = false;

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'youtubeState') {
            youtubeState = newValue;
        }
        if (key === 'netflixState') {
            netflixState = newValue;
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'getYoutubeState') {
        sendResponse({ state: youtubeState });
    } else if (request.message === 'getNetflixState') {
        sendResponse({ state: netflixState });
    }
});
