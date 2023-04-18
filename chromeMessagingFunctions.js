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
 * sendMsg
 * Inputs: 
 * message - the object to hold the message
 * tabId? - the index of the tab to send it to (if true, the active tab is retrieved): int | boolean
 * processResponseFunc? - the passed in callback to process the response. The first argument is always the response.
 * getResp? - another option for the client if they want the response without passing in a pRF: boolean
 * ...args - the arguments passed in along with the response to the process it: any[]
 * 
 * Usage:
 * 1. Send a message to the background.
 * sendMsg({greeting: "Hello"})
 * .then((message) => *\/ Handle the message *\/)
 * .catch((error) => *\/ Handle the message *\/)
 * 
 * returns: None
 * 
 * Acts like Rerun from Peanuts
 */
async function sendMsg(message, getRes=false, tab=null, processResponseFunc=null, ...args) {

  const sendAndReceiveResponse = async() => {
    return (tab)
    ? await chrome.tabs.sendMessage(tab, message)
    : await chrome.runtime.sendMessage(message);
  };

  const sendNoResponse = async() => {
    (tab)
    ? await chrome.tabs.sendMessage(tab, message)
    : await chrome.runtime.sendMessage(message);
  };

  return new Promise(async(resolve, reject) => {
    try {
      tab = await queryTabIdAtIndx(tab);

      if (processResponseFunc || getRes) {
        // await for response or error
        const response = await sendAndReceiveResponse();
        (getRes)
          ? resolve(response)
          // await for any error...
          : await processResponseFunc(response, ...args);
      } 
      else {
        // await for any error...
        await sendNoResponse();
      }  
    } catch (e) {
      reject(e);
    }
  });
}

// Anticipate property name (pass in the key)
// Match response to the expected value of the message's property

/**
 * respondToMsg
 * Inputs: 
 * responseName - the name of the response: string
 * responses - The response you want to say, either based on a string
 *             string or a messageToResponse map depending on what is being asked.
 * anticipatedMsgName - the name of the message to look for (one response per call).
 * 
 * Usage:
 * 
 * returns: None
 * 
 * Acts like Snoopy from Peanuts (Get ball, return ball with message).
 */
async function respondToMsg(responseName, responses, anticipatedMsgName=null) {
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // console.log(sender.tab ?
      //             "from a content script:" + sender.tab.url :
      //             "from the extension");
      let response = {};
      
      // Multiple ways to respond
      if (typeof responses === "object") {
        const requestMsg = request[anticipatedMsgName];
        if (!requestMsg) {
          console.error("No response available for message of type", anticipatedMsgName);
          throw {Error: "InvalidMessageType"};
        }

        const associatedRes = responses[requestMsg];
        if (!associatedRes) {
          console.error("Unexcpected message: ", requestMsg);
          throw {Error: "UnexcpectedMessage"};
        }

        response[responseName] = associatedRes;
        sendResponse(response);
      } else {
        // responses in this case will be a single string.
        response[responseName] = responses;
        sendResponse(response);
      }
    }
  );
}

export { sendMsg, respondToMsg, getActiveTabIndex, queryTabIdAtIndx };