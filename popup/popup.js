let url;

const setChromeAttr = (key, val) => {
  chrome.storage.sync.set({[key]: JSON.stringify(val)});
};

const getChromeAttr = (key, defaultVal=null) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function(result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] != null ? JSON.parse(result[key]) : defaultVal);
      }
    });
  });
};

function getHeadDomain(url) {
  const startIndex = url.indexOf('//');
  if (startIndex === -1) return url;

  const endIndex = url.indexOf('/', startIndex + 2);
  if (endIndex === -1) return url.substring(startIndex + 2);

  return url.substring(startIndex + 2, endIndex);
}

chrome.runtime.sendMessage({/* No context needed */}, async function(response) {
  url = response.url
  if (!url)  {
    url = await getChromeAttr("last-url-selected", "UNKOWN ERROR. Please close this window.");
  } else {
    setChromeAttr("last-url-selected", url);
  }
  document.getElementById("link").textContent = url;
  
  const headDomain = getHeadDomain(url);
  document.getElementById("always-allow-label").textContent = 
  `Always allow "${headDomain}"`;
});

const addAllowedDomainToStorage = async(domain) => {
  let thisN = await getChromeAttr("domain-count", -1);

  setChromeAttr("domain-count", ++thisN)
  setChromeAttr(`domain${thisN}`, domain);
};

// Add click listeners to the buttons
document.getElementById("continue").addEventListener("click", function() {
  if (document.getElementsByTagName("input")[0].checked) {
    const headDomain = getHeadDomain(url);
    addAllowedDomainToStorage(headDomain);
  }
  chrome.tabs.update({ url });
});

document.getElementById("back").addEventListener("click", function() {
  window.close();
});