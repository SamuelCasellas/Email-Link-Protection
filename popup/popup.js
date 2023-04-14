let url;

chrome.runtime.sendMessage({/* No context needed */}, function(response) {
  url = response.url
  document.getElementById("link").textContent = url;
});

// Add click listeners to the buttons
document.getElementById("proceed").addEventListener("click", function() {
  chrome.tabs.update({ url });
});

document.getElementById("back").addEventListener("click", function() {
  window.close();
});