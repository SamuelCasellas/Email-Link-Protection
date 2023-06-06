const htmlLink = (event) => {
  const closestAnchor = event.target.closest("a");
  if (!closestAnchor) return;
  
  const url = closestAnchor.href;
  if (url.match(/tel:|mailto:/)) return;

  // Load full message link (gmail)
  if (url.includes("mail.google.com/mail/u/")) return;
  
  // Prevent the link from opening
  event.preventDefault();

  // Send a message to the extension with the link href
  console.log("About to send this link:", url);
  chrome.runtime.sendMessage({ url });
};

const blockJsLink = (event) => {
  const link = event.target.closest("a");

  // Check if the link has a JavaScript onclick attribute
  let onclick;
  try {
    onclick = link.getAttribute("onclick");
  } catch (_) {
    return false;
  }
  if (!onclick) return false;

  // Intercept click event
  event.preventDefault();
  alert("Insecure dynamic link has been blocked.\
        \nManually copy and paste the link at your own risk.");
  return true;
};

const listenerCallback = (event) => {
  try {
    if (!blockJsLink(event)) htmlLink(event);
  } catch (error) {
    console.error("My error -->", error);
  }
};

// This is for avoiding adding unnecessary duplicates of listeners.
const emailClassName = location.href.includes("mail.google")
  ? ".adn.ads"
  : ".isFirstCard";

let currentEmails = [];
const searchEmailWindows = () => {
  // Email Container class list
  const emailsShowing = document.querySelectorAll(emailClassName);
  if (emailsShowing.length === currentEmails.length) return;
  
  currentEmails = emailsShowing;
  currentEmails.forEach(w => 
    w.addEventListener("click", listenerCallback)
  );
};

// Initial load (give 5 seconds)
setTimeout(() => searchEmailWindows(), 5000);

// Added Node MO must always be kept on.
new MutationObserver(() =>
  // email window
  searchEmailWindows()
).observe(document.body, {childList: true, subtree: true});
