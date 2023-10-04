/**
 * Set a key-value pair in Chrome sync storage.
 *
 * @param {string} key - The key under which the value will be stored.
 * @param {any} val - The value to be stored.
 * @returns {void}
 */
const setChromeAttr = (key, val) =>
  chrome.storage.sync.set({[key]: JSON.stringify(val)});

/**
 * Get the value associated with a key from Chrome sync storage.
 *
 * @param {string} key - The key to retrieve the value for.
 * @param {any} [defaultVal=null] - The default value to return if the key is not found.
 * @returns {Promise<any>} A promise that resolves with the retrieved value or the default value if the key is not found.
 */
const getChromeAttr = (key, defaultVal=null) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function(result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] !== undefined ? JSON.parse(result[key]) : defaultVal);
      }
    });
  });
};

/**
 * Remove a key and its corresponding value from Chrome sync storage.
 *
 * @param {string} key - The key to remove
 * @returns {void}
 */
const removeChromeAttr = (key) =>
  chrome.storage.sync.remove(key);

/**
 * Retrieve a set of values associated with sequential keys from Chrome sync storage.
 *
 * @param {string} keyName - The base name of the keys to retrieve values from.
 * @returns {Promise<Set>} A promise that resolves with a Set containing the retrieved values.
 */
const getSetOfValuesFromStorage = async function(keyName) {
  let setToReturn = new Set;
  let n = 0;
  while (true) {
    var nextItem = await getChromeAttr(`${keyName}${n}`);
    if (nextItem == null) break;
    setToReturn.add(nextItem);
    n++;
  }
  return setToReturn;
}

/**
 * Add a value to a set of sequential values in Chrome sync storage.
 *
 * @param {string} key - The base name of the keys representing the set of values.
 * @param {any} val - The value to be added to the set.
 * @returns {void}
 */
const addValueToSetOfValuesInStorage = async(key, val) => {
  let thisN = await getChromeAttr(`${key}-count`, -1);
  setChromeAttr(`${key}-count`, ++thisN)
  setChromeAttr(`${key}${thisN}`, val);
};

/**
 * Remove a value from a set of sequential values in Chrome sync storage and clean up the chain.
 *
 * @param {string} key - The base name of the keys representing the set of values.
 * @param {any} val - The value to be removed from the set.
 * @returns {void}
 */
const removeValueFromSetOfValuesInStorage = async (key, val) => {
  let lastIndex = await getChromeAttr(`${key}-count`, -1);
  let valuesToKeep = [];
  let removedItem = false;
  // Iterate through the existing values
  for (let n = 0; n <= lastIndex; n++) {
    const existingValue = await getChromeAttr(`${key}${n}`);
    if (existingValue === val) {
      removedItem = true;
    } else {
      valuesToKeep.push(existingValue);
    }
  }
  // If the value was found and removed, update storage
  if (removedItem) {
    if (!valuesToKeep.length) {
      removeChromeAttr(`${key}-count`);
      removeChromeAttr(`${key}0`);
      return;
    }
    // update new length
    setChromeAttr(`${key}-count`, lastIndex-1);
    // Update the remaining values with storage
    let newIndex = 0;
    valuesToKeep.forEach((newValue) => {
      setChromeAttr(`${key}${newIndex}`, newValue);
      newIndex++;
    });
    console.assert(lastIndex === newIndex);
    // remove the last index having removed an item
    removeChromeAttr(`${key}${newIndex}`);
  } else { console.log("nothing to remove?") }
};

/**
 * Retrieve the value from a response object or retrieve the last stored value from Chrome sync storage.
 * If the value exists in the response object, it will be stored as the new "latest value" in Chrome sync storage.
 *
 * @param {Object} response - The response object.
 * @param {string} key - The key to retrieve the value from the response object.
 * @param {any} [defaultVal=null] - The default value to return if the key is not found in the response object or Chrome sync storage.
 * @returns {Promise<any>} A promise that resolves with the retrieved value, or the latest value (or default value if key not found).
 */
const retrieveLastResponseOrSetNew = async(response, key, defaultVal=null) => {
  const val = response[key];
  if (val === undefined)  {
    return await getChromeAttr(`last-${key}`, defaultVal);
  } else {
    setChromeAttr(`last-${key}`, val);
    return val;
  }
}


// export default { setChromeAttr, getChromeAttr };
