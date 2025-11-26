import { ExtensionMessage } from '../../shared/types';
import { PlaywrightAPI } from '../core/PlaywrightAPI';
import { ProfileManager } from '../core/ProfileManager';
import { PlatformMatcher } from '../core/PlatformMatcher';

class PopupController {
  private api: PlaywrightAPI;
  private profileManager: ProfileManager;
  private platformMatcher: PlatformMatcher;
  private currentUrl: string = '';
  private currentPlatform: string | null = null;

  constructor() {
    this.api = new PlaywrightAPI();
    this.profileManager = new ProfileManager();
    this.platformMatcher = new PlatformMatcher();
    this.init();
  }

  private async init() {
    // Setup event listeners
    document.getElementById('fillBtn')?.addEventListener('click', () => this.fillForm());
    document.getElementById('analyzeBtn')?.addEventListener('click', () => this.analyzeAndFill());
    document.getElementById('learnBtn')?.addEventListener('click', () => this.learnForm());
    document.getElementById('manageBtn')?.addEventListener('click', () => this.openManageAnswers());

    // Load initial status
    await this.updateStatus();
    
    // Check server status
    await this.checkServerStatus();
    
    // Poll for updates every 2 seconds
    setInterval(() => this.updateStatus(), 2000);
  }

  private async updateStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        this.showStatus('⚠️', 'No active tab', 'warning');
        return;
      }

      const message: ExtensionMessage = {
        action: 'getUnrecognizedFields',
      };

      const unrecognizedFields = await chrome.tabs.sendMessage(tab.id, message);
      
      if (unrecognizedFields && unrecognizedFields.length > 0) {
        this.showStatus('✅', `Ready to fill (${unrecognizedFields.length} unrecognized)`, 'success');
      } else {
        this.showStatus('✅', 'All fields recognized', 'success');
      }
      
      // Update platform and profile status
      await this.updatePlatformStatus();
    } catch (error) {
      this.showStatus('⚠️', 'Not a fillable page', 'warning');
    }
  }

  private showStatus(icon: string, text: string, type: 'success' | 'warning' | 'error') {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;

    statusEl.className = `status ${type}`;
    statusEl.innerHTML = `
      <div class="status-icon">${icon}</div>
      <div class="status-text">${text}</div>
    `;
  }

  private async fillForm() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) return;

      const message: ExtensionMessage = {
        action: 'fillForm',
      };

      const result = await chrome.tabs.sendMessage(tab.id, message);
      
      if (result) {
        this.showStatus('✨', `Filled ${result.filled}/${result.total} fields`, 'success');
        await this.updateStatus();
      }
    } catch (error) {
      this.showStatus('❌', 'Error filling form', 'error');
      console.error('Fill error:', error);
    }
  }



  private async learnForm() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) return;

      this.showStatus('🧠', 'Learning form...', 'success');

      const message: ExtensionMessage = {
        action: 'learnForm',
      };

      const result = await chrome.tabs.sendMessage(tab.id, message);
      
      if (result.success) {
        if (result.fieldsLearned === 0) {
          this.showStatus('✅', 'All fields recognized!', 'success');
        } else {
          this.showStatus('✅', `Found ${result.fieldsLearned} new fields!`, 'success');
          
          // Open review page
          if (result.openReview) {
            chrome.tabs.create({ url: chrome.runtime.getURL('review-fields.html') });
          }
        }
        await this.updateStatus();
      } else {
        this.showStatus('❌', result.error || 'Learning failed', 'error');
      }
    } catch (error) {
      this.showStatus('❌', 'MCP server not running', 'error');
      console.error('Learn error:', error);
    }
  }

  private openManageAnswers() {
    chrome.tabs.create({ url: chrome.runtime.getURL('manage.html') });
  }

  /**
   * Check Playwright server status
   */
  private async checkServerStatus() {
    const serverStatusEl = document.getElementById('serverStatus');
    const indicator = serverStatusEl?.querySelector('.server-indicator');
    
    if (!serverStatusEl || !indicator) return;
    
    const isOnline = await this.api.checkHealth();
    
    serverStatusEl.style.display = 'flex';
    
    if (isOnline) {
      indicator.classList.add('online');
    } else {
      indicator.classList.remove('online');
    }
  }

  /**
   * Update platform and profile status
   */
  private async updatePlatformStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url) return;
      
      this.currentUrl = tab.url;
      this.currentPlatform = this.platformMatcher.detectPlatform(tab.url);
      
      const platformStatusEl = document.getElementById('platformStatus');
      const platformNameEl = document.getElementById('platformName');
      const profileStatusEl = document.getElementById('profileStatus');
      const analyzeBtn = document.getElementById('analyzeBtn') as HTMLButtonElement;
      
      if (!this.currentPlatform) {
        // Unknown platform - hide status, show analyze button
        platformStatusEl!.style.display = 'none';
        analyzeBtn!.style.display = 'block';
        analyzeBtn!.textContent = '🔍 Analyze Page';
        return;
      }
      
      // Show platform info
      platformStatusEl!.style.display = 'block';
      platformNameEl!.textContent = this.platformMatcher.getPlatformName(this.currentPlatform);
      
      // Check for cached profile
      const profile = await this.profileManager.getProfile(this.currentPlatform);
      
      if (profile) {
        const age = this.profileManager.getProfileAge(profile);
        const isStale = this.profileManager.isProfileStale(profile);
        
        profileStatusEl!.textContent = `Profile cached (${age} days old)`;
        profileStatusEl!.className = `profile-status ${isStale ? 'stale' : 'cached'}`;
        
        // Show re-analyze option if stale
        if (isStale) {
          analyzeBtn!.style.display = 'block';
          analyzeBtn!.innerHTML = '<span class="btn-icon">🔄</span> Re-Analyze';
        } else {
          analyzeBtn!.style.display = 'none';
        }
      } else {
        profileStatusEl!.textContent = 'No profile - click Analyze & Fill';
        profileStatusEl!.className = 'profile-status';
        analyzeBtn!.style.display = 'block';
        analyzeBtn!.innerHTML = '<span class="btn-icon">🔍</span> Analyze & Fill';
      }
    } catch (error) {
      console.error('Error updating platform status:', error);
    }
  }

  /**
   * Analyze current page and fill
   */
  private async analyzeAndFill() {
    const analyzeBtn = document.getElementById('analyzeBtn') as HTMLButtonElement;
    
    try {
      // Disable button and show loading
      analyzeBtn.disabled = true;
      analyzeBtn.classList.add('loading');
      this.showStatus('🔍', 'Analyzing page...', 'success');
      
      // Get current URL
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url) {
        throw new Error('No active tab URL');
      }
      
      // Call Playwright server
      const response = await this.api.analyzeCurrentPage(tab.url);
      
      if (!response.success || !response.profile) {
        throw new Error(response.error || 'Analysis failed');
      }
      
      // Save profile
      const platform = this.currentPlatform || response.profile.platform;
      await this.profileManager.saveProfile(platform, response.profile);
      
      this.showStatus('✅', `Analyzed! Found ${response.profile.totalFields} fields`, 'success');
      
      // Update UI
      await this.updatePlatformStatus();
      
      // Auto-fill after analysis
      setTimeout(() => this.fillForm(), 1000);
      
    } catch (error: any) {
      this.showStatus('❌', error.message || 'Analysis failed', 'error');
      console.error('Analysis error:', error);
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.classList.remove('loading');
    }
  }
}

// Initialize popup
console.log('popup.ts: Script loaded, creating PopupController...');
try {
  new PopupController();
  console.log('popup.ts: PopupController created successfully');
} catch (error) {
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
