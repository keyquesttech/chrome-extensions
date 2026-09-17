const DEFAULT_SETTINGS = {
    enabled: true,
    autoPip: false,
    autoExitOnReturn: true,
    onlyWhenPlaying: true
};

function hasStorage() {
    return typeof chrome !== 'undefined' && !!(chrome.storage && chrome.storage.sync);
}

document.addEventListener('DOMContentLoaded', () => {
    const toggles = {
        enabled: document.getElementById('enabledToggle'),
        autoPip: document.getElementById('autoPipToggle'),
        autoExitOnReturn: document.getElementById('autoExitOnReturnToggle'),
        onlyWhenPlaying: document.getElementById('onlyWhenPlayingToggle')
    };
    function apply(data) {
        for (const key of Object.keys(DEFAULT_SETTINGS)) {
            const toggle = toggles[key];
            if (!toggle) {
                continue;
            }
            toggle.checked = data[key] !== undefined ? !!data[key] : DEFAULT_SETTINGS[key];
        }
    }

    if (hasStorage()) {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (data) => {
            apply(data || DEFAULT_SETTINGS);
        });
    } else {
        apply(DEFAULT_SETTINGS);
    }

    for (const key of Object.keys(DEFAULT_SETTINGS)) {
        const toggle = toggles[key];
        if (!toggle) {
            continue;
        }

        toggle.addEventListener('change', () => {
            if (!hasStorage()) {
                return;
            }
            chrome.storage.sync.set({ [key]: toggle.checked }, () => {
                // Quota or sync errors must be read, not thrown.
                if (chrome.runtime.lastError) {
                    console.warn(
                        '[YouTube PiP] could not save setting:',
                        chrome.runtime.lastError.message
                    );
                }
            });
        });
    }

    document.getElementById('optionsLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        }
    });
});
