function handleNetflix() {
    chrome.storage.local.get(['netflixState'], function (data) {
        if (data.netflixState) {
            try {
                const skipBtn = document.querySelector('button[data-uia="player-skip-intro"]') ||
                    Array.from(document.querySelectorAll('button')).find(el =>
                        /(?:[Ss]kip [Ii]ntro|[Ss]altar [Ii]ntro|[Oo]mitir [Ii]ntro)/.test(el.textContent));
                if (skipBtn) {
                    skipBtn.click();
                }
            } catch (error) {
                console.error('Error trying to skip Netflix intro:', error);
            }
        }
    });
}

setInterval(handleNetflix, 1000);
