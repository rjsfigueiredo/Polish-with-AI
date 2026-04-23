const DEFAULT_PROMPTS = [
  {
    id: "default_polish",
    label: "Polish Text",
    template: "Polish the following text for clarity and grammar: {{selected_text}}\n\nContext page url: {{web_page_context}}"
  }
];

function generateId() {
  return 'prompttemplate_' + Math.random().toString(36).substr(2, 9);
}

function renderPromptCard(prompt) {
  const container = document.createElement('div');
  container.className = 'prompt-card';
  container.dataset.id = prompt.id || generateId();

  const header = document.createElement('div');
  header.className = 'prompt-header';

  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'prompt-label-input';
  labelInput.value = prompt.label || '';
  labelInput.placeholder = 'Menu Label (e.g., Translate to English)';

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = 'Remove';
  removeBtn.onclick = () => container.remove();

  header.appendChild(labelInput);
  header.appendChild(removeBtn);

  const toolbar = document.createElement('div');
  toolbar.className = 'token-toolbar';

  const textTokenBtn = document.createElement('button');
  textTokenBtn.type = 'button';
  textTokenBtn.className = 'token-btn';
  textTokenBtn.title = 'Replaced by the text you highlighted.';
  textTokenBtn.textContent = '{{selected_text}}';
  
  const urlTokenBtn = document.createElement('button');
  urlTokenBtn.type = 'button';
  urlTokenBtn.className = 'token-btn';
  urlTokenBtn.title = 'Replaced by the URL of the active tab.';
  urlTokenBtn.textContent = '{{web_page_context}}';

  const textarea = document.createElement('textarea');
  textarea.className = 'prompt-template';
  textarea.value = prompt.template || '';
  textarea.placeholder = 'Enter your prompt...';

  // Helper to insert tokens at cursor
  const insertToken = (token) => {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    textarea.value = textarea.value.substring(0, startPos) + token + textarea.value.substring(endPos, textarea.value.length);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = startPos + token.length;
  };

  textTokenBtn.onclick = () => insertToken('{{selected_text}}');
  urlTokenBtn.onclick = () => insertToken('{{web_page_context}}');

  toolbar.appendChild(textTokenBtn);
  toolbar.appendChild(urlTokenBtn);

  container.appendChild(header);
  container.appendChild(toolbar);
  container.appendChild(textarea);

  return container;
}

function restoreOptions() {
  chrome.storage.sync.get({ 
    promptsBacklog: null, 
    customPrompt: null,
    aiGemini: true,
    aiChatgpt: true,
    aiPerplexity: true,
    aiClaude: true
  }, (items) => {
    let prompts = items.promptsBacklog;
    
    // Migration: If user had the old customPrompt but no backlog
    if (!prompts && items.customPrompt) {
      prompts = [{
        id: "migrated_prompt",
        label: "Default Polish",
        template: items.customPrompt.replace(/\{\{text\}\}/g, '{{selected_text}}')
      }];
    } else if (!prompts || prompts.length === 0) {
      prompts = DEFAULT_PROMPTS;
    }

    const listContainer = document.getElementById('prompts-list');
    listContainer.innerHTML = '';
    
    prompts.forEach(prompt => {
      listContainer.appendChild(renderPromptCard(prompt));
    });

    document.getElementById('ai-gemini').checked = items.aiGemini;
    document.getElementById('ai-chatgpt').checked = items.aiChatgpt;
    document.getElementById('ai-perplexity').checked = items.aiPerplexity;
    document.getElementById('ai-claude').checked = items.aiClaude;
  });
}

function saveOptions() {
  const cards = document.querySelectorAll('.prompt-card');
  const promptsBacklog = [];

  cards.forEach(card => {
    const label = card.querySelector('.prompt-label-input').value.trim();
    const template = card.querySelector('.prompt-template').value.trim();
    if (label || template) {
      promptsBacklog.push({
        id: card.dataset.id,
        label: label || 'Unnamed Prompt',
        template: template
      });
    }
  });

  const aiGemini = document.getElementById('ai-gemini').checked;
  const aiChatgpt = document.getElementById('ai-chatgpt').checked;
  const aiPerplexity = document.getElementById('ai-perplexity').checked;
  const aiClaude = document.getElementById('ai-claude').checked;

  chrome.storage.sync.set({ 
    promptsBacklog,
    aiGemini,
    aiChatgpt,
    aiPerplexity,
    aiClaude
  }, () => {
    const status = document.getElementById('status');
    status.style.opacity = '1';
    setTimeout(() => {
      status.style.opacity = '0';
    }, 2000);
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('add-prompt-btn').addEventListener('click', () => {
  document.getElementById('prompts-list').appendChild(renderPromptCard({}));
});
