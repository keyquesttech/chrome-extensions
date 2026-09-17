const DEFAULT_SETTINGS = {
    enabled: true,
    autoPip: false,
    autoExitOnReturn: true,
    onlyWhenPlaying: true
};

const status = document.getElementById('status');

function hasStorage() {
    return typeof chrome !== 'undefined' && !!(chrome.storage && chrome.storage.sync);
}

function getInputs() {
    const inputs = {};
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
        inputs[key] = document.getElementById(key);
    }
    return inputs;
}

const inputs = getInputs();

function apply(data) {
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
        const input = inputs[key];
        if (!input) {
            continue;
        }
        input.checked = data[key] !== undefined ? !!data[key] : DEFAULT_SETTINGS[key];
    }
}

function save(key, value) {
    if (!hasStorage()) {
        return;
    }

    chrome.storage.sync.set({ [key]: value }, () => {
        // Quota or sync errors must be read, not thrown.
        if (chrome.runtime.lastError) {
            status.textContent = 'Could not save.';
            return;
        }
        status.textContent = 'Saved.';
        clearTimeout(save._timer);
        save._timer = setTimeout(() => { status.textContent = ''; }, 2000);
    });
}

if (hasStorage()) {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (data) => {
        apply(data || DEFAULT_SETTINGS);
    });
} else {
    apply(DEFAULT_SETTINGS);
}

for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const input = inputs[key];
    if (!input) {
        continue;
    }

    input.addEventListener('change', () => {
        save(key, input.checked);
    });
}
