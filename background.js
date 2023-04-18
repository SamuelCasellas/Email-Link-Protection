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

import { getActiveTabIndex } from "./chromeMessagingFunctions.js";

// 1. Send the link from the content to the backgound script. Store it. (No response is needed)
// 2. Request the link from the popup. The response will be the link

let url;

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name === "knockknock");
  port.onMessage.addListener(function(msg) {
    if (msg.joke === "Knock knock")
      port.postMessage({question: "Who's there?"});
    else if (msg.answer === "Madame")
      port.postMessage({question: "Madame who?"});
    else if (msg.answer === "Madame... Bovary")
      port.postMessage({question: "I don't get it."});
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message from: ", sender.tab.url);
  if ((sender.tab.url).indexOf("chrome-extension://") === -1) {
    // Message coming from content page
    if (message.url) {
      url = message.url
      getActiveTabIndex()
      .then((index) => {
        console.log(index);
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