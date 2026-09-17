# Submission checklist — YouTube Picture-in-Picture 1.0.0

Field text to paste at every step lives in `LISTING.md`.

## Before you start

1. **Replace the placeholder screenshot.** `screenshot-1-1280x800.png` is an
   illustration, not a capture of the real extension. Take real 1280×800
   screenshots as described in LISTING.md → "The screenshot must be replaced".
   This is the single most likely cause of a rejection in this pack.
2. **Confirm the privacy policy URL resolves.** The listing points at
   `https://github.com/keyquesttech/chrome-extensions/blob/main/PRIVACY_POLICY.md`
   — the file must exist and be publicly readable before you submit.
3. **Load the zip's contents unpacked one last time** (`chrome://extensions` →
   Developer mode → Load unpacked → select `PIP/`) and walk through the four
   test steps in LISTING.md.

## Submitting

4. **Developer account.** Go to https://chrome.google.com/webstore/devconsole
   and sign in. First-time publishers pay a **one-time $5 registration fee** and
   must verify their account before any item can be submitted.
5. **Create the item.** "Add new item" → upload
   `youtube-picture-in-picture-1.0.0.zip` (19.9 KB). The dashboard reads the
   manifest and creates a draft. Note the item ID it assigns.
6. **Store listing tab.** Paste the extension name, short description and
   detailed description from LISTING.md. Set category **Productivity** and
   language **English (United States)**.
7. **Upload images.** `store-icon-128x128.png` as the store icon, at least one
   1280×800 screenshot (your real ones), `promo-small-440x280.png` for the small
   tile and, optionally, `promo-marquee-1400x560.png`.
8. **Privacy tab.** Fill in:
   - Single purpose — one sentence from LISTING.md.
   - Permission justification for `storage`, for `scripting`, and for the
     youtube.com host permission — one box each.
   - "Are you using remote code?" → **No, I am not using remote code.**
   - Data usage — tick **nothing** in the collected-data list, then tick all
     three certification checkboxes (no unauthorised use, no unauthorised
     transfer, no sale of data).
   - Paste the privacy policy URL.
9. **Notes for reviewers.** Paste the "How to test" block from LISTING.md.
10. **Distribution tab.** Visibility **Public**, all regions.
11. **Submit for review.** Fix anything the dashboard flags in red first — it
    validates the manifest and the required images before it lets you submit.
    Review typically takes a few days; you get an email either way.

## After approval

12. Bump `version` in `manifest.json` for every future upload — the store
    rejects a re-upload of an existing version number. Rebuild the zip the same
    way (contents at the zip root, forward slashes).

## Pre-flight checks already performed

- `node --check` passes on all five JavaScript files: `background.js`,
  `bridge.js`, `pip-main.js`, `popup.js`, `options.js`.
- `manifest.json` parses as valid JSON. `manifest_version` 3, `version` 1.0.0,
  description 107 characters (limit 132), `minimum_chrome_version` 111 (required
  for `"world": "MAIN"` static content scripts), permissions `storage` +
  `scripting`, host permissions for `www.youtube.com` and `m.youtube.com` only.
- Zip is 19,915 bytes with 11 entries, `manifest.json` at the root, forward
  slashes only, `testzip()` clean.
- No remote resources: no Google Fonts import, no external stylesheets or
  scripts; the only outbound URL is the user-clickable PayPal donate link.
- Debug logging is off (`DEBUG = false` in `pip-main.js`).
- All four store PNGs re-open at exactly their required dimensions.
- `store-icon-128x128.png` verified as 128×128 RGBA with its outer 16 px band
  fully transparent (max alpha 0 across all 7,168 band pixels), an opaque
  centre, and the artwork bounding box exactly (16, 16, 112, 112).
