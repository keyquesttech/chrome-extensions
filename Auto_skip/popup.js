document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = document.getElementById('result');

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: checkAndClickElement,
    }, (injectionResults) => {
        const isElementPresent = injectionResults[0].result;

        if (isElementPresent) {
            result.textContent = 'The element is present on the page. It has been clicked.';
        } else {
            result.textContent = 'The element is not present on the page.';
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
