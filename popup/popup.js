let url;

chrome.runtime.sendMessage({/* No context needed */}, function(response) {
  url = response.url
  if (!url) url = "(Link already clicked. Use the forward arrow to navigate to it.)"
  document.getElementById("link").textContent = url;
});

// Add click listeners to the buttons
document.getElementById("proceed").addEventListener("click", function() {
  chrome.tabs.update({ url });
});

document.getElementById("back").addEventListener("click", function() {
  window.close();
});