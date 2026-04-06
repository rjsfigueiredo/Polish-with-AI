const DEFAULT_PROMPT = "Please polish the following text for clarity and grammar: {{text}}";

// Saves options to chrome.storage.sync
function saveOptions() {
  const promptValue = document.getElementById('prompt').value;
  
  chrome.storage.sync.set(
    { customPrompt: promptValue },
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
    { customPrompt: DEFAULT_PROMPT },
    (items) => {
      document.getElementById('prompt').value = items.customPrompt;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
