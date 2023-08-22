/**
Sends a message to the extension's runtime or a specific tab, and optionally receives a response or processes it.
Acts like Rerun from Peanuts
@async
@function sendMsg
@param {object} message - The message to send.
@param {number} [tab=null] - The index of the tab to send the message to, true to send to current active tab, or null (default param value) to send to the extension's runtime.
@param {boolean} [getRes=true] - Whether to (a)wait for a response or not (default param value = true).
@param {Function} [processResponseFunc=null] - A function to process the response, if getRes is false.
@param {...any} [args] - Additional arguments to pass to processResponseFunc (pass in order).
@returns {Promise<any>} - A Promise that resolves with the response, or rejects with an error.
*/
async function sendMsg(message, tab=null, getRes=true, processResponseFunc=null, ...args) {

  const sendAndReceiveResponse = async() => 
    // chrome.tabs.sendMessage asks for tabId
    await (tab !== null)
      ? chrome.tabs.sendMessage(tab, message)
      : chrome.runtime.sendMessage(message);

  const sendNoResponse = () => 
    (tab !== null)
      ? chrome.tabs.sendMessage(tab, message)
      : chrome.runtime.sendMessage(message);
  

  const queryTabIdAtIndx = async(indx=true) => {
    if (indx === null) return null;
  
    if (indx === true)
      return (await chrome.tabs.query({active: true, lastFocusedWindow: true}))[0].id;
      
    // Get tab id at specific index
    return new Promise(async (res, rej) => 
      await chrome.tabs.query({}, tabs => {
        tabs[indx] !== undefined ? res(tabs[indx].id) : rej(`IndexError: No tab #${indx}.`);
      })
    );
  };

  return new Promise(async(resolve, reject) => {
    try {
      // Provided tab index becomes an id here
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

// /**
// Set up a listener for a message and respond with a specified response.
// Acts like Snoopy from Peanuts (Get ball, return ball with message).

// @function constructResponseSetup
// @param {string} responseName - The name of the response.
// @param {(string|object)} responseS - The response to send. Can be a single string or an object with messages as keys and responses as values.
// @param {string} [anticipatedMsgName=null] - The name of the anticipated message when responseS is an object.
// @throws {Error} Throws an error if anticipatedMsgName is not provided when responseS is an object, if no response is available for the anticipated message, or if an unexpected message is received.
// @returns {Promise<void>}
// */
// const constructResponseSetup = (responseName, responseS, anticipatedMsgName=null) =>
//   chrome.runtime.onMessage.addListener(_msgListener);


// /**
// Removes the message listener set up by constructResponseSetup from the chrome.runtime object.
// @function dismantleResponseSetup
// @returns {void}
// */
// const dismantleResponseSetup = () => 
//   chrome.runtime.onMessage.removeListener(_msgListener);

// function _msgListener(request, sender, sendResponse) {
//   let response = {};
  
//   // Multiple ways to respond
//   if (typeof responseS === "object") {
//     if (!anticipatedMsgName) {
//       console.error("Must have an anticipated message name.");
//       throw {Error: "NoAnticipatedMessage"};
//     }
//     const requestMsg = request[anticipatedMsgName];
//     if (!requestMsg) {
//       console.error("No response available for message of type", anticipatedMsgName);
//       throw {Error: "InvalidMessageType"};
//     }

//     const associatedRes = responseS[requestMsg];
//     if (!associatedRes) {
//       console.error("Unexcpected message: ", requestMsg);
//       throw {Error: "UnexcpectedMessage"};
//     }

//     response[responseName] = associatedRes;
//     sendResponse(response);
//   } else {
//     // responseS in this case will be a single string
//     // (No specific message to look for).
//     response[responseName] = responseS;
//     sendResponse(response);
//   }
// }