document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = document.getElementById('result');

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: checkAndClickElement,
    }, (injectionResults) => {
        const isElementPresent = injectionResults[0].result;

        if (isElementPresent) {
            result.textContent = 'Ad detected. Skipped';
        } else {
            result.textContent = 'No ads playing';
        }
    });
});

function checkAndClickElement() {
    const targetElement = document.querySelector('button.ytp-ad-skip-button.ytp-button');

    if (targetElement) {
        targetElement.click();
        return true;
    } else {
        return false;
    }
}
