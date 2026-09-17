(function () {
    'use strict';

    if (window.__ytPipExtLoaded) {
        return;
    }
    window.__ytPipExtLoaded = true;

    const DEBUG = false;
    const LOG_PREFIX = '[YouTube PiP]';

    const MESSAGE_SOURCE = 'yt-pip-ext';
    const BUTTON_CLASS = 'ytp-ext-pip-button';
    const WATCH_PATH = /^\/(watch|live|embed)(\/|$)/;
    const OBSERVER_DEBOUNCE_MS = 250;

    // Chrome closes an automatic PiP window itself when the page becomes
    // visible again. Wait before exiting ourselves so we never race it.
    const RETURN_EXIT_DELAY_MS = 500;
    const BLACK_FRAME_DELAY_MS = 300;
    const FRAME_SAMPLE_GAP_MS = 400;
    const HAVE_CURRENT_DATA = 2;
    const PIP_PATH = 'M1 6a2 2 0 012-2h18a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V6Zm2 0v12h18V6H3Zm16 6h-6v4h6v-4Z';

    const LABEL_ENTER = 'Picture-in-picture';
    const LABEL_EXIT = 'Exit picture-in-picture';

    // Defaults until the bridge answers with the stored settings. autoPip
    // starts false, so a handler YouTube registers before that reply arrives is
    // passed straight through to Chrome and remembered in siteEnterPipHandler;
    // applySettings() then calls applyAutoPipHandler(), which swaps ours in.
    let settings = {
        enabled: true,
        autoPip: false,
        autoExitOnReturn: true,
        onlyWhenPlaying: true
    };

    let button = null;
    let autoEntered = false;
    let observer = null;
    let observedTarget = null;
    let observerTimer = null;
    let navTimer = null;
    let exitTimer = null;
    let blackFrameTimer = null;
    let weRequestedExit = false;

    /* ------------------------------------------------------------------ *
     * Page helpers
     * ------------------------------------------------------------------ */

    function log() {
        if (!DEBUG) {
            return;
        }
        const args = Array.prototype.slice.call(arguments);
        args.unshift(LOG_PREFIX);
        console.debug.apply(console, args);
    }

    function isWatchPage() {
        return WATCH_PATH.test(location.pathname);
    }

    function getPlayer() {
        return (
            document.querySelector('#movie_player') ||
            document.querySelector('.html5-video-player')
        );
    }

    function getVideo() {
        const player = getPlayer();
        if (!player) {
            return null;
        }
        return (
            player.querySelector('video.html5-main-video') ||
            player.querySelector('video')
        );
    }

    function pipSupported() {
        return !!(document.pictureInPictureEnabled && document.exitPictureInPicture);
    }

    /* ------------------------------------------------------------------ *
     * Media Session patch (installed at document_start, before YouTube)
     * ------------------------------------------------------------------ */

    const msProto = window.MediaSession ? window.MediaSession.prototype : null;
    const origSet = msProto ? msProto.setActionHandler : null;
    let siteEnterPipHandler = null;

    function realSet(action, handler) {
        if (!origSet || !navigator.mediaSession) {
            return;
        }
        try {
            origSet.call(navigator.mediaSession, action, handler || null);
        } catch (_) {
            /* Chrome versions that do not know the action throw TypeError. */
        }
    }

    if (origSet) {
        msProto.setActionHandler = function (action, handler) {
            if (action === 'enterpictureinpicture' && this === navigator.mediaSession) {
                siteEnterPipHandler = handler || null;
                log(
                    'site registered its own enterpictureinpicture handler:',
                    handler ? 'handler' : 'null',
                    settings.autoPip ? '(swallowed, ours stays)' : '(passed through)'
                );
                if (settings.autoPip) {
                    // Keep our handler installed; remember what the site wanted.
                    return undefined;
                }
            }
            return origSet.call(this, action, handler);
        };
    }

    // Chrome calls action handlers with a details object, so wrap rather than
    // registering onAutoEnterPip (whose argument is a log label) directly.
    // The handler resolves the video with getVideo() at call time, so it stays
    // correct when YouTube swaps the video element between registrations.
    function mediaSessionEnterPip() {
        onAutoEnterPip('media-session action fired by Chrome');
    }

    function applyAutoPipHandler() {
        if (!origSet) {
            return;
        }
        realSet(
            'enterpictureinpicture',
            settings.autoPip ? mediaSessionEnterPip : siteEnterPipHandler
        );
    }

    /* ------------------------------------------------------------------ *
     * PiP actions
     * ------------------------------------------------------------------ */

    async function onAutoEnterPip(reason) {
        const video = getVideo();

        log('auto-PiP requested', {
            reason: reason || 'media-session action',
            autoPip: settings.autoPip,
            watchPage: isWatchPage(),
            paused: video ? video.paused : null,
            ended: video ? video.ended : null,
            readyState: video ? video.readyState : null,
            inPip: !!document.pictureInPictureElement
        });

        if (!settings.autoPip || !pipSupported()) {
            return false;
        }
        if (!isWatchPage()) {
            return false;
        }
        if (document.pictureInPictureElement) {
            log('auto-PiP skipped: already in picture-in-picture');
            return false;
        }
        if (!video || video.readyState < HAVE_CURRENT_DATA) {
            log('auto-PiP skipped: no video with current data');
            return false;
        }
        if (settings.onlyWhenPlaying && (video.paused || video.ended)) {
            log('auto-PiP skipped: video is not playing');
            return false;
        }

        try {
            video.disablePictureInPicture = false;
            await video.requestPictureInPicture();
            autoEntered = true;
            log('auto-PiP entered');
            return true;
        } catch (error) {
            /* NotAllowedError when Chrome refuses without a gesture. */
            log('auto-PiP request rejected:', error && error.name, error && error.message);
            return false;
        }
    }

    async function togglePip() {
        if (!pipSupported()) {
            return;
        }

        try {
            if (document.pictureInPictureElement) {
                log('button clicked: exiting picture-in-picture');
                cancelScheduledExit('manual exit');
                weRequestedExit = true;
                await document.exitPictureInPicture();
                return;
            }

            const video = getVideo();
            if (!video) {
                return;
            }
            log('button clicked: entering picture-in-picture');
            video.disablePictureInPicture = false;
            await video.requestPictureInPicture();
            autoEntered = false;
        } catch (error) {
            console.warn('[YouTube PiP] could not toggle picture-in-picture:', error);
        }
    }

    function cancelScheduledExit(why) {
        if (!exitTimer) {
            return;
        }
        clearTimeout(exitTimer);
        exitTimer = null;
        log('scheduled exit cancelled:', why);
    }

    function scheduleAutoExit() {
        cancelScheduledExit('superseded');
        log('scheduling our own exit in', RETURN_EXIT_DELAY_MS, 'ms (if Chrome does not close it first)');

        exitTimer = setTimeout(() => {
            exitTimer = null;

            if (
                !settings.autoExitOnReturn ||
                !autoEntered ||
                !document.pictureInPictureElement
            ) {
                log('scheduled exit not needed, window already closed');
                return;
            }

            log('exiting picture-in-picture ourselves');
            weRequestedExit = true;

            const exit = document.exitPictureInPicture();
            if (exit && typeof exit.catch === 'function') {
                exit.catch((error) => {
                    weRequestedExit = false;
                    log('our exit failed:', error && error.name);
                });
            }
        }, RETURN_EXIT_DELAY_MS);
    }

    function onVisibilityChange() {
        if (document.hidden) {
            if (settings.autoPip) {
                cancelScheduledExit('tab hidden again');
                onAutoEnterPip('visibilitychange fallback');
            }
            return;
        }

        if (
            settings.autoExitOnReturn &&
            autoEntered &&
            document.pictureInPictureElement
        ) {
            scheduleAutoExit();
        }
    }

    /* ------------------------------------------------------------------ *
     * Black frame guard
     *
     * Leaving picture-in-picture occasionally leaves the in-page video
     * stalled on a black frame with audio still running. Detect it by
     * sampling the decoded frame counter and nudge the player if it is
     * not advancing.
     * ------------------------------------------------------------------ */

    function getFrameCount(video) {
        if (typeof video.getVideoPlaybackQuality === 'function') {
            const quality = video.getVideoPlaybackQuality();
            if (quality && typeof quality.totalVideoFrames === 'number') {
                return quality.totalVideoFrames;
            }
        }
        if (typeof video.webkitDecodedFrameCount === 'number') {
            return video.webkitDecodedFrameCount;
        }
        return null;
    }

    function shouldBeRendering(video) {
        return (
            !!video &&
            !video.paused &&
            !video.ended &&
            document.visibilityState === 'visible' &&
            !document.pictureInPictureElement
        );
    }

    function nudgePlayer(video) {
        const player = getPlayer();
        try {
            if (
                player &&
                typeof player.seekTo === 'function' &&
                typeof player.getCurrentTime === 'function'
            ) {
                player.seekTo(player.getCurrentTime(), true);
                log('black frame guard: nudged via player.seekTo');
                return;
            }
            video.currentTime = video.currentTime;
            log('black frame guard: nudged via video.currentTime');
        } catch (error) {
            log('black frame guard: nudge failed:', error && error.name);
        }
    }

    function runBlackFrameGuard() {
        clearTimeout(blackFrameTimer);

        blackFrameTimer = setTimeout(() => {
            blackFrameTimer = null;

            const video = getVideo();
            if (!shouldBeRendering(video)) {
                log('black frame guard: nothing to check');
                return;
            }

            const first = getFrameCount(video);
            if (first === null) {
                log('black frame guard: no frame counter available');
                return;
            }

            blackFrameTimer = setTimeout(() => {
                blackFrameTimer = null;

                const current = getVideo();
                if (current !== video || !shouldBeRendering(current)) {
                    log('black frame guard: state changed, skipping');
                    return;
                }

                const second = getFrameCount(current);
                log('black frame guard: frames', first, '->', second);

                if (second !== null && second > first) {
                    return;
                }
                nudgePlayer(current);
            }, FRAME_SAMPLE_GAP_MS);
        }, BLACK_FRAME_DELAY_MS);
    }

    /* ------------------------------------------------------------------ *
     * Button
     * ------------------------------------------------------------------ */

    function createButton() {
        const btn = document.createElement('button');
        btn.className = 'ytp-button ' + BUTTON_CLASS;
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-label', LABEL_ENTER);
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('data-tooltip-title', LABEL_ENTER);
        btn.setAttribute('data-title-no-tooltip', LABEL_ENTER);
        btn.setAttribute('title', '');

        const svgNs = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNs, 'svg');
        svg.setAttribute('fill', 'currentColor');
        svg.setAttribute('height', '24');
        svg.setAttribute('width', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.style.display = 'block';
        svg.style.margin = '0 auto';

        const path = document.createElementNS(svgNs, 'path');
        path.setAttribute('d', PIP_PATH);
        svg.appendChild(path);
        btn.appendChild(svg);

        btn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            togglePip();
        });

        return btn;
    }

    function removeButton() {
        if (button && button.parentNode) {
            button.parentNode.removeChild(button);
        }
        button = null;
    }

    function ensureButton() {
        if (!settings.enabled || !isWatchPage() || !pipSupported()) {
            removeButton();
            return;
        }

        const player = getPlayer();
        if (!player) {
            return;
        }

        const fullscreenBtn = player.querySelector('.ytp-fullscreen-button');
        if (!fullscreenBtn) {
            return;
        }

        if (button && fullscreenBtn.nextElementSibling === button) {
            return;
        }

        if (!button || !button.isConnected) {
            const existing = player.querySelector('.' + BUTTON_CLASS);
            button = existing || createButton();
        }

        fullscreenBtn.insertAdjacentElement('afterend', button);
        syncButtonState();
    }

    function syncButtonState() {
        if (!button) {
            return;
        }
        const inPip = !!document.pictureInPictureElement;
        const label = inPip ? LABEL_EXIT : LABEL_ENTER;
        button.setAttribute('aria-label', label);
        button.setAttribute('aria-pressed', inPip ? 'true' : 'false');
        button.setAttribute('data-tooltip-title', label);
        button.setAttribute('data-title-no-tooltip', label);
    }

    /* ------------------------------------------------------------------ *
     * Scheduling / SPA navigation
     * ------------------------------------------------------------------ */

    function schedule() {
        clearTimeout(navTimer);
        navTimer = setTimeout(() => {
            navTimer = null;
            ensureButton();
            updateObserver();
        }, 0);
    }

    function onMutation() {
        if (observerTimer) {
            return;
        }
        observerTimer = setTimeout(() => {
            observerTimer = null;
            ensureButton();
            updateObserver();
        }, OBSERVER_DEBOUNCE_MS);
    }

    function observeTarget(target) {
        if (!target || observedTarget === target) {
            return;
        }
        if (!observer) {
            observer = new MutationObserver(onMutation);
        }
        observer.disconnect();
        observer.observe(target, { childList: true, subtree: true });
        observedTarget = target;
    }

    /**
     * Watching the whole document forever is expensive on a page as busy as
     * YouTube. Watch it only until the player exists, then narrow to the
     * player itself, and widen again if that element is replaced.
     * yt-navigate-finish is the cheap document-level fallback that catches a
     * replacement the narrowed observer cannot see.
     */
    function updateObserver() {
        if (observedTarget && observedTarget !== document.documentElement && !observedTarget.isConnected) {
            observedTarget = null;
        }

        const player = getPlayer();
        observeTarget(player || document.documentElement);
    }

    /* ------------------------------------------------------------------ *
     * Settings bridge
     * ------------------------------------------------------------------ */

    function applySettings(next) {
        if (!next || typeof next !== 'object') {
            return;
        }
        settings = {
            enabled: next.enabled !== undefined ? !!next.enabled : settings.enabled,
            autoPip: next.autoPip !== undefined ? !!next.autoPip : settings.autoPip,
            autoExitOnReturn:
                next.autoExitOnReturn !== undefined
                    ? !!next.autoExitOnReturn
                    : settings.autoExitOnReturn,
            onlyWhenPlaying:
                next.onlyWhenPlaying !== undefined
                    ? !!next.onlyWhenPlaying
                    : settings.onlyWhenPlaying
        };

        log('settings applied', settings);
        applyAutoPipHandler();
        ensureButton();
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

    window.addEventListener('message', (event) => {
        if (event.source !== window) {
            return;
        }
        if (event.origin !== location.origin) {
            return;
        }
        const data = event.data;
        if (!data || data.source !== MESSAGE_SOURCE) {
            return;
        }

        if (data.type === 'settings') {
            applySettings(data.settings);
        }
    });

    /* ------------------------------------------------------------------ *
     * Wiring
     * ------------------------------------------------------------------ */

    document.addEventListener('visibilitychange', onVisibilityChange);

    document.addEventListener(
        'enterpictureinpicture',
        () => {
            clearTimeout(blackFrameTimer);
            blackFrameTimer = null;
            syncButtonState();
        },
        true
    );

    document.addEventListener(
        'leavepictureinpicture',
        () => {
            const wasAuto = autoEntered;
            const byUs = weRequestedExit;

            weRequestedExit = false;
            autoEntered = false;
            cancelScheduledExit('window already closed');
            syncButtonState();

            if (!wasAuto) {
                return;
            }

            log(
                'auto-PiP session ended -',
                byUs ? 'closed by us' : 'closed by Chrome or the user'
            );
            runBlackFrameGuard();
        },
        true
    );

    document.addEventListener('yt-navigate-finish', schedule);
    window.addEventListener('yt-page-data-updated', schedule);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ensureButton();
            updateObserver();
        });
    }

    ensureButton();
    updateObserver();
    applyAutoPipHandler();
    post({ type: 'requestSettings' });
}());
