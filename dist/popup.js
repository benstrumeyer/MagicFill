/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./extension/core/PlatformMatcher.ts":
/*!*******************************************!*\
  !*** ./extension/core/PlatformMatcher.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PlatformMatcher: () => (/* binding */ PlatformMatcher)
/* harmony export */ });
class PlatformMatcher {
    /**
     * Detect platform from URL
     */
    detectPlatform(url) {
        // Greenhouse
        if (url.includes('greenhouse.io') || url.includes('boards.greenhouse.io')) {
            return 'greenhouse';
        }
        // Lever
        if (url.includes('lever.co') || url.includes('jobs.lever.co')) {
            return 'lever';
        }
        // Workday
        if (url.includes('myworkdayjobs.com') || url.includes('workday.com')) {
            return 'workday';
        }
        // Ashby
        if (url.includes('ashbyhq.com') || url.includes('jobs.ashbyhq.com')) {
            return 'ashby';
        }
        // BambooHR
        if (url.includes('bamboohr.com')) {
            return 'bamboohr';
        }
        // JazzHR
        if (url.includes('jazz.co') || url.includes('applytojob.com')) {
            return 'jazzhr';
        }
        // SmartRecruiters
        if (url.includes('smartrecruiters.com')) {
            return 'smartrecruiters';
        }
        // Unknown platform
        return null;
    }
    /**
     * Get platform display name
     */
    getPlatformName(platform) {
        const names = {
            greenhouse: 'Greenhouse',
            lever: 'Lever',
            workday: 'Workday',
            ashby: 'Ashby',
            bamboohr: 'BambooHR',
            jazzhr: 'JazzHR',
            smartrecruiters: 'SmartRecruiters',
            generic: 'Generic'
        };
        return names[platform] || 'Unknown';
    }
}


/***/ }),

/***/ "./extension/core/PlaywrightAPI.ts":
/*!*****************************************!*\
  !*** ./extension/core/PlaywrightAPI.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PlaywrightAPI: () => (/* binding */ PlaywrightAPI)
/* harmony export */ });
class PlaywrightAPI {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }
    /**
     * Check if the Playwright server is running
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        }
        catch (error) {
            console.error('Playwright server health check failed:', error);
            return false;
        }
    }
    /**
     * Analyze the current page URL
     */
    async analyzeCurrentPage(url) {
        console.log(`📡 Requesting analysis for: ${url}`);
        try {
            const response = await fetch(`${this.baseUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url }),
                signal: AbortSignal.timeout(120000) // 2 minute timeout for complex pages
            });
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }
            const data = await response.json();
            if (data.success && data.profile) {
                console.log(`✓ Analysis complete: ${data.profile.totalFields} fields found`);
            }
            else {
                console.error(`✗ Analysis failed: ${data.error}`);
            }
            return data;
        }
        catch (error) {
            console.error('Analysis request failed:', error);
            return {
                success: false,
                error: error.message || 'Network error'
            };
        }
    }
    /**
     * Fill form using Playwright (opens visible browser)
     */
    async fillForm(url, personalData) {
        console.log(`📡 Requesting form fill for: ${url}`);
        try {
            const response = await fetch(`${this.baseUrl}/fill-form`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, personalData }),
                signal: AbortSignal.timeout(180000) // 3 minute timeout
            });
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                console.log(`✓ Form filled: ${data.filled} fields`);
            }
            else {
                console.error(`✗ Fill failed: ${data.error}`);
            }
            return data;
        }
        catch (error) {
            console.error('Fill form request failed:', error);
            return {
                success: false,
                error: error.message || 'Network error'
            };
        }
    }
}


/***/ }),

/***/ "./extension/core/ProfileManager.ts":
/*!******************************************!*\
  !*** ./extension/core/ProfileManager.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProfileManager: () => (/* binding */ ProfileManager)
/* harmony export */ });
class ProfileManager {
    constructor() {
        this.storageKey = 'siteProfiles';
    }
    /**
     * Save a profile for a platform
     */
    async saveProfile(platform, profile) {
        console.log(`💾 Saving profile for platform: ${platform}`);
        const cache = await this.getAllProfiles();
        cache[platform] = profile;
        await chrome.storage.local.set({ [this.storageKey]: cache });
        console.log(`✓ Profile saved`);
    }
    /**
     * Get a profile for a platform
     */
    async getProfile(platform) {
        const cache = await this.getAllProfiles();
        return cache[platform] || null;
    }
    /**
     * Get all cached profiles
     */
    async getAllProfiles() {
        const result = await chrome.storage.local.get(this.storageKey);
        return result[this.storageKey] || {};
    }
    /**
     * Delete a profile
     */
    async deleteProfile(platform) {
        console.log(`🗑️ Deleting profile for platform: ${platform}`);
        const cache = await this.getAllProfiles();
        delete cache[platform];
        await chrome.storage.local.set({ [this.storageKey]: cache });
        console.log(`✓ Profile deleted`);
    }
    /**
     * Clear all profiles
     */
    async clearAll() {
        await chrome.storage.local.remove(this.storageKey);
        console.log(`✓ All profiles cleared`);
    }
    /**
     * Get profile age in days
     */
    getProfileAge(profile) {
        const now = new Date();
        const profileDate = new Date(profile.timestamp);
        const diffMs = now.getTime() - profileDate.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
    /**
     * Check if profile is stale (older than 30 days)
     */
    isProfileStale(profile) {
        return this.getProfileAge(profile) > 30;
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "magicfill:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"popup": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkmagicfill"] = self["webpackChunkmagicfill"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************************!*\
  !*** ./extension/popup/popup.ts ***!
  \**********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core_PlaywrightAPI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/PlaywrightAPI */ "./extension/core/PlaywrightAPI.ts");
/* harmony import */ var _core_ProfileManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/ProfileManager */ "./extension/core/ProfileManager.ts");
/* harmony import */ var _core_PlatformMatcher__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/PlatformMatcher */ "./extension/core/PlatformMatcher.ts");



class PopupController {
    constructor() {
        this.currentPlatform = null;
        this.api = new _core_PlaywrightAPI__WEBPACK_IMPORTED_MODULE_0__.PlaywrightAPI();
        this.profileManager = new _core_ProfileManager__WEBPACK_IMPORTED_MODULE_1__.ProfileManager();
        this.platformMatcher = new _core_PlatformMatcher__WEBPACK_IMPORTED_MODULE_2__.PlatformMatcher();
        // Import Storage dynamically to avoid circular dependency
        __webpack_require__.e(/*! import() */ "extension_core_Storage_ts").then(__webpack_require__.bind(__webpack_require__, /*! ../core/Storage */ "./extension/core/Storage.ts")).then(({ Storage }) => {
            this.storage = new Storage();
        });
        this.init();
    }
    async init() {
        // Setup event listeners
        document.getElementById('fillBtn')?.addEventListener('click', () => this.fillForm());
        document.getElementById('saveAllBtn')?.addEventListener('click', () => this.saveAllAnswers());
        document.getElementById('learnFormBtn')?.addEventListener('click', () => this.learnFormPlaywright());
        document.getElementById('autoFillBtn')?.addEventListener('click', () => this.autoFillPlaywright());
        document.getElementById('startBrowserLearningBtn')?.addEventListener('click', () => this.startBrowserLearning());
        document.getElementById('stopBrowserLearningBtn')?.addEventListener('click', () => this.stopBrowserLearning());
        document.getElementById('manageBtn')?.addEventListener('click', () => this.openManageAnswers());
        // Load initial status
        await this.updateStatus();
        // Check server status
        await this.checkServerStatus();
        // Poll for updates every 2 seconds
        setInterval(() => this.updateStatus(), 2000);
    }
    async updateStatus() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.id) {
                this.showStatus('⚠️', 'No active tab', 'warning');
                return;
            }
            // Check if URL is restricted
            if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:'))) {
                this.showStatus('⚠️', 'Cannot run on this page', 'warning');
                return;
            }
            const message = {
                action: 'getUnrecognizedFields',
            };
            const unrecognizedFields = await chrome.tabs.sendMessage(tab.id, message);
            if (unrecognizedFields && unrecognizedFields.length > 0) {
                this.showStatus('✅', `Ready to fill (${unrecognizedFields.length} unrecognized)`, 'success');
            }
            else {
                this.showStatus('✅', 'All fields recognized', 'success');
            }
            // Update platform and profile status
            await this.updatePlatformStatus();
        }
        catch (error) {
            // Check if it's a "no receiver" error (content script not loaded)
            if (error.message && error.message.includes('Receiving end does not exist')) {
                this.showStatus('⚠️', 'Page loading... (refresh if stuck)', 'warning');
            }
            else {
                this.showStatus('⚠️', 'Not a fillable page', 'warning');
            }
            console.log('Status update error:', error);
        }
    }
    showStatus(icon, text, type) {
        const statusEl = document.getElementById('status');
        if (!statusEl)
            return;
        statusEl.className = `status ${type}`;
        statusEl.innerHTML = `
      <div class="status-icon">${icon}</div>
      <div class="status-text">${text}</div>
    `;
    }
    async fillForm() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.id)
                return;
            const message = {
                action: 'fillForm',
            };
            const result = await chrome.tabs.sendMessage(tab.id, message);
            if (result) {
                this.showStatus('✨', `Filled ${result.filled}/${result.total} fields`, 'success');
                await this.updateStatus();
            }
        }
        catch (error) {
            this.showStatus('❌', 'Error filling form', 'error');
            console.error('Fill error:', error);
        }
    }
    async saveAllAnswers() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.id)
                return;
            this.showStatus('💾', 'Saving answers...', 'success');
            const message = {
                action: 'saveAllAnswers',
            };
            const result = await chrome.tabs.sendMessage(tab.id, message);
            if (result.success) {
                this.showStatus('✅', `Saved ${result.saved} new, updated ${result.updated}`, 'success');
                console.log('Saved answers:', result.answers);
            }
            else {
                this.showStatus('❌', result.error || 'No filled fields found', 'error');
            }
        }
        catch (error) {
            this.showStatus('❌', 'Error saving answers', 'error');
            console.error('Save error:', error);
        }
    }
    /**
     * Learn Form with Playwright - Opens browser and learns as user fills
     */
    async learnFormPlaywright() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.url) {
                alert('No URL found');
                return;
            }
            this.showStatus('🎓', 'Starting learning mode...', 'success');
            const response = await fetch('http://localhost:3000/learn-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: tab.url })
            });
            const result = await response.json();
            if (result.success) {
                this.showStatus('🎓', 'Learning mode active! Fill the form in the browser.', 'success');
                // Enable auto-fill button
                const autoFillBtn = document.getElementById('autoFillBtn');
                if (autoFillBtn) {
                    autoFillBtn.disabled = false;
                }
            }
            else {
                this.showStatus('❌', `Error: ${result.error}`, 'error');
            }
        }
        catch (error) {
            console.error('Learn form error:', error);
            this.showStatus('❌', 'Server offline. Start Playwright server.', 'error');
        }
    }
    /**
     * Auto-Fill with Playwright - Uses learned profile
     */
    async autoFillPlaywright() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.url) {
                alert('No URL found');
                return;
            }
            // Get personal data
            const personalData = await this.storage.getPersonalData();
            this.showStatus('🚀', 'Auto-filling...', 'success');
            const response = await fetch('http://localhost:3000/auto-fill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: tab.url,
                    personalData,
                    useCache: true
                })
            });
            const result = await response.json();
            if (result.success) {
                const cacheMsg = result.fromCache ? ' (from cache)' : ' (learned)';
                this.showStatus('✅', `Filled ${result.filled}/${result.total} fields${cacheMsg}`, 'success');
            }
            else {
                this.showStatus('❌', `Error: ${result.error}`, 'error');
            }
        }
        catch (error) {
            console.error('Auto-fill error:', error);
            this.showStatus('❌', 'Server offline. Start Playwright server.', 'error');
        }
    }
    openManageAnswers() {
        chrome.tabs.create({ url: chrome.runtime.getURL('manage.html') });
    }
    /**
     * Get human-readable time ago
     */
    getTimeAgo(date) {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60)
            return 'just now';
        if (seconds < 3600)
            return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400)
            return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800)
            return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }
    /**
     * Check Playwright server status
     */
    async checkServerStatus() {
        const serverStatusEl = document.getElementById('serverStatus');
        const indicator = serverStatusEl?.querySelector('.server-indicator');
        if (!serverStatusEl || !indicator)
            return;
        const isOnline = await this.api.checkHealth();
        serverStatusEl.style.display = 'flex';
        if (isOnline) {
            indicator.classList.add('online');
        }
        else {
            indicator.classList.remove('online');
        }
    }
    /**
     * Update platform and profile status
     */
    async updatePlatformStatus() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.url)
                return;
            this.currentPlatform = this.platformMatcher.detectPlatform(tab.url);
            // Get DOM elements first
            const platformStatusEl = document.getElementById('platformStatus');
            const platformNameEl = document.getElementById('platformName');
            const profileStatusEl = document.getElementById('profileStatus');
            const analyzeBtn = document.getElementById('analyzeBtn');
            // Check for ongoing/completed analysis
            if (this.storage) {
                const analysisState = await this.storage.getAnalysisState(tab.url);
                if (analysisState) {
                    if (analysisState.status === 'analyzing') {
                        // Show analyzing state
                        if (analyzeBtn) {
                            analyzeBtn.disabled = true;
                            analyzeBtn.classList.add('loading');
                            analyzeBtn.innerHTML = '<span class="btn-icon">🔍</span> Analyzing...';
                        }
                        this.showStatus('🔍', 'Analysis in progress...', 'success');
                        return;
                    }
                    else if (analysisState.status === 'completed') {
                        // Show completed indicator with timestamp
                        const analyzedDate = new Date(analysisState.startTime);
                        const timeAgo = this.getTimeAgo(analyzedDate);
                        if (profileStatusEl) {
                            profileStatusEl.textContent = `✅ Page analyzed ${timeAgo}`;
                            profileStatusEl.className = 'profile-status cached';
                        }
                        // Show scanned badge
                        const scannedBadge = document.getElementById('scannedBadge');
                        if (scannedBadge) {
                            scannedBadge.style.display = 'inline-block';
                        }
                        // Hide analyze button
                        if (analyzeBtn) {
                            analyzeBtn.style.display = 'none';
                        }
                        this.showStatus('✅', `Page analyzed ${timeAgo}`, 'success');
                        return;
                    }
                }
            }
            if (!this.currentPlatform) {
                // Unknown platform - hide status, show analyze button
                platformStatusEl.style.display = 'none';
                analyzeBtn.style.display = 'block';
                analyzeBtn.textContent = '🔍 Analyze Page';
                return;
            }
            // Show platform info
            platformStatusEl.style.display = 'block';
            platformNameEl.textContent = this.platformMatcher.getPlatformName(this.currentPlatform);
            // Check for cached profile
            const profile = await this.profileManager.getProfile(this.currentPlatform);
            if (profile) {
                const age = this.profileManager.getProfileAge(profile);
                const isStale = this.profileManager.isProfileStale(profile);
                profileStatusEl.textContent = `Profile cached (${age} days old)`;
                profileStatusEl.className = `profile-status ${isStale ? 'stale' : 'cached'}`;
                // Show re-analyze option if stale
                if (isStale) {
                    analyzeBtn.style.display = 'block';
                    analyzeBtn.innerHTML = '<span class="btn-icon">🔄</span> Re-Analyze';
                }
                else {
                    analyzeBtn.style.display = 'none';
                }
            }
            else {
                profileStatusEl.textContent = 'No profile - click Analyze & Fill';
                profileStatusEl.className = 'profile-status';
                analyzeBtn.style.display = 'block';
                analyzeBtn.innerHTML = '<span class="btn-icon">🔍</span> Analyze & Fill';
            }
        }
        catch (error) {
            console.error('Error updating platform status:', error);
        }
    }
    /**
     * Start Browser Learning Mode (No Playwright needed!)
     */
    async startBrowserLearning() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.id)
                return;
            const result = await chrome.tabs.sendMessage(tab.id, {
                action: 'startLearning'
            });
            if (result.success) {
                this.showStatus('🎓', 'Learning mode active! Fill the form.', 'success');
                // Toggle buttons
                const startBtn = document.getElementById('startBrowserLearningBtn');
                const stopBtn = document.getElementById('stopBrowserLearningBtn');
                if (startBtn)
                    startBtn.style.display = 'none';
                if (stopBtn)
                    stopBtn.style.display = 'block';
            }
        }
        catch (error) {
            this.showStatus('❌', 'Error: ' + error.message, 'error');
        }
    }
    /**
     * Stop Browser Learning Mode and save
     */
    async stopBrowserLearning() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.id)
                return;
            const result = await chrome.tabs.sendMessage(tab.id, {
                action: 'stopLearning'
            });
            if (result.success) {
                this.showStatus('✅', `Learned ${result.fieldsLearned} fields!`, 'success');
                // Toggle buttons
                const startBtn = document.getElementById('startBrowserLearningBtn');
                const stopBtn = document.getElementById('stopBrowserLearningBtn');
                if (startBtn)
                    startBtn.style.display = 'block';
                if (stopBtn)
                    stopBtn.style.display = 'none';
            }
        }
        catch (error) {
            this.showStatus('❌', 'Error: ' + error.message, 'error');
        }
    }
}
// Initialize popup
console.log('popup.ts: Script loaded, creating PopupController...');
try {
    new PopupController();
    console.log('popup.ts: PopupController created successfully');
}
catch (error) {
    console.error('popup.ts: Failed to create PopupController:', error);
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
      <div style="padding: 20px;">
        <h1 style="color: #f44336;">Error</h1>
        <p>Failed to initialize popup. Check console for details.</p>
      </div>
    `;
    }
}

})();

/******/ })()
;
//# sourceMappingURL=popup.js.map