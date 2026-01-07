/**
 * N-Styler Popup Script
 * Handles popup UI interactions and storage management
 */

class PopupManager {
  constructor() {
    this.currentDomain = null;
    this.currentLang = 'en';
    this.init();
  }

  async init() {
    await this.loadLanguage();
    await this.getCurrentDomain();
    this.bindEvents();
    this.loadCurrentDomainRules();
    this.loadRulesList();
  }

  /**
   * Load saved language preference
   */
  async loadLanguage() {
    try {
      const result = await chrome.storage.local.get(['language']);
      this.currentLang = result.language || 'en';
      document.getElementById('langSelect').value = this.currentLang;
      this.applyLanguage();
    } catch (error) {
      console.error('Error loading language:', error);
    }
  }

  /**
   * Apply language to all UI elements
   */
  applyLanguage() {
    const lang = window.i18n[this.currentLang] || window.i18n.en;

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (lang[key]) {
        el.textContent = lang[key];
      }
    });

    // Update all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (lang[key]) {
        el.placeholder = lang[key];
      }
    });

    // Update HTML lang attribute
    document.documentElement.lang = this.currentLang;
  }

  /**
   * Get translated string
   */
  t(key, replacements = {}) {
    const lang = window.i18n[this.currentLang] || window.i18n.en;
    let text = lang[key] || key;
    
    // Replace placeholders like {domain}
    for (const [k, v] of Object.entries(replacements)) {
      text = text.replace(`{${k}}`, v);
    }
    
    return text;
  }

  /**
   * Get the domain of the current active tab
   */
  async getCurrentDomain() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const url = new URL(tab.url);
        this.currentDomain = url.hostname;
        document.getElementById('currentDomain').textContent = this.currentDomain;
      } else {
        document.getElementById('currentDomain').textContent = this.t('cannotGetDomain');
      }
    } catch (error) {
      console.error('Error getting current domain:', error);
      document.getElementById('currentDomain').textContent = this.t('errorOccurred');
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Language selection
    document.getElementById('langSelect').addEventListener('change', (e) => this.changeLanguage(e.target.value));

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // CSS actions
    document.getElementById('saveCss').addEventListener('click', () => this.saveCSS());
    document.getElementById('clearCss').addEventListener('click', () => this.clearCSS());

    // JS actions
    document.getElementById('saveJs').addEventListener('click', () => this.saveJS());
    document.getElementById('clearJs').addEventListener('click', () => this.clearJS());

    // Resources actions
    document.getElementById('refreshResources').addEventListener('click', () => this.loadPageResources());
  }

  /**
   * Change language
   */
  async changeLanguage(lang) {
    this.currentLang = lang;
    await chrome.storage.local.set({ language: lang });
    this.applyLanguage();
    
    // Re-render dynamic content
    this.loadRulesList();
  }

  /**
   * Switch between tabs
   */
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Refresh rules list when switching to list tab
    if (tabName === 'list') {
      this.loadRulesList();
    }

    // Load resources when switching to resources tab
    if (tabName === 'resources') {
      this.loadPageResources();
    }
  }

  /**
   * Load rules for the current domain
   */
  async loadCurrentDomainRules() {
    if (!this.currentDomain) return;

    try {
      const result = await chrome.storage.local.get(['rules']);
      const rules = result.rules || {};
      const domainRules = rules[this.currentDomain] || {};

      document.getElementById('cssEditor').value = domainRules.css || '';
      document.getElementById('jsEditor').value = domainRules.js || '';
      document.getElementById('cssFiles').value = (domainRules.cssFiles || []).join('\n');
      document.getElementById('jsFiles').value = (domainRules.jsFiles || []).join('\n');
    } catch (error) {
      console.error('Error loading rules:', error);
      this.showStatus(this.t('loadingError'), 'error');
    }
  }

  /**
   * Parse file paths from textarea
   */
  parseFilePaths(text) {
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  /**
   * Save CSS for the current domain
   */
  async saveCSS() {
    if (!this.currentDomain) {
      this.showStatus(this.t('cannotGetDomain'), 'error');
      return;
    }

    const css = document.getElementById('cssEditor').value.trim();
    const cssFiles = this.parseFilePaths(document.getElementById('cssFiles').value);
    await this.saveRule('css', css, 'cssFiles', cssFiles);
  }

  /**
   * Save JS for the current domain
   */
  async saveJS() {
    if (!this.currentDomain) {
      this.showStatus(this.t('cannotGetDomain'), 'error');
      return;
    }

    const js = document.getElementById('jsEditor').value.trim();
    const jsFiles = this.parseFilePaths(document.getElementById('jsFiles').value);
    await this.saveRule('js', js, 'jsFiles', jsFiles);
  }

  /**
   * Save a rule (CSS or JS) for the current domain
   */
  async saveRule(type, content, filesKey, files) {
    try {
      const result = await chrome.storage.local.get(['rules']);
      const rules = result.rules || {};

      if (!rules[this.currentDomain]) {
        rules[this.currentDomain] = {};
      }

      rules[this.currentDomain][type] = content;
      rules[this.currentDomain][filesKey] = files;
      rules[this.currentDomain].updatedAt = new Date().toISOString();

      await chrome.storage.local.set({ rules });

      // Notify background script to apply changes
      await this.notifyContentScript();

      this.showStatus(type === 'css' ? this.t('cssSaved') : this.t('jsSaved'), 'success');
    } catch (error) {
      console.error('Error saving rule:', error);
      this.showStatus(this.t('saveError'), 'error');
    }
  }

  /**
   * Clear CSS for the current domain
   */
  async clearCSS() {
    document.getElementById('cssEditor').value = '';
    document.getElementById('cssFiles').value = '';
    await this.saveRule('css', '', 'cssFiles', []);
    this.showStatus(this.t('cssDeleted'), 'success');
  }

  /**
   * Clear JS for the current domain
   */
  async clearJS() {
    document.getElementById('jsEditor').value = '';
    document.getElementById('jsFiles').value = '';
    await this.saveRule('js', '', 'jsFiles', []);
    this.showStatus(this.t('jsDeleted'), 'success');
  }

  /**
   * Load and display all saved rules
   */
  async loadRulesList() {
    try {
      const result = await chrome.storage.local.get(['rules']);
      const rules = result.rules || {};
      const rulesList = document.getElementById('rulesList');

      const domains = Object.keys(rules);
      if (domains.length === 0) {
        rulesList.innerHTML = `<p class="empty-message">${this.t('noRules')}</p>`;
        return;
      }

      rulesList.innerHTML = domains.map(domain => {
        const rule = rules[domain];
        const hasCSS = (rule.css && rule.css.trim().length > 0) || (rule.cssFiles && rule.cssFiles.length > 0);
        const hasJS = (rule.js && rule.js.trim().length > 0) || (rule.jsFiles && rule.jsFiles.length > 0);
        const cssFileCount = rule.cssFiles ? rule.cssFiles.length : 0;
        const jsFileCount = rule.jsFiles ? rule.jsFiles.length : 0;
        const filesText = this.t('files');

        return `
          <div class="rule-item" data-domain="${domain}">
            <div class="rule-info">
              <div class="rule-domain">${domain}</div>
              <div class="rule-meta">
                <span>${hasCSS ? '✓ CSS' : '✗ CSS'}${cssFileCount ? ` (${cssFileCount} ${filesText})` : ''}</span>
                <span>${hasJS ? '✓ JS' : '✗ JS'}${jsFileCount ? ` (${jsFileCount} ${filesText})` : ''}</span>
              </div>
            </div>
            <div class="rule-actions">
              <button class="btn btn-secondary edit-rule" data-domain="${domain}">${this.t('edit')}</button>
              <button class="btn btn-danger delete-rule" data-domain="${domain}">${this.t('delete')}</button>
            </div>
          </div>
        `;
      }).join('');

      // Bind edit and delete events
      rulesList.querySelectorAll('.edit-rule').forEach(btn => {
        btn.addEventListener('click', (e) => this.editRule(e.target.dataset.domain));
      });

      rulesList.querySelectorAll('.delete-rule').forEach(btn => {
        btn.addEventListener('click', (e) => this.deleteRule(e.target.dataset.domain));
      });
    } catch (error) {
      console.error('Error loading rules list:', error);
    }
  }

  /**
   * Edit a specific domain's rules
   */
  async editRule(domain) {
    try {
      const result = await chrome.storage.local.get(['rules']);
      const rules = result.rules || {};
      const rule = rules[domain] || {};

      document.getElementById('cssEditor').value = rule.css || '';
      document.getElementById('jsEditor').value = rule.js || '';
      document.getElementById('cssFiles').value = (rule.cssFiles || []).join('\n');
      document.getElementById('jsFiles').value = (rule.jsFiles || []).join('\n');

      // Update current domain display temporarily
      this.currentDomain = domain;
      document.getElementById('currentDomain').textContent = `${domain} (${this.t('editing')})`;

      // Switch to CSS tab
      this.switchTab('css');
    } catch (error) {
      console.error('Error editing rule:', error);
    }
  }

  /**
   * Delete a domain's rules
   */
  async deleteRule(domain) {
    if (!confirm(this.t('confirmDelete', { domain }))) {
      return;
    }

    try {
      const result = await chrome.storage.local.get(['rules']);
      const rules = result.rules || {};

      delete rules[domain];
      await chrome.storage.local.set({ rules });

      this.loadRulesList();
      this.showStatus(this.t('ruleDeleted'), 'success');
    } catch (error) {
      console.error('Error deleting rule:', error);
      this.showStatus(this.t('saveError'), 'error');
    }
  }

  /**
   * Notify content script to apply changes
   */
  async notifyContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        await chrome.tabs.sendMessage(tab.id, { action: 'applyStyles' });
      }
    } catch (error) {
      console.log('Content script not available, page refresh may be needed.');
    }
  }

  /**
   * Load page resources (CSS/JS files)
   */
  async loadPageResources() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        this.showResourcesError(this.t('cannotGetTab'));
        return;
      }

      // Check if it's a valid URL
      if (!tab.url || (!tab.url.startsWith('http://') && !tab.url.startsWith('https://'))) {
        this.showResourcesError(this.t('pageNotSupported'));
        return;
      }

      // Get disabled resources from storage
      const storageResult = await chrome.storage.local.get(['disabledResources']);
      const disabledResources = storageResult.disabledResources || {};
      const domainDisabled = disabledResources[this.currentDomain] || [];

      // Use chrome.scripting.executeScript to get CSS resources directly
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const cssFiles = [];

          // Get all link elements (CSS)
          document.querySelectorAll('link[rel="stylesheet"], link[type="text/css"]').forEach(link => {
            if (link.href) {
              cssFiles.push({
                url: link.href,
                disabled: link.disabled
              });
            }
          });

          return { cssFiles };
        }
      });

      if (results && results[0] && results[0].result) {
        const { cssFiles } = results[0].result;
        this.renderResources('css', cssFiles, domainDisabled);
      } else {
        this.showResourcesError(this.t('cannotGetResources'));
      }
    } catch (error) {
      console.error('Error loading page resources:', error);
      this.showResourcesError(this.t('checkPermissions'));
    }
  }

  /**
   * Render resources list (CSS only)
   */
  renderResources(type, files, disabledList) {
    const container = document.getElementById(`${type}Resources`);
    const countSpan = document.getElementById(`${type}Count`);
    
    countSpan.textContent = `(${files.length})`;

    if (files.length === 0) {
      container.innerHTML = `<p class="empty-message">${this.t('noCssFiles')}</p>`;
      return;
    }

    container.innerHTML = files.map((file, index) => {
      const isDisabled = disabledList.includes(file.url);
      const fileName = this.getFileName(file.url);
      
      return `
        <div class="resource-item ${isDisabled ? 'disabled' : ''}" data-url="${file.url}" data-type="${type}">
          <input type="checkbox" class="resource-toggle" ${!isDisabled ? 'checked' : ''} data-url="${file.url}" data-type="${type}">
          <span class="resource-name" title="${file.url}">${fileName}</span>
          <span class="resource-type ${type}">${type.toUpperCase()}</span>
        </div>
      `;
    }).join('');

    // Bind toggle events
    container.querySelectorAll('.resource-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => this.toggleResource(e.target));
    });
  }

  /**
   * Get file name from URL
   */
  getFileName(url) {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const fileName = path.split('/').pop() || path;
      return fileName || url;
    } catch {
      return url;
    }
  }

  /**
   * Toggle resource enabled/disabled
   */
  async toggleResource(toggle) {
    const url = toggle.dataset.url;
    const type = toggle.dataset.type;
    const isEnabled = toggle.checked;

    try {
      // Update storage
      const result = await chrome.storage.local.get(['disabledResources']);
      const disabledResources = result.disabledResources || {};
      
      if (!disabledResources[this.currentDomain]) {
        disabledResources[this.currentDomain] = [];
      }

      const domainDisabled = disabledResources[this.currentDomain];
      const index = domainDisabled.indexOf(url);

      if (isEnabled && index > -1) {
        // Remove from disabled list
        domainDisabled.splice(index, 1);
      } else if (!isEnabled && index === -1) {
        // Add to disabled list
        domainDisabled.push(url);
      }

      await chrome.storage.local.set({ disabledResources });

      // Update UI
      const resourceItem = toggle.closest('.resource-item');
      resourceItem.classList.toggle('disabled', !isEnabled);

      // Use chrome.scripting.executeScript to toggle the resource directly
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        if (type === 'css') {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (resourceUrl, enabled) => {
              document.querySelectorAll('link[rel="stylesheet"], link[type="text/css"]').forEach(link => {
                if (link.href === resourceUrl) {
                  link.disabled = !enabled;
                }
              });
            },
            args: [url, isEnabled]
          });
        }
        // Note: JS cannot be truly disabled after execution
      }

      this.showStatus(isEnabled ? this.t('cssEnabled') : this.t('cssDisabled'), 'success');
    } catch (error) {
      console.error('Error toggling resource:', error);
      this.showStatus(this.t('saveError'), 'error');
    }
  }

  /**
   * Show error in resources section
   */
  showResourcesError(message) {
    document.getElementById('cssResources').innerHTML = `<p class="empty-message">${message}</p>`;
    document.getElementById('cssCount').textContent = '(0)';
  }

  /**
   * Show status message
   */
  showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;

    setTimeout(() => {
      status.className = 'status';
    }, 3000);
  }
}

// Initialize popup manager
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
