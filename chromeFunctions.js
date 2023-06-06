/**
 * queryTabIdAtIndx
 * @param {int | boolean} indx - the index of the tab to query, 
 *                               or true to get active tab.
 * @returns the queried tab's ID.
 */
const queryTabIdAtIndx = async(indx=true) => {
  if (indx === null) return indx;

  if (indx === true)
    return (await chrome.tabs.query({active: true, lastFocusedWindow: true})).id;
    
  // Get tab id at specific index
  return new Promise(async res => 
    await chrome.tabs.query({}, tabs => res(tabs[indx].id))
  );
};

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

/**
Sends a message to the extension's runtime or a specific tab, and optionally receives a response or processes it.
Acts like Rerun from Peanuts
@async
@function sendMsg
@param {Object} message - The message to send.
@param {boolean} [getRes=true] - Whether to await and return the response or not.
@param {number} [tab=null] - The ID of the tab to send the message to, true to send to current active tab, or null to send to the extension's runtime.
@param {Function} [processResponseFunc=null] - A function to process the response, if getRes is false.
@param {...any} [args] - Additional arguments to pass to processResponseFunc.
@returns {Promise<any>} - A Promise that resolves with the response, or rejects with an error.
*/
async function sendMsg(message, getRes=true, tab=null, processResponseFunc=null, ...args) {

  const sendAndReceiveResponse = async() => {
    return (tab)
      ? await chrome.tabs.sendMessage(tab, message)
      : await chrome.runtime.sendMessage(message);
  };

  const sendNoResponse = async() => {
    (tab)
      ? chrome.tabs.sendMessage(tab, message)
      : chrome.runtime.sendMessage(message);
  };

  return new Promise(async(resolve, reject) => {
    try {
      tab = await queryTabIdAtIndx(tab);

      if (processResponseFunc || getRes) {
        // await for response or error
        const response = await sendAndReceiveResponse();
        (getRes)
          ? resolve(response)
          : processResponseFunc(response, ...args);
      } 
      else {
        sendNoResponse();
      }  
    } catch (e) {
      reject(e);
    }
  });
}

/**
Set up a listener for a message and respond with a specified response.
Acts like Snoopy from Peanuts (Get ball, return ball with message).

@function setupResponse
@param {string} responseName - The name of the response.
@param {(string|object)} responseS - The response to send. Can be a single string or an object with messages as keys and responses as values.
@param {string} [anticipatedMsgName=null] - The name of the anticipated message when responseS is an object.
@throws {Error} Throws an error if anticipatedMsgName is not provided when responseS is an object, if no response is available for the anticipated message, or if an unexpected message is received.
@returns {Promise<void>}
*/
function setupResponse(responseName, responseS, anticipatedMsgName=null) {
  chrome.runtime.onMessage.addListener(_msgListener);
}

/**
Removes the message listener set up by setupResponse from the chrome.runtime object.
@function removeResponseSetup
@returns {void}
*/
function removeResponseSetup() {
  chrome.runtime.onMessage.removeListener(_msgListener);
}

function _msgListener(request, sender, sendResponse) {
  let response = {};
  
  // Multiple ways to respond
  if (typeof responseS === "object") {
    if (!anticipatedMsgName) {
      console.error("Must have an anticipated message name.");
      throw {Error: "NoAnticipatedMessage"};
    }
    const requestMsg = request[anticipatedMsgName];
    if (!requestMsg) {
      console.error("No response available for message of type", anticipatedMsgName);
      throw {Error: "InvalidMessageType"};
    }

    const associatedRes = responseS[requestMsg];
    if (!associatedRes) {
      console.error("Unexcpected message: ", requestMsg);
      throw {Error: "UnexcpectedMessage"};
    }

    response[responseName] = associatedRes;
    sendResponse(response);
  } else {
    // responseS in this case will be a single string
    // (No specific message to look for).
    response[responseName] = responseS;
    sendResponse(response);
  }
}

export { sendMsg, setupResponse, removeResponseSetup, getActiveTabIndex, queryTabIdAtIndx };