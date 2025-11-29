// Create context menus when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Context menu for links
  chrome.contextMenus.create({
    id: "saveLink",
    title: "Save to Brainstem",
    contexts: ["link"],
  });

  // Context menu for selected text
  chrome.contextMenus.create({
    id: "saveText",
    title: "Save to Brainstem",
    contexts: ["selection"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const rawDetails = {
    id: Date.now().toString(),
    frameUrl: info.frameUrl,
    pageUrl: info.pageUrl,
    favIconUrl: tab.favIconUrl,
    title: tab.title,
    timestamp: Date.now(),
  };
  let details = rawDetails;
  if (info.menuItemId === "saveLink") {
    details = {
      ...rawDetails,
      content: info.linkUrl,
      type: "link",
    };
  } else if (info.menuItemId === "saveText") {
    details = {
      ...rawDetails,
      content: info.selectionText,
      type: "text",
    };
  }
  saveToStorage(details);
});

// Save link to storage
function saveToStorage(details) {
  chrome.storage.local.get(["savedBrainstem"], (result) => {
    const brainstems = result.savedBrainstem || [];
    brainstems.unshift(details);
    chrome.storage.local.set({ savedBrainstem: brainstems }, () => {
      console.log("Link saved:", url);
    });
  });
}
