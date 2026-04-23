const DEFAULT_PROMPTS = [
  {
    id: "default_polish",
    label: "Default Polish",
    template: "Please polish the following text for clarity and grammar: {{selected_text}}"
  }
];

const AI_CONFIGS = [
  { id: "gemini", title: "Send to Gemini", url: "https://gemini.google.com/app?q=", storageKey: "aiGemini" },
  { id: "chatgpt", title: "Send to ChatGPT", url: "https://chatgpt.com/?q=", storageKey: "aiChatgpt" },
  { id: "perplexity", title: "Send to Perplexity", url: "https://www.perplexity.ai/?q=", storageKey: "aiPerplexity" },
  { id: "claude", title: "Send to Claude", url: "https://claude.ai/new?q=", storageKey: "aiClaude" }
];

function rebuildContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "root-menu",
      title: "✨ Polish with AI",
      contexts: ["all"]
    });

    chrome.storage.sync.get({
      promptsBacklog: null,
      customPrompt: null,
      aiGemini: true,
      aiChatgpt: true,
      aiPerplexity: true,
      aiClaude: true
    }, (items) => {
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
        // Determine if the prompt requires selected text
        const hasSelectedTextToken = prompt.template.includes('{{selected_text}}');
        const menuContexts = hasSelectedTextToken ? ["selection", "editable"] : ["all"];

        // Create prompt folder
        const promptFolderId = `prompt_${prompt.id}`;
        chrome.contextMenus.create({
          id: promptFolderId,
          parentId: "root-menu",
          title: prompt.label || "Unnamed Prompt",
          contexts: menuContexts
        });

        // Create AI submenus inside the prompt folder
        AI_CONFIGS.forEach(ai => {
          if (items[ai.storageKey]) {
            chrome.contextMenus.create({
              id: `${prompt.id}|${ai.id}`,
              parentId: promptFolderId,
              title: ai.title,
              contexts: menuContexts
            });
          }
        });
      });
    });
  });
}

chrome.runtime.onInstalled.addListener(rebuildContextMenus);
chrome.runtime.onStartup.addListener(rebuildContextMenus);
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    rebuildContextMenus();
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "root-menu" || info.menuItemId.startsWith("prompt_")) {
    return; // Do nothing if a folder is clicked
  }

  const selectedText = info.selectionText || "";

  const [targetPromptId, targetAiId] = info.menuItemId.split('|');

  const aiConfig = AI_CONFIGS.find(ai => ai.id === targetAiId);
  if (!aiConfig) return;

  chrome.storage.sync.get({ promptsBacklog: null, customPrompt: null }, (items) => {
    let prompts = items.promptsBacklog;

    if (!prompts && items.customPrompt) {
      prompts = [{
        id: "migrated_prompt",
        label: "Default Polish",
        template: items.customPrompt.replace(/\{\{text\}\}/g, '{{selected_text}}')
      }];
    } else if (!prompts || prompts.length === 0) {
      prompts = DEFAULT_PROMPTS;
    }

    const promptObj = prompts.find(p => p.id === targetPromptId) || prompts[0];
    let fullPrompt = promptObj.template;

    const hasSelectedTextToken = fullPrompt.includes('{{selected_text}}');
    debugger;
    if (hasSelectedTextToken && (!selectedText || !selectedText.trim())) {
      console.warn("No text selected.");
      return;
    }

    const webPageContext = tab.url || "";

    fullPrompt = fullPrompt.replace(/\{\{selected_text\}\}/g, selectedText);
    fullPrompt = fullPrompt.replace(/\{\{web_page_context\}\}/g, webPageContext);

    chrome.storage.local.set({ pendingPrompt: fullPrompt }, () => {
      const targetUrl = aiConfig.url + encodeURIComponent(fullPrompt);
      chrome.tabs.create({ url: targetUrl });
    });
  });
});
