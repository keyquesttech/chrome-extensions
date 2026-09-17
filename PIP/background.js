'use strict';

const DEFAULT_SETTINGS = {
    enabled: true,
    autoPip: false,
    autoExitOnReturn: true,
    onlyWhenPlaying: true
};

const YOUTUBE_MATCHES = ['*://www.youtube.com/*', '*://m.youtube.com/*'];

/* ---------------------------------------------------------------------- *
 * Tab helpers
 * ---------------------------------------------------------------------- */

async function notifyTab(tabId, message) {
    if (typeof tabId !== 'number') {
        return;
    }
    try {
        // Tabs without our content script reject; that is expected.
        await chrome.tabs.sendMessage(tabId, message);
    } catch (_) {
        /* no receiver in that tab */
    }
}

// The url filter is allowed because the manifest declares host permissions for
// exactly these patterns.
async function getYouTubeTabs() {
    try {
        const tabs = await chrome.tabs.query({ url: YOUTUBE_MATCHES });
        return tabs || [];
    } catch (_) {
        return [];
    }
}

/* ---------------------------------------------------------------------- *
 * Settings broadcast
 *
 * Content scripts listen to chrome.storage.onChanged themselves, but an
 * orphaned content script (after an extension reload) no longer can, so the
 * worker also pushes settings straight to every YouTube tab.
 * ---------------------------------------------------------------------- */

chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'sync') {
        return;
    }

    let settings;
    try {
        settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    } catch (_) {
        return;
    }

    const tabs = await getYouTubeTabs();
    for (const tab of tabs) {
        await notifyTab(tab.id, { action: 'settingsChanged', settings: settings });
    }
});

/* ---------------------------------------------------------------------- *
 * Re-injection
 *
 * MV3 static content scripts are not injected into already-open tabs when the
 * extension is installed, updated or reloaded, and the previously injected
 * ones are orphaned. Inject them again so open YouTube tabs keep working
 * without a manual refresh.
 * ---------------------------------------------------------------------- */

async function injectIntoOpenTabs() {
    const tabs = await getYouTubeTabs();

    for (const tab of tabs) {
        if (typeof tab.id !== 'number' || tab.discarded) {
            continue;
        }

        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['bridge.js']
            });
        } catch (_) {
            /* discarded tab, restricted URL, or no host permission */
            continue;
        }

        try {
            // pip-main.js guards itself with window.__ytPipExtLoaded, so a
            // still-running older copy simply keeps going and picks up the
            // settings the fresh bridge posts.
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                world: 'MAIN',
                files: ['pip-main.js']
            });
        } catch (_) {
            /* ignore */
        }
    }
}

chrome.runtime.onInstalled.addListener(() => {
    injectIntoOpenTabs();
});

chrome.runtime.onStartup.addListener(() => {
    injectIntoOpenTabs();
});
