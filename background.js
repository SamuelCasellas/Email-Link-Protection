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
 * i.e. he gets the message and sends a response back.
*/

import { getActiveTabIndex } from "./chromeTabFunctions.js";

// 1. Send the link from the content to the backgound script. Store it. (No response is needed)
// 2. Request the link from the popup. Background's response will be the link

let url, emailAddress, emailsTabIndex;

chrome.runtime.onMessage.addListener(async(message, sender, sendResponse) => {
  if ((sender.tab.url).indexOf("chrome-extension://") === -1) {
    // Message coming from content page

    url = message.url;
    emailAddress = message.emailAddress;
    
    const popupIndex = await getActiveTabIndex();
    // Plus 1 because of the opened popup taking up space.
    emailsTabIndex = popupIndex + 1;

    chrome.tabs.create({ url: "./popup/popup.html", index: popupIndex });
  } else {
    // Message coming from popup asking for the following
    sendResponse({ url, emailAddress, emailsTabIndex });
  }
});