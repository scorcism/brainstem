// Create context menus when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Remove existing menu items to avoid duplicates
  chrome.contextMenus.removeAll(() => {
    // Context menu for links
    chrome.contextMenus.create({
      id: "saveLink",
      title: "Save Link to Brainstem",
      contexts: ["link"],
    });

    // Context menu for selected text
    chrome.contextMenus.create({
      id: "saveText",
      title: "Save Text to Brainstem",
      contexts: ["selection"],
    });

    // Context menu for images
    chrome.contextMenus.create({
      id: "saveImage",
      title: "Save Image to Brainstem",
      contexts: ["image"],
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const rawDetails = {
    id: Date.now().toString(),
    frameUrl: info.frameUrl,
    pageUrl: info.pageUrl,
    favIconUrl: tab ? tab.favIconUrl : '',
    title: tab ? tab.title : '',
    timestamp: Date.now(),
    note: '',
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
  } else if (info.menuItemId === "saveImage") {
    details = {
      ...rawDetails,
      content: info.srcUrl,
      type: "image",
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
      console.log("Item saved:", details);
    });
  });
}
