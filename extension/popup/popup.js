/**
 * Bootstrapp Extension - Popup
 */

// Get extension ID
const extensionId = chrome.runtime.id;
document.getElementById("extension-id").textContent = extensionId;

// Open side panel
document.getElementById("open-panel").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    await chrome.sidePanel.open({ tabId: tab.id });
    window.close();
  }
});

// Check status
async function checkStatus() {
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      statusDot.classList.remove("inactive");
      statusText.textContent = "Connected to tab";
    }
  } catch (e) {
    statusDot.classList.add("inactive");
    statusText.textContent = "No active tab";
  }
}

checkStatus();
