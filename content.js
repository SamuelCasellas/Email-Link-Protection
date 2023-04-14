htmlLink = (event) => {
  console.log(event.target.tagName);
  if (event.target.tagName !== "A") return; // Non-A event falls by the wayside
    // Prevent the link from opening

  console.log(event.target.tagName);
  event.preventDefault();

  // Send a message to the extension with the link href
  chrome.runtime.sendMessage({ url: event.target.href });
};

blockJsLink = (event) => {
  const link = event.target.closest("a");
  if (!link) return false;

  // Check if the link has a JavaScript onclick attribute
  const onclick = link.getAttribute("onclick");
  if (!onclick) return false;

  // Intercept click event
  event.preventDefault();
  alert("Insecure dynamic link has been blocked.\
        \nManually copy and paste the link at your own risk.");
  return true;
};

document.addEventListener("click", function(event) {
  if (!blockJsLink(event)) htmlLink(event);
});

    