htmlLink = (event) => {
  if (event.target.tagName !== "A") return; // The event falls by the wayside
    // Prevent the link from opening
  event.preventDefault();

  // Send a message to the extension with the link href
  chrome.runtime.sendMessage({ link: event.target.href }, function(_) /* No action on res */ {
    // Open the popup window  
    window.open(chrome.extension.getURL("./popup/popup.html"), "Link Buffer", "width=320,height=240");
  });
};

document.addEventListener("click", function(event) {
  htmlLink(event);
});

    