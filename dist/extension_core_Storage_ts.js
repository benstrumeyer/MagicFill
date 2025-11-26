"use strict";
(self["webpackChunkmagicfill"] = self["webpackChunkmagicfill"] || []).push([["extension_core_Storage_ts"],{

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

}]);
//# sourceMappingURL=extension_core_Storage_ts.js.map