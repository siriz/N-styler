/**
 * N-Styler Content Script
 * Runs on every page and applies stored CSS/JS rules
 */

(function() {
  'use strict';

  const STYLE_ID = 'n-styler-custom-css';
  const SCRIPT_ID = 'n-styler-custom-js';

  /**
   * Get the current page's hostname
   */
  function getCurrentDomain() {
    return window.location.hostname;
  }

  /**
   * Apply CSS styles to the page
   */
  function applyCSS(css) {
    // Remove existing custom styles
    removeCSS();

    if (!css || !css.trim()) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;

    // Insert into head or document
    const target = document.head || document.documentElement;
    target.appendChild(style);
  }

  /**
   * Remove custom CSS from the page
   */
  function removeCSS() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Apply JavaScript to the page
   */
  function applyJS(js) {
    if (!js || !js.trim()) {
      return;
    }

    try {
      // Create a script element to execute the code
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.textContent = `
        (function() {
          try {
            ${js}
          } catch(e) {
            console.error('[N-Styler] Script error:', e);
          }
        })();
      `;

      const target = document.head || document.documentElement;
      target.appendChild(script);

      // Remove script element after execution (code already ran)
      script.remove();
    } catch (error) {
      console.error('[N-Styler] Error applying JS:', error);
    }
  }

  /**
   * Load and apply rules for the current domain
   */
  async function loadAndApplyRules() {
    try {
      const domain = getCurrentDomain();
      const result = await chrome.storage.local.get(['rules']);
      const rules = result.rules || {};
      const domainRules = rules[domain];

      if (domainRules) {
        // Apply CSS
        if (domainRules.css) {
          applyCSS(domainRules.css);
        }

        // Apply JS (only once on initial load)
        if (domainRules.js && !window.__nStylerJsApplied) {
          applyJS(domainRules.js);
          window.__nStylerJsApplied = true;
        }
      }
    } catch (error) {
      console.error('[N-Styler] Error loading rules:', error);
    }
  }

  /**
   * Listen for messages from popup to apply changes
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'applyStyles') {
      // Reset JS applied flag to allow re-applying
      window.__nStylerJsApplied = false;
      loadAndApplyRules();
      sendResponse({ success: true });
    }

    if (message.action === 'getPageResources') {
      const resources = getPageResources();
      sendResponse({ success: true, ...resources });
    }

    if (message.action === 'toggleResource') {
      togglePageResource(message.url, message.type, message.enabled);
      sendResponse({ success: true });
    }

    return true;
  });

  /**
   * Get all CSS and JS resources from the page
   */
  function getPageResources() {
    const cssFiles = [];
    const jsFiles = [];

    // Get all link elements (CSS)
    document.querySelectorAll('link[rel="stylesheet"], link[type="text/css"]').forEach(link => {
      if (link.href) {
        cssFiles.push({
          url: link.href,
          element: 'link',
          disabled: link.disabled
        });
      }
    });

    // Get all style elements with src (rare but possible)
    document.querySelectorAll('style[data-href]').forEach(style => {
      const href = style.getAttribute('data-href');
      if (href) {
        cssFiles.push({
          url: href,
          element: 'style',
          disabled: style.disabled
        });
      }
    });

    // Get all script elements with src
    document.querySelectorAll('script[src]').forEach(script => {
      jsFiles.push({
        url: script.src,
        element: 'script',
        disabled: script.hasAttribute('data-n-styler-disabled')
      });
    });

    return { cssFiles, jsFiles };
  }

  /**
   * Toggle a page resource (enable/disable)
   */
  function togglePageResource(url, type, enabled) {
    if (type === 'css') {
      // Find the link element and toggle it
      const links = document.querySelectorAll('link[rel="stylesheet"], link[type="text/css"]');
      links.forEach(link => {
        if (link.href === url) {
          link.disabled = !enabled;
        }
      });
    } else if (type === 'js') {
      // For JS, we can't really disable already executed scripts
      // But we can mark them and prevent re-execution on page reload
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        if (script.src === url) {
          if (enabled) {
            script.removeAttribute('data-n-styler-disabled');
          } else {
            script.setAttribute('data-n-styler-disabled', 'true');
          }
        }
      });
      
      // Store disabled state for next page load
      storeDisabledScript(url, !enabled);
    }
  }

  /**
   * Store disabled script state
   */
  async function storeDisabledScript(url, disabled) {
    try {
      const domain = getCurrentDomain();
      const result = await chrome.storage.local.get(['disabledResources']);
      const disabledResources = result.disabledResources || {};
      
      if (!disabledResources[domain]) {
        disabledResources[domain] = [];
      }

      const index = disabledResources[domain].indexOf(url);
      
      if (disabled && index === -1) {
        disabledResources[domain].push(url);
      } else if (!disabled && index > -1) {
        disabledResources[domain].splice(index, 1);
      }

      await chrome.storage.local.set({ disabledResources });
    } catch (error) {
      console.error('[N-Styler] Error storing disabled script:', error);
    }
  }

  /**
   * Apply disabled resources on page load
   */
  async function applyDisabledResources() {
    try {
      const domain = getCurrentDomain();
      const result = await chrome.storage.local.get(['disabledResources']);
      const disabledResources = result.disabledResources || {};
      const domainDisabled = disabledResources[domain] || [];

      if (domainDisabled.length === 0) return;

      // Disable CSS files
      document.querySelectorAll('link[rel="stylesheet"], link[type="text/css"]').forEach(link => {
        if (domainDisabled.includes(link.href)) {
          link.disabled = true;
        }
      });
    } catch (error) {
      console.error('[N-Styler] Error applying disabled resources:', error);
    }
  }

  /**
   * Listen for storage changes to apply updates in real-time
   */
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.rules) {
      const domain = getCurrentDomain();
      const newRules = changes.rules.newValue || {};
      const domainRules = newRules[domain];

      if (domainRules) {
        applyCSS(domainRules.css);
      } else {
        removeCSS();
      }
    }
  });

  /**
   * Initialize - apply rules when content script loads
   */
  function init() {
    // Apply disabled resources first
    applyDisabledResources();

    // Apply rules as soon as possible
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        applyDisabledResources();
        loadAndApplyRules();
      });
    } else {
      loadAndApplyRules();
    }
  }

  // Start
  init();
})();
