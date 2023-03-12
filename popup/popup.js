let url;

chrome.runtime.sendMessage({}, function(response) {
  url = response.href
  document.getElementById("id").textContent = url;
});

// Add click listeners to the buttons
document.getElementById("proceed").addEventListener("click", function() {
  chrome.tabs.update({ url });
});

document.getElementById("back").addEventListener("click", function() {
  window.close();
});