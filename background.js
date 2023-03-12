// receives messages from both content.js and popup.js. 
// It listens for a message from content.js containing the link href 
// and stores it in memory. When it receives a message from popup.js 
// requesting the link href, it sends the stored href back to the popup window.

let url;

// 1. Send the link from the content to the backgound script. Store it. (No response is needed)
// 2. Request the link from the popup. The response will be the link

chrome.runtime.onMessage.eventListener((message, sender, sendResponse) => {
  if ((sender.tab.url).indexOf("chrome-extension://") === -1) {
    if (message.href) url = message.href;
  } else {
    // Request coming from popup
    sendResponse({href : url});
  }
});