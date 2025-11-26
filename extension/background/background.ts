import { ExtensionMessage } from '../../shared/types';

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'fill-form') {
    fillCurrentPage();
  }
});

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    fillCurrentPage();
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // Keep channel open for async response
});

async function fillCurrentPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.id) return;
  
  const message: ExtensionMessage = {
    action: 'fillForm',
  };
  
  try {
    const response = await chrome.tabs.sendMessage(tab.id, message);
    console.log('Fill result:', response);
  } catch (error) {
    console.error('Error filling form:', error);
  }
}

async function handleMessage(message: ExtensionMessage, sender: chrome.runtime.MessageSender): Promise<any> {
  const action = message.action;
  
  if (action === 'fillForm' || action === 'getUnrecognizedFields' || action === 'addAnswer') {
    if (sender.tab?.id) {
      return await chrome.tabs.sendMessage(sender.tab.id, message);
    }
  }
  
  return { success: false, error: 'Unknown action' };
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('MagicFill extension installed');
});
