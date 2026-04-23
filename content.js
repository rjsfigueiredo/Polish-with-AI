// content.js - Injected into various AI platforms

function getEditor() {
  const hostname = window.location.hostname;

  if (hostname.includes('gemini.google.com')) {
    return document.querySelector('.ql-editor') || 
           document.querySelector('rich-textarea div[contenteditable="true"]') || 
           document.querySelector('div[contenteditable="true"][role="textbox"]');
  } 
  if (hostname.includes('chatgpt.com')) {
    return document.querySelector('#prompt-textarea');
  }
  if (hostname.includes('claude.ai')) {
    return document.querySelector('[contenteditable="true"]');
  }
  if (hostname.includes('perplexity.ai')) {
    return document.querySelector('[contenteditable="true"]');
  }
  
  return null;
}

function injectPromptText(text) {
  const editor = getEditor();
  
  if (editor) {
    editor.focus();
    
    const hostname = window.location.hostname;
    
    if (hostname.includes('perplexity.ai')) {
      const data = new DataTransfer();
      data.setData('text/plain', text);
      editor.dispatchEvent(new ClipboardEvent('paste', {
        clipboardData: data,
        bubbles: true,
        cancelable: true
      }));
    } else if (editor.tagName.toLowerCase() === 'textarea') {
      editor.value = text;
      editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    } else {
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, text);
      editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }
    
    return true;
  }
  return false;
}

// Check storage for pending tasks
chrome.storage.local.get(['pendingPrompt'], (result) => {
  if (result.pendingPrompt) {
    const textToInject = result.pendingPrompt;
    let attempts = 0;
    
    const interval = setInterval(() => {
      attempts++;
      const success = injectPromptText(textToInject);
      
      if (success || attempts > 20) {
        clearInterval(interval);
        chrome.storage.local.remove(['pendingPrompt']);
      }
    }, 500);
  }
});
