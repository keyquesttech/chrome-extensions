const copyButton = document.getElementById("copyButton");
const copyButton2 = document.getElementById("copyButton2");
const copyButton3 = document.getElementById("copyButton3");
const amountCheckbox = document.getElementById("amountCheckbox");

copyButton.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: copyTransactionAmounts,
    });
});

copyButton2.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: copyDescriptions,
    });
});

copyButton3.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: copyChargeDate,
    });
});

function copyTransactionAmounts() {
    const items = Array.from(document.querySelectorAll('[data-ng-bind-html="row.transactionAmount | currencyFormatter | trustHTML"]'));
    const itemValues = items.map(item => item.innerText);
    const textToCopy = itemValues.join('\n');

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.value = textToCopy;
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    console.log('Transaction Amounts copied to clipboard: ' + textToCopy);
}

function copyDescriptions() {
    const items = Array.from(document.querySelectorAll('[data-ng-bind-html="row.descriptionLine | trim | trustHTML"]'));
    const itemValues = items.map(item => item.innerText);
    const textToCopy = itemValues.join('\n');

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.value = textToCopy;
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    console.log('Descriptions copied to clipboard: ' + textToCopy);
}

function copyChargeDate() {
    const items = Array.from(document.querySelectorAll('[data-ng-bind-html="row.chargeDate | dateFormatter"]'));
    const itemValues = items.map(item => item.innerText);
    const textToCopy = itemValues.join('\n');

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.value = textToCopy;
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    console.log('Charge Dates copied to clipboard: ' + textToCopy);
}
