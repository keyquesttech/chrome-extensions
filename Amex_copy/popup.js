document.addEventListener('DOMContentLoaded', function() {
  const buttons = ['Amount', 'Description', 'Date'];
  const statusDiv = document.getElementById('status');
  const defaultMessage = 'Go to amex website to copy';
  let resetTimer;
  let buttonResetTimers = {};

  function resetStatusText() {
    statusDiv.textContent = defaultMessage;
  }

  function setStatusWithReset(message) {
    clearTimeout(resetTimer);
    statusDiv.textContent = message;
    resetTimer = setTimeout(resetStatusText, 5000); // 5 seconds
  }

  function resetButtonStyle(button) {
    button.classList.remove('clicked');
  }

  buttons.forEach(buttonText => {
    const button = document.getElementById(`copy${buttonText}`);
    button.addEventListener('click', function() {
      // Change button style
      button.classList.add('clicked');

      // Clear existing timer for this button
      clearTimeout(buttonResetTimers[buttonText]);

      // Set new timer to reset button style after 10 seconds
      buttonResetTimers[buttonText] = setTimeout(() => resetButtonStyle(button), 10000);

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: `copy${buttonText}`}, function(response) {
          if (chrome.runtime.lastError) {
            setStatusWithReset('Error: ' + chrome.runtime.lastError.message);
          } else if (response && response.text) {
            navigator.clipboard.writeText(response.text).then(() => {
              setStatusWithReset(`All ${buttonText}s copied to clipboard!`);
            }).catch(err => {
              setStatusWithReset('Failed to copy: ' + err);
            });
          } else {
            setStatusWithReset(`No ${buttonText}s found on the page.`);
          }
        });
      });
    });
  });

  // Set default message on load
  resetStatusText();
});