/**
 *        =============
 *        BACKGROUND.JS
 *        =============
 * Since two content scripts cannot communicate directly to each other, 
 * we need a background script to act as the middle-man.
 * This will receive messages from both content.js and popup.js. 
 * 
 * It listens for a message from content.js containing the link href 
 * and stores it in memory. When it receives a message from popup.js 
 * requesting the link href, it sends the stored href back to the popup window.
 * 
 * Snoopy is the background script!
 * i.e. he gets the message and sends it back.
 */



// 1. Send the link from the content to the backgound script. Store it. (No response is needed)
// 2. Request the link from the popup. The response will be the link

let url;

const getActiveTabIndex = () => {
  return new Promise((resolve) => {
    // Query all tabs to get information about all tabs
    chrome.tabs.query({}, function(tabs) {
      // Loop through the tabs to find the active tab
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].active) {
          // Found the active tab, retrieve its index and resolve the Promise
          resolve(tabs[i].index);
          return;
        }
      }
    });
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message from: ", sender.tab.url);
  if ((sender.tab.url).indexOf("chrome-extension://") === -1) {
    // Message coming from content page
    if (message.url) {
      url = message.url;
      getActiveTabIndex()
      .then((index) => {
        chrome.tabs.create({url: "./popup/popup.html", index });
      }).catch((_) => {
        chrome.tabs.create({url: "./popup/popup.html", index: 0 });
      });
    } else {
      console.error("Message should contain clicked on url.");
    }
  } else {
    // Message coming from popup
    sendResponse({ url });
  }
});