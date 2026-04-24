# Polish with AI

**Polish with AI** is a powerful Chrome extension that seamlessly connects your browsing experience with the world's leading Machine Learning and AI language models. Highlight any text, right-click, and instantly send it to your favorite AI assistant with custom, dynamic prompts!

## ✨ Features

- **Multi-ML Model Support:** Out-of-the-box support for the top AI platforms:
  - Google Gemini
  - OpenAI ChatGPT
  - Anthropic Claude
  - Perplexity AI
- **Dynamic Prompt Templates:** Create and manage your own library of prompt templates. Whether you want to "Translate to Spanish", "Summarize this article", or "Check for Grammar", you can build the perfect prompt for the job.
- **Smart Tokens:** Use placeholders in your templates to dynamically inject context:
  - `{{selected_text}}`: Automatically replaced by the text you highlighted on the webpage.
  - `{{web_page_context}}`: Automatically replaced by the URL of the current tab.
- **Context-Aware Menus:** The extension intelligently manages your right-click context menu. Prompts that require highlighted text will only appear when you actually select text, keeping your menus clean and relevant.
- **Auto-Injection:** Once you select an AI, the extension opens a new tab and automatically pastes your fully-formatted prompt directly into the AI's chat box using native DOM interaction events.

## 🚀 How to Use

1. **Configure Your Prompts:**
   - Right-click the extension icon in your browser toolbar and click **Options**.
   - Enable or disable the specific AI models you want to use.
   - Use the **+ Add New Prompt** button to create custom commands (e.g., "Summarize", "Explain like I'm 5").
   - Click **Save Settings**.

2. **Trigger the AI:**
   - Highlight any text on a web page.
   - Right-click to open the context menu.
   - Hover over **✨ Polish with AI** -> Choose your Prompt -> Choose your target AI.
   - A new tab will open with your chosen AI, and your prompt will be automatically injected!

## 🛠️ Technical Details

- **Manifest V3:** Built using the latest Chrome Extension Manifest V3 standards.
- **Service Workers:** Uses `background.js` to securely manage `chrome.storage` and dynamically rebuild the context menu based on your settings.
- **Content Scripts:** Employs advanced content injection (`content.js`) to interact with modern Javascript frameworks (React, Lexical, etc.) used by ChatGPT, Gemini, Claude, and Perplexity. It gracefully handles different DOM structures and uses `ClipboardEvent` protocols when necessary.

## 🤝 Support

Have a feature request or found a bug? 
- [Suggest a Feature](https://tally.so/r/rjLppM)
- [Rate us on the Chrome Web Store](https://chromewebstore.google.com/detail/polish-with-gemini-free/cmhchogakhcmcefgejjknlialemnaiie/reviews)
