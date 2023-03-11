
const appendStyle = (el, newStyles) => {
  const existingStyles = el.getAttribute("style");
  // add the new styles to the existing ones
  el.setAttribute("style", existingStyles + ";" + newStyles);
};

const modifyUrlCallback = (firstLoad=false) => {
  const action = () => {
    // get the element with the particular class
    const emailWindow = document.querySelector(".adn.ads");

    if (!emailWindow) return;

    // query all a tags inside the element
    const links = emailWindow.querySelectorAll("a");
  
    // loop through the links and modify their embedded element text
    links.forEach(link => {
      let embeddedElement;
      // debugger;
      (link.childElementCount)
      ? embeddedElement = link.children.item(0)
      : embeddedElement = link.parentElement;
      
      const href = link.getAttribute("href");
      // console.log(href);
      // Remove link redirect on anchor
      link.removeAttribute("href");
      link.removeAttribute("data-saferedirecturl");

      if (!embeddedElement) return;
      if (embeddedElement.tagName === "IMG") {
        const newStyles = "max-width: 500px; height: auto;";
        appendStyle(embeddedElement, newStyles);
        return;
      }

      embeddedElement.textContent += ` (${href})`;
      
      const newStyles = "white-space:nowrap;overflow-wrap:break-word;font-size:70%;";
      appendStyle(embeddedElement, newStyles);
    });
  };

  (firstLoad)
  // Gmail loading screen
  ? setTimeout(() => { action(); }, 5000)
  // Loading an email for the first time can take some time...
  : setTimeout(() => { action(); }, 200);
};

// First load
modifyUrlCallback(firstLoad=true);

// Dynamic changes with new url:
let currentURL = location.href;
// URL MO must always be kept on.
new MutationObserver(() => {
  if (currentURL === location.href) return;
  currentURL = location.href;
  modifyUrlCallback();
}).observe(document, {childList: true, subtree: true});