const DEFAULT_PROMPTS = [
  {
    id: "default_polish",
    label: "Polish with Gemini",
    template: "Please polish the following text for clarity and grammar: {{selected_text}}"
  }
];

function rebuildContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "root-menu",
      title: "✨ Polish with Gemini",
      contexts: ["all"]
    });

    chrome.storage.sync.get({ promptsBacklog: null, customPrompt: null }, (items) => {
      let prompts = items.promptsBacklog;

      // Handle legacy migration
      if (!prompts && items.customPrompt) {
        prompts = [{
          id: "migrated_prompt",
          label: "Default Polish",
          template: items.customPrompt.replace(/\{\{text\}\}/g, '{{selected_text}}')
        }];
      } else if (!prompts || prompts.length === 0) {
        prompts = DEFAULT_PROMPTS;
      }

      prompts.forEach(prompt => {
        chrome.contextMenus.create({
          id: prompt.id,
          parentId: "root-menu",
          title: prompt.label || "Unnamed Prompt",
          contexts: ["selection", "editable"]
        });
      });
    });
  });
}

chrome.runtime.onInstalled.addListener(rebuildContextMenus);
chrome.runtime.onStartup.addListener(rebuildContextMenus);
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.promptsBacklog || changes.customPrompt)) {
    rebuildContextMenus();
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.parentMenuItemId === "root-menu" || info.menuItemId === "root-menu") {
    const selectedText = info.selectionText;

    if (!selectedText || !selectedText.trim()) {
      console.warn("No text selected.");
      return;
    }

    // Determine target ID.
    const targetId = info.menuItemId === "root-menu" ? null : info.menuItemId;

    chrome.storage.sync.get({ promptsBacklog: null, customPrompt: null }, (items) => {
      let prompts = items.promptsBacklog;

      // Fallback Migration
      if (!prompts && items.customPrompt) {
        prompts = [{
          id: "migrated_prompt",
          label: "Default Polish",
          template: items.customPrompt.replace(/\{\{text\}\}/g, '{{selected_text}}')
        }];
      } else if (!prompts || prompts.length === 0) {
        prompts = DEFAULT_PROMPTS;
      }

      // Find prompt
      const promptObj = prompts.find(p => p.id === targetId) || prompts[0];
      let fullPrompt = promptObj.template;

      const webPageContext = tab.url || "";

      // Replacements
      fullPrompt = fullPrompt.replace(/\{\{selected_text\}\}/g, selectedText);
     

      fullPrompt = fullPrompt.replace(/\{\{web_page_context\}\}/g, webPageContext);

      chrome.storage.local.set({ pendingPrompt: fullPrompt }, () => {
        chrome.tabs.create({ url: "https://gemini.google.com/app" });
      });
    });
  }
});
