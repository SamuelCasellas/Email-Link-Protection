function sendMsg(message, tabId=null, processResponseFunc=null, ...args) {
  /**
   * sendMessage
   * Inputs: message - the object to hold the message
   * 
   * 
   * 
   * returns: None
   */

  // response
  const sendAndProcessResponse = async() => {
    return (tabId)
    ? await chrome.runtime.sendMessage(tabId, message)
    : await chrome.runtime.sendMessage(message);
  };

  const sendNoResponse = () => {
    (tabId)
    ? chrome.runtime.sendMessage(tabId, message)
    : chrome.runtime.sendMessage(message);
  };

  (processResponseFunc)
  ? sendAndProcessResponse()
      .then(res => processResponseFunc(res, ...args))
      .catch(err => console.error(err))
  : sendNoResponse();
}

// function receiveMsg() {
//   chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//       console.log(sender.tab ?
//                   "from a content script:" + sender.tab.url :
//                   "from the extension");
//       if (request.greeting === "hello")
//         sendResponse({farewell: "goodbye"});
//     }
//   );
// }

async function getActiveTab() {
  const qry = {active: true, lastFocusedWindow: true};
  return await chrome.tabs.query(qry);
}

export {sendMsg, receiveMsg, getActiveTab};