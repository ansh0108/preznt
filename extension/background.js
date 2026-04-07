// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "JOB_DATA") {
    chrome.storage.session.set({ pendingJob: msg.data }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg.type === "OPEN_PANEL") {
    chrome.sidePanel.open({ tabId: sender.tab.id });
    sendResponse({ ok: true });
    return true;
  }
});
