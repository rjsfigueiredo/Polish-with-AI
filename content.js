// content.js - Injected into https://gemini.google.com/*

function injectPromptText(text) {
  // Locate the input box (Gemini primarily uses <rich-textarea> with a nested [contenteditable])
  const editor = document.querySelector('rich-textarea div[contenteditable="true"]') || 
                 document.querySelector('div[contenteditable="true"][role="textbox"]');
  
  if (editor) {
    // Focus the editor so execCommand works inside it
    editor.focus();
    
    // Select all existing text/placeholders to overwrite them
    document.execCommand('selectAll', false, null);
    
    // Insert the text block to simulate real typing
    document.execCommand('insertText', false, text);
    
    // Trigger input events so the framework detects the changes and lights up the "Send" button
    editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    editor.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    
    return true;
  }
  return false;
}

// Check storage for pending tasks
chrome.storage.local.get(['pendingPrompt'], (result) => {
  if (result.pendingPrompt) {
    const textToInject = result.pendingPrompt;
    let attempts = 0;
    
    // The Gemini UI is dynamic (rendering reactively), so it takes a moment to load the text editor.
    // We use setInterval to poll for the editor instead of just checking once.
    const interval = setInterval(() => {
      attempts++;
      const success = injectPromptText(textToInject);
      
      // Stop looping if we injected successfully or after ~10 seconds of trying
      if (success || attempts > 20) {
        clearInterval(interval);
        
        // Remove from storage to prevent infinite feedback loops if the user simply refreshes the page
        chrome.storage.local.remove(['pendingPrompt']);
      }
    }, 500);
  }
});
