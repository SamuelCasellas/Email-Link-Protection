const gmailLoadFullMessageURL = "mail.google.com/mail/u/";
const gmailContainerQS = ".adn.ads";

const getSetOfAllowedDomains = async function() {
  let allowedDomains = new Set;
  let n = 0
  while (true) {
    var nextDomain = await getChromeAttr(`domain${n}`);
    if (!nextDomain) break;
    allowedDomains.add(nextDomain);
    n++;
  }
  return allowedDomains;
}

const getNumApprovedDomains = async() => await getChromeAttr("domain-count", 0);

function getHeadDomain(url) {
  const startIndex = url.indexOf('//');
  if (startIndex === -1) return url;

  const endIndex = url.indexOf('/', startIndex + 2);
  if (endIndex === -1) return url.substring(startIndex + 2);

  return url.substring(startIndex + 2, endIndex);
}

let allowedDomains;
let thisN = null;

async function fetchLinkInfo() {
  const listedN = await getNumApprovedDomains();
  if (thisN === listedN) return;

  thisN = listedN;
  allowedDomains = await getSetOfAllowedDomains();
}
fetchLinkInfo();
// Trying to do this as the user clicks on the link is too late.
setInterval(() => fetchLinkInfo(), 2000);

const htmlLink = async(event) => {
  const closestAnchor = event.target.closest("a");
  if (!closestAnchor) return;
  
  const url = closestAnchor.href;
  if (url.match(/tel:|mailto:/) || url.includes(gmailLoadFullMessageURL)) 
    return;

  const headDomain = getHeadDomain(url);

  if (allowedDomains.has(headDomain)) return;
  
  // Prevent the link from opening
  event.preventDefault();

  // Send a message to the extension with the link href
  chrome.runtime.sendMessage({ url });
};

const blockJsLink = (event) => {
  const link = event.target.closest("a");

  // Check if the link has a JavaScript onclick attribute
  let onclick;
  try {
    onclick = link.getAttribute("onclick");
  } catch {
    return false;
  }
  if (!onclick) return false;

  // Intercept click event
  event.preventDefault();
  alert("Insecure dynamic link has been blocked.\
        \nManually copy and paste the link at your own risk.");
  return true;
};

const listenerCallback = (e) => {
  if (!blockJsLink(e)) htmlLink(e);
};

let currentEmails = [];
const searchEmailWindows = () => {
  // Email Container class list
  const emailsShowing = document.querySelectorAll(gmailContainerQS);
  if (emailsShowing.length === currentEmails.length) return;
  
  currentEmails = emailsShowing;
  currentEmails.forEach(w => w.addEventListener("click", listenerCallback));
};

// Initial load (give 5 seconds)
setTimeout(() => searchEmailWindows(), 5000);

// Added Node MO must always be kept on.
new MutationObserver(() =>
  // email window
  searchEmailWindows()
).observe(document.body, {childList: true, subtree: true});
  