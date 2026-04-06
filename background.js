// Create the context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "polish-with-gemini",
    title: "✨ Polish with Gemini",
    contexts: ["selection", "editable"]
  });
});

// Default prompt fallback
const DEFAULT_PROMPT = "Please polish the following text for clarity and grammar: {{text}}";

// Listen for clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "polish-with-gemini") {
    // Capture the selected text
    const selectedText = info.selectionText;

    // Ensure we have some text to work with
    if (!selectedText || !selectedText.trim()) {
      console.warn("No text selected.");
      return;
    }

    // Fetch the custom template from storage
    chrome.storage.sync.get({ customPrompt: DEFAULT_PROMPT }, (items) => {
      const template = items.customPrompt;
      let fullPrompt = "";

      // Replace placeholder or append
      if (template.includes("{{text}}")) {
        fullPrompt = template.replace("{{text}}", selectedText);
      } else {
        // If no placeholder is found, append to the end
        fullPrompt = template + "\n\n" + selectedText;
      }

      // Store the prompt in chrome.storage.local
      chrome.storage.local.set({ pendingPrompt: fullPrompt }, () => {
        // Open a new tab with Gemini
        chrome.tabs.create({ url: "https://gemini.google.com/app" });
      });
    });
  }
});
