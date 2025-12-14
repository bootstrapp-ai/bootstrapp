/**
 * Bootstrapp Extension - Side Panel
 */

// Message types (inline since content scripts can't import modules)
const MSG = {
  PING: "ext:ping",
  GET_TABS: "ext:getTabs",
  SCRAPE: "ext:scrape",
  INJECT: "ext:inject",
  DATA: "ext:data",
  ERROR: "ext:error",
};

// State
let tabs = [];
let activeTabId = null;

// DOM Elements
const tabsList = document.getElementById("tabs-list");
const scrapeSelector = document.getElementById("scrape-selector");
const scrapeMultiple = document.getElementById("scrape-multiple");
const scrapeHtml = document.getElementById("scrape-html");
const scrapeBtn = document.getElementById("scrape-btn");
const scrapeResult = document.getElementById("scrape-result");
const injectTarget = document.getElementById("inject-target");
const injectHtml = document.getElementById("inject-html");
const injectBtn = document.getElementById("inject-btn");
const injectResult = document.getElementById("inject-result");
const refreshBtn = document.getElementById("refresh-btn");
const statusEl = document.getElementById("status");

// Tab navigation
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`${btn.dataset.tab}-section`).classList.add("active");
  });
});

// Send message to background
async function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response?.type === MSG.ERROR) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    });
  });
}

// Update status
function setStatus(text, type = "info") {
  statusEl.textContent = text;
  statusEl.className = `status ${type}`;
}

// Load and display tabs
async function loadTabs() {
  try {
    setStatus("Loading tabs...");
    tabsList.innerHTML = '<div class="loading">Loading...</div>';

    const response = await sendMessage({ type: MSG.GET_TABS });
    tabs = response.data || [];

    // Get current active tab
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTabId = currentTab?.id;

    renderTabs();
    setStatus(`${tabs.length} tabs loaded`, "success");
  } catch (error) {
    console.error("Error loading tabs:", error);
    tabsList.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    setStatus("Error loading tabs", "error");
  }
}

// Render tabs list
function renderTabs() {
  if (tabs.length === 0) {
    tabsList.innerHTML = '<div class="empty">No tabs found</div>';
    return;
  }

  tabsList.innerHTML = tabs
    .map(
      (tab) => `
      <div class="tab-item ${tab.id === activeTabId ? "active" : ""}" data-tab-id="${tab.id}">
        <img class="tab-favicon" src="${tab.favIconUrl || "icons/icon16.png"}" alt="" onerror="this.src='icons/icon16.png'">
        <div class="tab-info">
          <div class="tab-title">${escapeHtml(tab.title || "Untitled")}</div>
          <div class="tab-url">${escapeHtml(truncateUrl(tab.url))}</div>
        </div>
        <button class="select-btn" title="Select this tab">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    `
    )
    .join("");

  // Add click handlers
  tabsList.querySelectorAll(".tab-item").forEach((item) => {
    item.addEventListener("click", () => {
      const tabId = parseInt(item.dataset.tabId, 10);
      selectTab(tabId);
    });
  });
}

// Select a tab
function selectTab(tabId) {
  activeTabId = tabId;
  tabsList.querySelectorAll(".tab-item").forEach((item) => {
    item.classList.toggle("active", parseInt(item.dataset.tabId, 10) === tabId);
  });
  setStatus(`Selected tab ${tabId}`, "success");
}

// Scrape from active tab
async function scrape() {
  if (!activeTabId) {
    setStatus("No tab selected", "error");
    return;
  }

  const selector = scrapeSelector.value.trim();
  if (!selector) {
    setStatus("Enter a selector", "error");
    return;
  }

  try {
    setStatus("Scraping...");
    scrapeResult.innerHTML = '<div class="loading">Scraping...</div>';

    const response = await sendMessage({
      type: MSG.SCRAPE,
      tabId: activeTabId,
      selector,
      options: {
        multiple: scrapeMultiple.checked,
        html: scrapeHtml.checked,
      },
    });

    scrapeResult.innerHTML = `<pre>${JSON.stringify(response.data, null, 2)}</pre>`;
    setStatus("Scrape complete", "success");
  } catch (error) {
    console.error("Scrape error:", error);
    scrapeResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    setStatus("Scrape failed", "error");
  }
}

// Inject HTML into active tab
async function inject() {
  if (!activeTabId) {
    setStatus("No tab selected", "error");
    return;
  }

  const target = injectTarget.value.trim() || "body";
  const html = injectHtml.value.trim();

  if (!html) {
    setStatus("Enter HTML to inject", "error");
    return;
  }

  try {
    setStatus("Injecting...");
    injectResult.innerHTML = '<div class="loading">Injecting...</div>';

    const response = await sendMessage({
      type: MSG.INJECT,
      tabId: activeTabId,
      target,
      html,
    });

    injectResult.innerHTML = `<pre>${JSON.stringify(response.data, null, 2)}</pre>`;
    setStatus("Injection complete", "success");
  } catch (error) {
    console.error("Inject error:", error);
    injectResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    setStatus("Injection failed", "error");
  }
}

// Utility functions
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function truncateUrl(url, maxLength = 40) {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    const display = urlObj.hostname + urlObj.pathname;
    return display.length > maxLength ? display.slice(0, maxLength) + "..." : display;
  } catch {
    return url.slice(0, maxLength);
  }
}

// Event listeners
refreshBtn.addEventListener("click", loadTabs);
scrapeBtn.addEventListener("click", scrape);
injectBtn.addEventListener("click", inject);

// Initialize
loadTabs();
