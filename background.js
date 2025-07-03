// background.js - Service Worker for persistence

// Keep service worker alive
let keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
chrome.runtime.onInstalled.addListener(keepAlive);

// Cache analysis results to avoid re-computation
const analysisCache = new Map();

// Listen for tab updates to maintain persistent state
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab && tab.url) {
    // Clear cache for this tab when page changes
    const cacheKey = `${tabId}-${new URL(tab.url).origin}`;
    if (analysisCache.has(cacheKey)) {
      analysisCache.delete(cacheKey);
    }
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'cacheAnalysis') {
    if (sender && sender.tab && sender.tab.id && sender.tab.url) {
      const cacheKey = `${sender.tab.id}-${new URL(sender.tab.url).origin}`;
      analysisCache.set(cacheKey, {
        data: request.data,
        timestamp: Date.now()
      });
    }
    sendResponse({ success: true });
  }
  
  if (request.action === 'getCachedAnalysis') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        const cacheKey = `${tabs[0].id}-${new URL(tabs[0].url).origin}`;
        const cached = analysisCache.get(cacheKey);
        
        // Return cached data if it's less than 5 minutes old
        if (cached && (Date.now() - cached.timestamp) < 300000) {
          sendResponse({ cached: true, data: cached.data });
        } else {
          sendResponse({ cached: false });
        }
      } else {
        sendResponse({ cached: false });
      }
    });
    return true; // Will respond asynchronously
  }
});

// Cleanup old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of analysisCache.entries()) {
    if (now - value.timestamp > 300000) { // 5 minutes
      analysisCache.delete(key);
    }
  }
}, 60000); // Check every minute