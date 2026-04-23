const DEFAULT_PROMPT = "Please polish the following text for clarity and grammar: {{text}}";

const AI_CONFIGS = {
  gemini: {
    id: "send-to-gemini",
    title: "Send to Gemini",
    url: "https://gemini.google.com/app?q=",
    storageKey: "aiGemini"
  },
  chatgpt: {
    id: "send-to-chatgpt",
    title: "Send to ChatGPT",
    url: "https://chatgpt.com/?q=",
    storageKey: "aiChatgpt"
  },
  perplexity: {
    id: "send-to-perplexity",
    title: "Send to Perplexity",
    url: "https://www.perplexity.ai/?q=",
    storageKey: "aiPerplexity"
  },
  claude: {
    id: "send-to-claude",
    title: "Send to Claude",
    url: "https://claude.ai/new?q=",
    storageKey: "aiClaude"
  }
};

function setupContextMenus() {
  chrome.storage.sync.get({
    aiGemini: true,
    aiChatgpt: true,
    aiPerplexity: true,
    aiClaude: true
  }, (items) => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "polish-with-ai-parent",
        title: "✨ Polish with AI",
        contexts: ["selection", "editable"]
      });

      Object.values(AI_CONFIGS).forEach(config => {
        if (items[config.storageKey]) {
          chrome.contextMenus.create({
            id: config.id,
            parentId: "polish-with-ai-parent",
            title: config.title,
            contexts: ["selection", "editable"]
          });
        }
      });
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    setupContextMenus();
  }
});

// Listen for clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const aiConfig = Object.values(AI_CONFIGS).find(c => c.id === info.menuItemId);
  if (!aiConfig) return;

  const selectedText = info.selectionText;

  if (!selectedText || !selectedText.trim()) {
    console.warn("No text selected.");
    return;
  }

  chrome.storage.sync.get({ customPrompt: DEFAULT_PROMPT }, (items) => {
    const template = items.customPrompt;
    let fullPrompt = "";

    if (template.includes("{{text}}")) {
      fullPrompt = template.replace("{{text}}", selectedText);
    } else {
      fullPrompt = template + "\n\n" + selectedText;
    }

    chrome.storage.local.set({ pendingPrompt: fullPrompt }, () => {
      const targetUrl = aiConfig.url + encodeURIComponent(fullPrompt);
      chrome.tabs.create({ url: targetUrl });
    });
  });
});
