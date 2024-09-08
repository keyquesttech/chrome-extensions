document.addEventListener('DOMContentLoaded', function() {
    const buttons = ['Amount', 'Description', 'Date'];
    const statusDiv = document.getElementById('status');
    
    buttons.forEach(button => {
      document.getElementById(`copy${button}`).addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: `copy${button}`}, function(response) {
            if (chrome.runtime.lastError) {
              statusDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
            } else if (response && response.text) {
              navigator.clipboard.writeText(response.text).then(() => {
                statusDiv.textContent = `All ${button}s copied to clipboard!`;
              }).catch(err => {
                statusDiv.textContent = 'Failed to copy: ' + err;
              });
            } else {
              statusDiv.textContent = `No ${button}s found on the page.`;
            }
          });
        });
      });
    });
  });