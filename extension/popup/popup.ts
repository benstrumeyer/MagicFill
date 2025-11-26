import { ExtensionMessage } from '../../shared/types';
import { PlaywrightAPI } from '../core/PlaywrightAPI';
import { ProfileManager } from '../core/ProfileManager';
import { PlatformMatcher } from '../core/PlatformMatcher';

class PopupController {
  private api: PlaywrightAPI;
  private profileManager: ProfileManager;
  private platformMatcher: PlatformMatcher;
  private storage: any;
  private currentPlatform: string | null = null;

  constructor() {
    this.api = new PlaywrightAPI();
    this.profileManager = new ProfileManager();
    this.platformMatcher = new PlatformMatcher();
    // Import Storage dynamically to avoid circular dependency
    import('../core/Storage').then(({ Storage }) => {
      this.storage = new Storage();
    });
    this.init();
  }

  private async init() {
    // Setup event listeners
    document.getElementById('fillBtn')?.addEventListener('click', () => this.fillForm());
    document.getElementById('saveAllBtn')?.addEventListener('click', () => this.saveAllAnswers());
    document.getElementById('learnFormBtn')?.addEventListener('click', () => this.learnFormPlaywright());
    document.getElementById('autoFillBtn')?.addEventListener('click', () => this.autoFillPlaywright());
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

      // Check if URL is restricted
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:'))) {
        this.showStatus('⚠️', 'Cannot run on this page', 'warning');
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
    } catch (error: any) {
      // Check if it's a "no receiver" error (content script not loaded)
      if (error.message && error.message.includes('Receiving end does not exist')) {
        this.showStatus('⚠️', 'Page loading... (refresh if stuck)', 'warning');
      } else {
        this.showStatus('⚠️', 'Not a fillable page', 'warning');
      }
      console.log('Status update error:', error);
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

  private async saveAllAnswers() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) return;

      this.showStatus('💾', 'Saving answers...', 'success');

      const message: ExtensionMessage = {
        action: 'saveAllAnswers',
      };

      const result = await chrome.tabs.sendMessage(tab.id, message);
      
      if (result.success) {
        this.showStatus('✅', `Saved ${result.saved} new, updated ${result.updated}`, 'success');
        console.log('Saved answers:', result.answers);
      } else {
        this.showStatus('❌', result.error || 'No filled fields found', 'error');
      }
    } catch (error) {
      this.showStatus('❌', 'Error saving answers', 'error');
      console.error('Save error:', error);
    }
  }



  /**
   * Learn Form with Playwright - Opens browser and learns as user fills
   */
  private async learnFormPlaywright() {
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
        const autoFillBtn = document.getElementById('autoFillBtn') as HTMLButtonElement;
        if (autoFillBtn) {
          autoFillBtn.disabled = false;
        }
      } else {
        this.showStatus('❌', `Error: ${result.error}`, 'error');
      }
    } catch (error: any) {
      console.error('Learn form error:', error);
      this.showStatus('❌', 'Server offline. Start Playwright server.', 'error');
    }
  }

  /**
   * Auto-Fill with Playwright - Uses learned profile
   */
  private async autoFillPlaywright() {
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
      } else {
        this.showStatus('❌', `Error: ${result.error}`, 'error');
      }
    } catch (error: any) {
      console.error('Auto-fill error:', error);
      this.showStatus('❌', 'Server offline. Start Playwright server.', 'error');
    }
  }

  private openManageAnswers() {
    chrome.tabs.create({ url: chrome.runtime.getURL('manage.html') });
  }

  /**
   * Get human-readable time ago
   */
  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
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
      
      this.currentPlatform = this.platformMatcher.detectPlatform(tab.url);
      
      // Get DOM elements first
      const platformStatusEl = document.getElementById('platformStatus');
      const platformNameEl = document.getElementById('platformName');
      const profileStatusEl = document.getElementById('profileStatus');
      const analyzeBtn = document.getElementById('analyzeBtn') as HTMLButtonElement;
      
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
          } else if (analysisState.status === 'completed') {
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
