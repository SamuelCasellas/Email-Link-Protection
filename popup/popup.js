let emailsTabIndex, url, emailAddress;
sendMsg({/* No context needed for requesting link data */})
  .then(async(res) => {
    emailsTabIndex = await retrieveLastResponseOrSetNew(res, "emailsTabIndex", 0);
    url = await retrieveLastResponseOrSetNew(res, "url", "UNKNOWN ERROR. Please close this window.");
    emailAddress = await retrieveLastResponseOrSetNew(res, "emailAddress", "UNKNOWN ERROR. Please close this window.");
    
    document.getElementById("link").textContent = url;
    
    const headDomain = getHeadDomain(url);
    document.getElementById("always-allow-label").textContent = 
      `Always allow "${headDomain}" links`;

    document.getElementById("i-trust-sender-label").textContent =
      `I trust "${emailAddress}"`;
  });

// Add click listeners to the buttons
document.getElementById("continue").addEventListener("click", function() {
  // Always allow domain
  if (document.getElementsByTagName("input")[0].checked) {
    const headDomain = getHeadDomain(url);
    addValueToSetOfValuesInStorage("domain", headDomain);
    // Trigger fetchInfo
    sendMsg({ emailAddress: null }, emailsTabIndex);
  }
  
  // I trust emailer
  if (document.getElementsByTagName("input")[1].checked) {
    addValueToSetOfValuesInStorage("email", emailAddress);
    sendMsg({ emailAddress }, emailsTabIndex);
  }

  chrome.tabs.update({ url });
});

document.getElementById("back").addEventListener("click", function() {
  window.close();
});