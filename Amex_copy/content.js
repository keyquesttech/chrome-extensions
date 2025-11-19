chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  try {
    console.log(`Received request: ${request.action}`);
    let elements = [];
    let selectors = {
      // Updated selector for Amount
      copyAmount: [
        'p.body-bold.flex-item-grow.text-align-right.text-nowrap'
      ],
      // Updated selector for Description
      copyDescription: [
        'a[id^="NotExpandedExtendedTransaction"][data-icon="false"]'
      ],
      // Updated selector for Date
      copyDate: [
        'div.font-weight-regular.body-bold.text-nowrap'
      ]
    };

    function findElements(selectorList) {
      for (let selector of selectorList) {
        const found = document.querySelectorAll(selector);
        if (found.length > 0) {
          console.log(`Found ${found.length} elements using selector: ${selector}`);
          return Array.from(found);
        }
      }
      console.log(`No elements found for selectors: ${selectorList.join(', ')}`);
      return [];
    }

    function extractText(el, action) {
      const text = el.textContent.trim();
      console.log(`Extracting ${action}: ${text}`);
      if (action === "copyAmount") {
        // Preserve negative sign and remove any non-numeric characters except for - . and ,
        const numericContent = text.replace(/[^\d.,-]/g, '');
        // Ensure the negative sign is at the beginning if present
        return numericContent.startsWith('-') ? numericContent : numericContent.replace('-', '') || "N/A";
      } else if (action === "copyDate") {
        // Return the date text as-is, without trying to parse it
        return text;
      }
      return text;
    }

    if (request.action in selectors) {
      elements = findElements(selectors[request.action]);
    } else {
      console.log(`Unknown action: ${request.action}`);
    }

    if (elements.length > 0) {
      const text = elements.map(el => extractText(el, request.action)).join('\n');
      console.log(`Extracted ${request.action}: ${text}`);
      sendResponse({text: text, success: true});
    } else {
      console.log(`No elements found for ${request.action}`);
      sendResponse({text: '', success: false, error: 'No elements found'});
    }
  } catch (error) {
    console.error('Error in content script:', error);
    sendResponse({text: '', success: false, error: error.message});
  }

  return true;
});