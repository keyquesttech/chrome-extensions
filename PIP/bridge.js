(function () {
    'use strict';

    const MESSAGE_SOURCE = 'yt-pip-ext';

    const DEFAULT_SETTINGS = {
        enabled: true,
        autoPip: false,
        autoExitOnReturn: true,
        onlyWhenPlaying: true
    };

    // No __ytPipBridgeLoaded guard on purpose. Reloading the extension reuses
    // the same isolated world, so a persistent flag would survive the reload
    // and block the freshly injected bridge, leaving the tab with only the
    // orphaned one. Two live bridges are harmless: both post identical
    // settings, and the main world merges them idempotently.
    let settings = Object.assign({}, DEFAULT_SETTINGS);

    function hasStorage() {
        try {
            return typeof chrome !== 'undefined' && !!(chrome.storage && chrome.storage.sync);
        } catch (_) {
            /* the extension context can be invalidated after a reload */
            return false;
        }
    }

    function post(message) {
        try {
            window.postMessage(
                Object.assign({ source: MESSAGE_SOURCE }, message),
                location.origin
            );
        } catch (_) {
            /* origin can be "null" in sandboxed frames. */
        }
    }

    function postSettings() {
        post({ type: 'settings', settings: Object.assign({}, settings) });
    }

    function mergeSettings(next) {
        if (!next || typeof next !== 'object') {
            return false;
        }
        let touched = false;
        for (const key of Object.keys(DEFAULT_SETTINGS)) {
            if (Object.prototype.hasOwnProperty.call(next, key)) {
                const value = next[key];
                settings[key] = value !== undefined ? value : DEFAULT_SETTINGS[key];
                touched = true;
            }
        }
        return touched;
    }

    function load() {
        if (!hasStorage()) {
            postSettings();
            return;
        }

        try {
            chrome.storage.sync.get(DEFAULT_SETTINGS, (data) => {
                try {
                    if (chrome.runtime && chrome.runtime.lastError) {
                        postSettings();
                        return;
                    }
                } catch (_) {
                    postSettings();
                    return;
                }
                settings = Object.assign({}, DEFAULT_SETTINGS, data || {});
                postSettings();
            });
        } catch (_) {
            /* extension context invalidated */
            postSettings();
        }
    }

    window.addEventListener('message', (event) => {
        if (event.source !== window) {
            return;
        }
        if (event.origin !== location.origin) {
            return;
        }
        const data = event.data;
        if (!data || data.source !== MESSAGE_SOURCE || data.type !== 'requestSettings') {
            return;
        }
        postSettings();
    });

    if (hasStorage() && chrome.storage.onChanged) {
        try {
            chrome.storage.onChanged.addListener((changes, area) => {
                if (area !== 'sync') {
                    return;
                }

                let touched = false;
                for (const key of Object.keys(DEFAULT_SETTINGS)) {
                    if (Object.prototype.hasOwnProperty.call(changes, key)) {
                        const value = changes[key].newValue;
                        settings[key] = value !== undefined ? value : DEFAULT_SETTINGS[key];
                        touched = true;
                    }
                }

                if (touched) {
                    postSettings();
                }
            });
        } catch (_) {
            /* extension context invalidated */
        }
    }

    // Settings pushed by the service worker, which also reaches tabs whose
    // content script was orphaned by an extension reload.
    try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
            chrome.runtime.onMessage.addListener((message) => {
                if (!message || message.action !== 'settingsChanged') {
                    return undefined;
                }
                if (mergeSettings(message.settings)) {
                    postSettings();
                }
                return undefined;
            });
        }
    } catch (_) {
        /* extension context invalidated */
    }

    load();
}());
