# Privacy Policy

**Last updated: 17 September 2026**

This policy covers the **YouTube Picture-in-Picture** Chrome extension published from this repository.

## Summary

The extension runs entirely on your device. It does not collect, store, or transmit any personal data, browsing history, or usage information. It does not connect to any external servers, analytics services, or advertising networks, and it contains no remote code.

## What is stored

The only data the extension keeps is its own on/off settings: whether the picture-in-picture button is shown, whether automatic picture-in-picture on tab switch is enabled, whether to exit picture-in-picture when you return to the tab, and whether to pop out only playing videos. These settings are saved with Chrome's built-in extension storage (`chrome.storage.sync`), which means Chrome may synchronise them between your own signed-in Chrome profiles. Nothing else is stored, and nothing is ever sent to the developer.

## Permissions

- **youtube.com host access**: needed to add the button to the YouTube player and to keep already-open YouTube tabs working after the extension is updated. The extension does not read or modify any other website.
- **storage**: needed to remember your settings.
- **scripting**: used only to load the extension's own bundled scripts into YouTube tabs that were already open when the extension was installed or updated.

## Third parties

No data is shared with third parties. The extension popup contains a link to a donation page; nothing is loaded from that page unless you choose to click the link.

## Changes

If this policy changes, the updated version will be published at this same address with a new "last updated" date.

## Contact

Questions about this policy can be raised through the issues page of the GitHub repository that hosts it.
