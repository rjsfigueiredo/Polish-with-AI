const DEFAULT_PROMPT = "Please polish the following text for clarity and grammar: {{text}}";

// Saves options to chrome.storage.sync
function saveOptions() {
  const promptValue = document.getElementById('prompt').value;
  const aiGemini = document.getElementById('ai-gemini').checked;
  const aiChatgpt = document.getElementById('ai-chatgpt').checked;
  const aiPerplexity = document.getElementById('ai-perplexity').checked;
  const aiClaude = document.getElementById('ai-claude').checked;
  
  chrome.storage.sync.set(
    { 
      customPrompt: promptValue,
      aiGemini: aiGemini,
      aiChatgpt: aiChatgpt,
      aiPerplexity: aiPerplexity,
      aiClaude: aiClaude
    },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.style.opacity = '1';
      setTimeout(() => {
        status.style.opacity = '0';
      }, 2000);
    }
  );
}

// Restores textarea value using the preferences stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get(
    { 
      customPrompt: DEFAULT_PROMPT,
      aiGemini: true,
      aiChatgpt: true,
      aiPerplexity: true,
      aiClaude: true
    },
    (items) => {
      document.getElementById('prompt').value = items.customPrompt;
      document.getElementById('ai-gemini').checked = items.aiGemini;
      document.getElementById('ai-chatgpt').checked = items.aiChatgpt;
      document.getElementById('ai-perplexity').checked = items.aiPerplexity;
      document.getElementById('ai-claude').checked = items.aiClaude;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
