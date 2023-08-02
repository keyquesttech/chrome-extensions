chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.state !== undefined) {
        chrome.storage.sync.set({ state: request.state }, function () {
            if (request.state) {
                chrome.tabs.query({ url: '*://*.youtube.com/*' }, function (tabs) {
                    for (let tab of tabs) {
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ['content.js']
                        });
                    }
                });
            }
        });
    }
});

chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (changes.state) {
        chrome.tabs.query({ url: '*://*.youtube.com/*' }, function (tabs) {
            for (let tab of tabs) {
                chrome.tabs.sendMessage(tab.id, { state: changes.state.newValue });
            }
        });
    }
});
