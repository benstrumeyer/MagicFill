/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!********************************************!*\
  !*** ./extension/background/background.ts ***!
  \********************************************/
__webpack_require__.r(__webpack_exports__);
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender).then(sendResponse);
    return true; // Keep channel open for async response
});
async function fillCurrentPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id)
        return;
    const message = {
        action: 'fillForm',
    };
    try {
        const response = await chrome.tabs.sendMessage(tab.id, message);
        console.log('Fill result:', response);
    }
    catch (error) {
        console.error('Error filling form:', error);
    }
}
async function handleMessage(message, sender) {
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


/******/ })()
;
//# sourceMappingURL=background.js.map