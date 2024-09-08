chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let elements = [];
    let selector = '';
  
    if (request.action === "copyAmount") {
      selector = '.col-md-3.col-sm-4.pad-responsive-r.flex.flex-column-md.flex-justify-end p';
    } else if (request.action === "copyDescription") {
      selector = '.description';
    } else if (request.action === "copyDate") {
      // Updated selector to target only date elements within transaction rows
      selector = '.css-qv4r03:not([for="select-all-transactions"])';
    }
  
    elements = Array.from(document.querySelectorAll(selector));
    
    if (elements.length > 0) {
      const text = elements.map(el => {
        if (request.action === "copyAmount") {
          return el.textContent.trim() || "N/A";
        } else {
          return el.textContent.trim();
        }
      }).join('\n');
      sendResponse({text: text});
    } else {
      sendResponse({text: ''});
    }
    
    return true;
  });