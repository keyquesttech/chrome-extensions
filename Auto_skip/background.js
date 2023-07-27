chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^https:\/\/www\.youtube\.com/.test(tab.url)) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: checkForElement,
        });
    }
});

function checkForElement() {
    const checkElement = setInterval(function () {
        const elements = document.getElementsByClassName('ytp-ad-skip-button ytp-button');
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].innerText == 'Skip Ads') {
                console.log('Skip Ads button is found');
                elements[i].click(); // click the button
                console.log('Skip Ads button clicked');
            }
        }
    }, 1000); // Check every 1 second
}