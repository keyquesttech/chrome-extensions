# Chrome Web Store listing — YouTube Picture-in-Picture 1.0.0

Everything below is ready to paste into the developer dashboard.
Upload package: `youtube-picture-in-picture-1.0.0.zip`

---

## Store listing tab

**Extension name**

```
YouTube Picture-in-Picture
```

**Short description** (max 132 characters — this one is 111)

```
Adds a picture-in-picture button to the YouTube player, plus optional automatic PiP when you switch tabs.
```

**Category** — recommended: **Productivity**.
It is a small utility that adds a control to a page you already use, and it is
not itself an entertainment product. *Entertainment* is a defensible second
choice if you would rather sit next to other YouTube tools; pick one, it can be
changed later.

**Language** — English (United States).

**Detailed description** (plain text, paste as-is)

```
YouTube Picture-in-Picture adds the picture-in-picture button that YouTube keeps
hidden. You get it right where you expect it: in the player control bar, just to
the right of the fullscreen button. One click pops the video into a floating
always-on-top window, and one more click puts it back.

The button behaves exactly like Chrome's own picture-in-picture, because it is
Chrome's own picture-in-picture. Nothing about the video, the player or your
account is changed; the extension only adds a control.

It can also open picture-in-picture automatically when you switch to another
tab, so a video you are listening to follows you around the browser instead of
being left behind. When you come back to the YouTube tab, the floating window
closes again.

Four settings, in the toolbar popup and on the options page:
- Show PiP button — turn the player button on or off.
- Auto PiP on tab switch — open picture-in-picture automatically when you leave
  the tab.
- Exit PiP when I come back — close the floating window again when you return.
- Only while playing — never pop out a paused or finished video.

A note on automatic picture-in-picture: this part depends on Chrome, not on the
extension. Chrome only allows a page to open picture-in-picture by itself from
Chrome 134 onwards, and only when it considers the site eligible — which usually
means allowing "Automatic picture-in-picture" for youtube.com under Site
settings. The options page explains exactly where to find that. The manual
button always works regardless.

No accounts, no tracking, no ads, no data collection of any kind. Your four
settings are stored with Chrome's own settings sync and never leave your
browser. The extension works only on youtube.com.
```

---

## Privacy tab

**Single purpose**

```
Adds a picture-in-picture button to the YouTube video player and optionally
opens picture-in-picture automatically when the user switches away from the tab.
```

**Permission justifications**

`storage`

```
Stores the extension's four on/off settings (show button, auto PiP on tab
switch, exit on return, only while playing) using chrome.storage.sync, so they
persist and follow the user's Chrome profile. No other data is stored.
```

`scripting`

```
Used only to re-inject this extension's own two content scripts into YouTube
tabs that are already open when the extension is installed or updated. Without
it those tabs keep an orphaned, non-functional copy of the extension until the
user manually reloads the page. It is never used to inject code into any other
site, and never to run remote or generated code.
```

Host permission — `*://www.youtube.com/*` and `*://m.youtube.com/*`

```
The extension only works on YouTube watch pages: it adds the button to the
player and reacts to Chrome's picture-in-picture action there. The host
permission is also what lets the extension find its own already-open YouTube
tabs in order to re-inject its content scripts after an update and to push a
settings change to them immediately. No other host is requested.
```

**Remote code**

```
No, I am not using remote code.
```

All JavaScript and CSS is contained in the uploaded package. There are no
`<script src="http...">` tags, no `eval`, no remotely hosted fonts or
stylesheets, and no runtime downloads. (The popup contains one ordinary link to
a PayPal donation page, which only opens if the user clicks it.)

**Data usage disclosure** — tick nothing in the data collection list, then
confirm all three certification checkboxes.

```
This extension does not collect or transmit any user data. It has no analytics,
no telemetry, no external servers and no network requests of its own. The only
data it stores is the four boolean settings above, kept in chrome.storage.sync
inside the user's own browser profile.
```

**Privacy policy URL**

```
https://github.com/keyquesttech/chrome-extensions/blob/main/PRIVACY_POLICY.md
```

---

## Images to upload

| File | Size | Slot | Notes |
|---|---|---|---|
| `store-icon-128x128.png` | 128×128 | Store icon (required) | Ready to use. 96×96 artwork centred with 16 px transparent padding, per the store guideline — the store adds its own rounded frame and shadow. |
| `screenshot-1-1280x800.png` | 1280×800 | Screenshot (at least one required) | **PLACEHOLDER — replace before submitting.** |
| `promo-small-440x280.png` | 440×280 | Small promo tile | Ready to use. |
| `promo-marquee-1400x560.png` | 1400×560 | Marquee promo tile (optional) | Ready to use. |

### The screenshot must be replaced

`screenshot-1-1280x800.png` is a stylised illustration of the control bar, not a
capture of the real product. Chrome Web Store policy requires screenshots to
show the actual extension in use, and a reviewer can reject a listing whose
images are mock-ups. Before you submit, replace it with real captures at exactly
1280×800:

1. Open any `youtube.com/watch` page and play a video.
2. Hover the player so the control bar is visible, and capture the window with
   the picture-in-picture button visible to the right of the fullscreen button.
   Crop/scale to exactly 1280×800.
3. Take a second screenshot with the toolbar popup open, showing the four
   toggles.
4. A third showing a video in the floating picture-in-picture window is a good
   optional extra.

You may upload up to five screenshots; at least one is required.

---

## How to test (paste into "Notes for reviewers")

```
1. Install the extension and open any https://www.youtube.com/watch?v=... page.
2. Hover the player. A picture-in-picture button appears in the control bar
   immediately to the right of the fullscreen button. Click it: the video moves
   into a floating window. Click it again (or the button in the floating window)
   to put it back.
3. Click the extension's toolbar icon to see four toggles. Turning off
   "Show PiP button" removes the button from the player immediately, with no
   page reload.
4. Turn on "Auto PiP on tab switch", play a video with sound, then switch to
   another tab: Chrome opens the video in a floating window. Switch back and it
   closes. This step depends on Chrome's own "Automatic picture-in-picture"
   site permission for youtube.com (Chrome 134+); if it does not trigger, allow
   that permission under Site settings. Step 2 works regardless.

The extension has no account, no login and no server. All settings are local.
```

---

## Distribution tab

- Visibility: **Public** (or *Unlisted* if you want to share by link only).
- Distribution: all regions, unless you have a reason to limit it.
- Not for mature audiences; no ads; no paid features.
