/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./extension/core/Storage.ts":
/*!***********************************!*\
  !*** ./extension/core/Storage.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Storage: () => (/* binding */ Storage)
/* harmony export */ });
class Storage {
    /**
     * Get a value from chrome.storage.local
     */
    async get(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                resolve(result[key] || null);
            });
        });
    }
    /**
     * Set a value in chrome.storage.local
     */
    async set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                resolve();
            });
        });
    }
    /**
     * Get personal data
     */
    async getPersonalData() {
        const data = await this.get('personalData');
        // If no data exists, try to load dev data
        if (!data || Object.keys(data).length === 0 || !data.firstName) {
            const devData = await this.loadDevData();
            if (devData) {
                console.log('Storage: Loaded dev-data.json for testing');
                await this.setPersonalData(devData);
                return devData;
            }
        }
        const result = data || this.getDefaultPersonalData();
        // Load field mappings if not present
        if (!result.fieldMappings) {
            result.fieldMappings = await this.loadFieldMappings();
        }
        return result;
    }
    /**
     * Load field mappings from field-mappings.json
     */
    async loadFieldMappings() {
        try {
            const response = await fetch(chrome.runtime.getURL('field-mappings.json'));
            if (response.ok) {
                const mappings = await response.json();
                console.log('Storage: Loaded field-mappings.json');
                return mappings;
            }
        }
        catch (error) {
            console.log('Storage: No field-mappings.json found');
        }
        return {};
    }
    /**
     * Load development data from dev-data.json (for testing)
     */
    async loadDevData() {
        try {
            const response = await fetch(chrome.runtime.getURL('dev-data.json'));
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        }
        catch (error) {
            // dev-data.json doesn't exist, that's fine
            console.log('Storage: No dev-data.json found (this is normal for production)');
        }
        return null;
    }
    /**
     * Set personal data
     */
    async setPersonalData(data) {
        await this.set('personalData', data);
    }
    /**
     * Add a custom answer dynamically
     */
    async addAnswer(key, value, siteSpecific = false) {
        const data = await this.getPersonalData();
        if (!data.customAnswers) {
            data.customAnswers = {};
        }
        if (siteSpecific) {
            const hostname = window.location.hostname;
            if (!data.siteSpecificAnswers) {
                data.siteSpecificAnswers = {};
            }
            if (!data.siteSpecificAnswers[hostname]) {
                data.siteSpecificAnswers[hostname] = {};
            }
            data.siteSpecificAnswers[hostname][key] = value;
        }
        else {
            data.customAnswers[key] = value;
        }
        await this.setPersonalData(data);
    }
    /**
     * Get default personal data structure
     */
    getDefaultPersonalData() {
        return {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            address2: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States',
            currentCompany: '',
            currentTitle: '',
            yearsExperience: 0,
            linkedin: '',
            github: '',
            portfolio: '',
            university: '',
            degree: '',
            major: '',
            graduationYear: 0,
            workAuthorization: '',
            requiresSponsorship: false,
            salaryExpectation: '',
            startDate: '',
            noticePeriod: '',
            referral: '',
            howDidYouHear: '',
            coverLetter: '',
            additionalInfo: '',
            customAnswers: {},
            siteSpecificAnswers: {},
        };
    }
    /**
     * Export personal data as JSON
     */
    async exportData() {
        const data = await this.getPersonalData();
        return JSON.stringify(data, null, 2);
    }
    /**
     * Import personal data from JSON
     */
    async importData(json) {
        try {
            const data = JSON.parse(json);
            await this.setPersonalData(data);
        }
        catch (error) {
            throw new Error('Invalid JSON format');
        }
    }
    /**
     * Delete a custom answer
     */
    async deleteAnswer(key, siteSpecific = false, hostname) {
        const data = await this.getPersonalData();
        if (siteSpecific && hostname && data.siteSpecificAnswers?.[hostname]) {
            delete data.siteSpecificAnswers[hostname][key];
        }
        else if (data.customAnswers) {
            delete data.customAnswers[key];
        }
        await this.setPersonalData(data);
    }
    /**
     * Get analysis state for current URL
     */
    async getAnalysisState(url) {
        const states = await this.get('analysisStates');
        return states?.[url] || null;
    }
    /**
     * Set analysis state for URL
     */
    async setAnalysisState(url, state) {
        const states = await this.get('analysisStates') || {};
        states[url] = state;
        await this.set('analysisStates', states);
    }
    /**
     * Clear analysis state for URL
     */
    async clearAnalysisState(url) {
        const states = await this.get('analysisStates') || {};
        delete states[url];
        await this.set('analysisStates', states);
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
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
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
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!************************************!*\
  !*** ./extension/manage/manage.ts ***!
  \************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core_Storage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Storage */ "./extension/core/Storage.ts");

class ManageController {
    constructor() {
        this.personalData = null;
        this.searchQuery = '';
        console.log('ManageController: Initializing...');
        this.storage = new _core_Storage__WEBPACK_IMPORTED_MODULE_0__.Storage();
        this.init().catch(error => {
            console.error('ManageController: Initialization failed:', error);
            alert('Failed to initialize. Please check the console for errors.');
        });
    }
    async init() {
        try {
            console.log('ManageController: Loading personal data...');
            // Load personal data
            console.log('ManageController: Personal data loaded:', this.personalData);
            this.personalData = await this.storage.getPersonalData();
            // Setup event listeners
            this.setupEventListeners();
            console.log('ManageController: Event listeners setup');
            // Load initial data
            this.loadPersonalDataTab();
            this.updateStats();
            console.log('ManageController: Initialization complete');
        }
        catch (error) {
            console.error('ManageController: Error during init:', error);
            throw error;
        }
    }
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target;
                const tab = target.dataset.tab;
                if (tab)
                    this.switchTab(tab);
            });
        });
        // Search
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterAnswers();
        });
        // Save personal data
        document.getElementById('savePersonalBtn')?.addEventListener('click', () => this.savePersonalData());
        // Export/Import
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportData());
        document.getElementById('importBtn')?.addEventListener('click', () => this.showImportModal());
        document.getElementById('confirmImportBtn')?.addEventListener('click', () => this.importData());
        // Add custom answer
        document.getElementById('addCustomBtn')?.addEventListener('click', () => this.addCustomAnswer());
    }
    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
        });
        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        const paneMap = {
            'personal': 'personalTab',
            'custom': 'customTab',
            'site-specific': 'siteSpecificTab',
        };
        const paneId = paneMap[tab];
        if (paneId) {
            document.getElementById(paneId)?.classList.add('active');
            // Load tab-specific data
            if (tab === 'custom')
                this.loadCustomAnswers();
            if (tab === 'site-specific')
                this.loadSiteSpecificAnswers();
        }
    }
    loadPersonalDataTab() {
        if (!this.personalData)
            return;
        document.querySelectorAll('.personal-field').forEach(field => {
            const input = field;
            const fieldName = input.dataset.field;
            if (fieldName && this.personalData) {
                const value = this.personalData[fieldName];
                if (input instanceof HTMLSelectElement) {
                    input.value = String(value);
                }
                else {
                    input.value = value !== null && value !== undefined ? String(value) : '';
                }
            }
        });
    }
    async savePersonalData() {
        if (!this.personalData)
            return;
        document.querySelectorAll('.personal-field').forEach(field => {
            const input = field;
            const fieldName = input.dataset.field;
            if (fieldName && this.personalData) {
                let value = input.value;
                // Convert types
                if (fieldName === 'yearsExperience' || fieldName === 'graduationYear') {
                    value = value ? parseInt(value) : undefined;
                }
                else if (fieldName === 'requiresSponsorship') {
                    value = value === 'true';
                }
                this.personalData[fieldName] = value;
            }
        });
        await this.storage.setPersonalData(this.personalData);
        this.showSuccessMessage('Personal data saved successfully!');
    }
    loadCustomAnswers() {
        if (!this.personalData?.customAnswers)
            return;
        const list = document.getElementById('customAnswersList');
        if (!list)
            return;
        list.innerHTML = '';
        const answers = Object.entries(this.personalData.customAnswers);
        if (answers.length === 0) {
            list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-text">No custom answers yet</div>
        </div>
      `;
            return;
        }
        answers.forEach(([key, value]) => {
            const item = document.createElement('div');
            item.className = 'answer-item';
            item.innerHTML = `
        <div class="answer-info">
          <div class="answer-key">${key}</div>
          <div class="answer-value">${this.truncate(String(value), 100)}</div>
        </div>
        <div class="answer-actions">
          <button class="icon-btn edit-btn" data-key="${key}" title="Edit">✏️</button>
          <button class="icon-btn delete-btn minus-btn" data-key="${key}" title="Remove">−</button>
        </div>
      `;
            item.querySelector('.edit-btn')?.addEventListener('click', () => this.editCustomAnswer(key));
            item.querySelector('.delete-btn')?.addEventListener('click', () => this.deleteCustomAnswer(key));
            list.appendChild(item);
        });
    }
    loadSiteSpecificAnswers() {
        if (!this.personalData?.siteSpecificAnswers)
            return;
        const container = document.getElementById('sitesList');
        if (!container)
            return;
        container.innerHTML = '';
        const sites = Object.entries(this.personalData.siteSpecificAnswers);
        if (sites.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🌐</div>
          <div class="empty-state-text">No site-specific answers yet</div>
        </div>
      `;
            return;
        }
        sites.forEach(([hostname, answers]) => {
            const section = document.createElement('div');
            section.className = 'site-section';
            const header = document.createElement('div');
            header.className = 'site-header';
            header.textContent = hostname;
            section.appendChild(header);
            const list = document.createElement('div');
            list.className = 'answers-list';
            Object.entries(answers).forEach(([key, value]) => {
                const item = document.createElement('div');
                item.className = 'answer-item';
                item.innerHTML = `
          <div class="answer-info">
            <div class="answer-key">${key}</div>
            <div class="answer-value">${this.truncate(String(value), 100)}</div>
          </div>
          <div class="answer-actions">
            <button class="icon-btn delete-btn minus-btn" data-hostname="${hostname}" data-key="${key}" title="Remove">−</button>
          </div>
        `;
                item.querySelector('.delete-btn')?.addEventListener('click', () => {
                    this.deleteSiteSpecificAnswer(hostname, key);
                });
                list.appendChild(item);
            });
            section.appendChild(list);
            container.appendChild(section);
        });
    }
    async addCustomAnswer() {
        const key = prompt('Enter answer key (e.g., preferredWorkLocation):');
        if (!key)
            return;
        const value = prompt('Enter answer value:');
        if (!value)
            return;
        await this.storage.addAnswer(key, value, false);
        this.personalData = await this.storage.getPersonalData();
        this.loadCustomAnswers();
        this.updateStats();
        this.showSuccessMessage('Custom answer added!');
    }
    async editCustomAnswer(key) {
        const currentValue = this.personalData?.customAnswers?.[key];
        const newValue = prompt('Edit answer value:', String(currentValue));
        if (newValue !== null) {
            await this.storage.addAnswer(key, newValue, false);
            this.personalData = await this.storage.getPersonalData();
            this.loadCustomAnswers();
            this.showSuccessMessage('Answer updated!');
        }
    }
    async deleteCustomAnswer(key) {
        if (!confirm(`Delete answer "${key}"?`))
            return;
        await this.storage.deleteAnswer(key, false);
        this.personalData = await this.storage.getPersonalData();
        this.loadCustomAnswers();
        this.updateStats();
        this.showSuccessMessage('Answer deleted!');
    }
    async deleteSiteSpecificAnswer(hostname, key) {
        if (!confirm(`Delete answer "${key}" for ${hostname}?`))
            return;
        await this.storage.deleteAnswer(key, true, hostname);
        this.personalData = await this.storage.getPersonalData();
        this.loadSiteSpecificAnswers();
        this.updateStats();
        this.showSuccessMessage('Answer deleted!');
    }
    filterAnswers() {
        // Filter logic for search
        const items = document.querySelectorAll('.answer-item');
        items.forEach(item => {
            const text = item.textContent?.toLowerCase() || '';
            const matches = text.includes(this.searchQuery);
            item.style.display = matches ? 'flex' : 'none';
        });
    }
    async exportData() {
        const json = await this.storage.exportData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `magicfill-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showSuccessMessage('Data exported!');
    }
    showImportModal() {
        const modal = document.getElementById('importModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    async importData() {
        const textarea = document.getElementById('importJson');
        if (!textarea)
            return;
        try {
            await this.storage.importData(textarea.value);
            this.personalData = await this.storage.getPersonalData();
            this.loadPersonalDataTab();
            this.updateStats();
            this.closeImportModal();
            this.showSuccessMessage('Data imported successfully!');
        }
        catch (error) {
            alert('Invalid JSON format. Please check your data and try again.');
        }
    }
    closeImportModal() {
        const modal = document.getElementById('importModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    updateStats() {
        if (!this.personalData)
            return;
        const totalAnswers = Object.keys(this.personalData.customAnswers || {}).length;
        const sitesConfigured = Object.keys(this.personalData.siteSpecificAnswers || {}).length;
        const totalEl = document.getElementById('totalAnswers');
        const sitesEl = document.getElementById('sitesConfigured');
        if (totalEl)
            totalEl.textContent = String(totalAnswers);
        if (sitesEl)
            sitesEl.textContent = String(sitesConfigured);
    }
    showSuccessMessage(message) {
        const div = document.createElement('div');
        div.className = 'success-message';
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => {
            div.remove();
        }, 3000);
    }
    truncate(text, maxLength) {
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength) + '...';
    }
}
// Make closeImportModal available globally for the HTML onclick
window.closeImportModal = () => {
    const modal = document.getElementById('importModal');
    if (modal)
        modal.style.display = 'none';
};
// Initialize
console.log('manage.ts: Script loaded, creating ManageController...');
try {
    new ManageController();
}
catch (error) {
    console.error('manage.ts: Failed to create ManageController:', error);
    document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h1>Error Loading MagicFill</h1>
      <p>Failed to initialize the extension. Please check the browser console for details.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${error}</pre>
    </div>
  `;
}

})();

/******/ })()
;
//# sourceMappingURL=manage.js.map