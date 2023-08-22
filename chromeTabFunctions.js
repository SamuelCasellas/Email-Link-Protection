/**
 * ONLY MEANT TO BE USED IN A BACKGROUND SCRIPT OR EXTESION PAGE WHERE
 * THE TABS API IS AVAILABLE IN THE CHROME OBJECT
 */

const getActiveTabIndex = async() => {
  let tabArrayInfo;
  try {
    tabArrayInfo = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  } catch {
    return 0;
  }
  console.assert(tabArrayInfo.length === 1);
  // Returns a [{}], hence the [0]
  return tabArrayInfo[0].index;
};

/**
 * queryTabIdAtIndx
 * @param {int | boolean} indx - the index of the tab to query, 
 *                               or true to get active tab.
 * @returns the queried tab's ID.
 */
const queryTabIdAtIndx = async(indx=true) => {
  if (indx === null) return null;

  if (indx === true)
    indx = await getActiveTabIndex();
    
  // Get tab id at specific index
  return new Promise(async (res, rej) => 
    await chrome.tabs.query({}, tabs => {
      tabs[indx] !== undefined ? res(tabs[indx].id) : rej(`IndexError: No tab #${indx}.`);
    })
  );
};

export { getActiveTabIndex, queryTabIdAtIndx };