/* If the extension should be able to skip at all */
let ShouldAttemptSkip = true;

/* Amount of seconds between each "check" for an available skip-button */
let SkipCheckSeconds = 0.5;

/* The several tags that identifies a skippable button */
let SkipButtonTags = ["SkipButton", "UpNextButton"]; // Replace with actual test ids of the HBO skip buttons

setInterval(() => {
    if (!ShouldAttemptSkip) return;

    for (const button of document.body.querySelectorAll("[role='button']")) {
        if (SkipButtonTags.includes(button?.dataset["testid"]))
            button.click();
    }
}, SkipCheckSeconds * 1000);

// Fetch the initial state from storage
chrome.storage.sync.get(['hboState'], function (data) {
    ShouldAttemptSkip = data.hboState || false;
});

// Update ShouldAttemptSkip whenever the state changes
chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName == 'sync' && 'hboState' in changes) {
        ShouldAttemptSkip = changes.hboState.newValue;
    }
});
