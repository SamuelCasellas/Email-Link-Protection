const gmailLoadFullMessageURL = "mail.google.com/mail/u/";
const gmailEmailWindowQS = ".adn.ads";
const gmailEmailerQS = ".gD";
const gmailClientsReplyQS = ".go";

const clientsEmail = () =>
  document.getElementsByTagName("title")[0].textContent.split("@gmail.com").length === 1 
    ? null
    : document.getElementsByTagName("title")[0].textContent.split("@gmail.com")[0].split("- ").at(-1).trim() + "@gmail.com";

let allowedDomains;
let domainsThisN = null

let allowedEmailers;
let emailersThisN = null;

const fetchInfo = () => { fetchApprovedDomains(); fetchApprovedEmailers(); };
fetchInfo();

async function fetchApprovedDomains() {
  const domainN = await getChromeAttr("domain-count", -1);
  if (domainsThisN === domainN) return;

  domainsThisN = domainN;
  allowedDomains = await getSetOfValuesFromStorage("domain");
  // console.log("allowedDomains", allowedDomains);
}

async function fetchApprovedEmailers() {
  const emailersN = await getChromeAttr("email-count", -1);
  if (emailersThisN === emailersN) return;
  
  emailersThisN = emailersN;
  allowedEmailers = await getSetOfValuesFromStorage("email");
  // console.log("allowedEmailers", allowedEmailers);
}

// Holds all conversations in one email thread that have been expanded 
let insecureEmailWindows = [];

const emailerOfEmailWindow = (em) => 
  em.querySelector(gmailEmailerQS).getAttribute("email");

const removeEmailEventListeners = (cleanup=true, allowedEmailer=null) => 
  (cleanup)
    ? insecureEmailWindows.forEach(eW => eW.removeEventListener("click", emailListener))
    : insecureEmailWindows.forEach(eW => { if (emailerOfEmailWindow(eW) === allowedEmailer) eW.removeEventListener("click", emailListener); });

let lastNEmailsSeen = 0;

const nonClientEmails = (emails) => 
  emails.filter(e => 
    // Filter out the replies from the client (don't block links they may have sent out themselves).
    (e.querySelector(gmailClientsReplyQS) === null)
      ? true // a client reply will always have their email in the header
      : emailerOfEmailWindow(e) !== clientsEmail()
  );

const nonSafeEmails = (emails) =>
  emails.filter(e =>
    !allowedEmailers.has(emailerOfEmailWindow(e))
  );

const searchInsecureEmailWindows = () => {
  // Stops for incomplete page loading
  if (!clientsEmail()) return;
  if (!document.querySelector(gmailEmailerQS)) return;

  const emailsShowing = document.querySelectorAll(gmailEmailWindowQS);
  // lastNEmailsSeen is 0 on new email (reset on switching urls)
  if (lastNEmailsSeen === emailsShowing.length) return;
  lastNEmailsSeen = emailsShowing.length;

  // Cleanup last event listeners
  removeEmailEventListeners();

  insecureEmailWindows = nonSafeEmails(nonClientEmails(Array.from(emailsShowing)));
  // console.log(insecureEmailWindows, "Bad emails AHA!");
  insecureEmailWindows.forEach(eW => eW.addEventListener("click", emailListener));
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log("ALLOWING EMAILER", request.emailAddress);
  if (request.emailAddress !== undefined)
    removeEmailEventListeners(false, request.emailAddress);

  // Approved a new domain and/or emailer
  // Fetch updated info
  fetchInfo();
});


const htmlLink = (event, anchor) => {
  if (!anchor) return;
  
  const url = anchor.href;
  if (url.match(/tel:|mailto:/) || url.includes(gmailLoadFullMessageURL)) 
    return;

  // May be costly when many domains are allowed
  // thereby not preventing the event in time
  if (allowedDomains.has(getHeadDomain(url))) return;
  
  // Prevent the link from opening
  event.preventDefault();

  const emailAddress = emailerOfEmailWindow(anchor.closest(gmailEmailWindowQS));
  // Send a message to the extension with the link href
  sendMsg({ url, emailAddress });
};

const blockJsLink = (event, anchor) => {

  // Check if the link has a JavaScript onclick attribute
  let onclick;
  try {
    onclick = anchor.getAttribute("onclick");
  } catch {
    return false;
  }
  if (!onclick) return false;

  // Intercept click event
  event.preventDefault();
  return true;
};

const emailListener = (e) => {
  const anchor = e.target.closest("a");
  if (blockJsLink(e, anchor)) {
    alert("Insecure dynamic link has been blocked.\
        \nManually copy and paste the link at your own risk.");
  } else {
    htmlLink(e, anchor);
  }
};

// Added Node MO must always be kept on.
let currentUrl = location.href;
new MutationObserver(() => {
  // email window
  if (currentUrl !== location.href) {
    currentUrl = location.href;
    // We reset just in case the number of email conversations in the new window
    // happened to be the same;
    lastNEmailsSeen = 0;
  }
  searchInsecureEmailWindows();
}).observe(document.body, {childList: true, subtree: true});
  