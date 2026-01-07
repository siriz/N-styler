/**
 * N-Styler Background Service Worker
 * Handles tab navigation events and applies styles/scripts
 */

/**
 * Listen for tab updates (URL changes)
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only react when the page has completed loading
  if (changeInfo.status === 'complete' && tab.url) {
    await applyRulesToTab(tabId, tab.url);
  }
});

/**
 * Listen for tab activation (switching tabs)
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      await applyRulesToTab(activeInfo.tabId, tab.url);
    }
  } catch (error) {
    console.error('Error on tab activation:', error);
  }
});

/**
 * Listen for messages from popup or content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getRules') {
    handleGetRules(message.domain).then(sendResponse);
    return true; // Keep message channel open for async response
  }

  if (message.action === 'reloadStyles') {
    handleReloadStyles(sender.tab?.id);
    sendResponse({ success: true });
  }
});

/**
 * Apply rules to a specific tab
 */
async function applyRulesToTab(tabId, url) {
  try {
    // Skip chrome:// and other restricted URLs
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return;
    }

    const domain = new URL(url).hostname;
    const rules = await getRulesForDomain(domain);

    if (!rules) {
      return;
    }

    // Load and apply external CSS files
    if (rules.cssFiles && rules.cssFiles.length > 0) {
      for (const filePath of rules.cssFiles) {
        try {
          const cssContent = await readLocalFile(filePath);
          if (cssContent) {
            await chrome.scripting.insertCSS({
              target: { tabId },
              css: cssContent
            });
          }
        } catch (error) {
          console.error(`Error loading CSS file ${filePath}:`, error);
        }
      }
    }

    // Apply inline CSS if exists
    if (rules.css && rules.css.trim()) {
      await chrome.scripting.insertCSS({
        target: { tabId },
        css: rules.css
      });
    }

    // Load and apply external JS files
    if (rules.jsFiles && rules.jsFiles.length > 0) {
      for (const filePath of rules.jsFiles) {
        try {
          const jsContent = await readLocalFile(filePath);
          if (jsContent) {
            await chrome.scripting.executeScript({
              target: { tabId },
              func: executeUserScript,
              args: [jsContent]
            });
          }
        } catch (error) {
          console.error(`Error loading JS file ${filePath}:`, error);
        }
      }
    }

    // Apply inline JS if exists
    if (rules.js && rules.js.trim()) {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: executeUserScript,
        args: [rules.js]
      });
    }
  } catch (error) {
    console.error('Error applying rules to tab:', error);
  }
}

/**
 * Read a local file using fetch with file:// protocol
 */
async function readLocalFile(filePath) {
  try {
    // Normalize path for file:// URL
    let normalizedPath = filePath.replace(/\\/g, '/');
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }
    
    const fileUrl = 'file://' + normalizedPath;
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Get rules for a specific domain
 */
async function getRulesForDomain(domain) {
  try {
    const result = await chrome.storage.local.get(['rules']);
    const rules = result.rules || {};
    return rules[domain] || null;
  } catch (error) {
    console.error('Error getting rules:', error);
    return null;
  }
}

/**
 * Handle get rules request from content script
 */
async function handleGetRules(domain) {
  const rules = await getRulesForDomain(domain);
  return { rules };
}

/**
 * Handle reload styles request
 */
async function handleReloadStyles(tabId) {
  if (!tabId) return;

  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url) {
      await applyRulesToTab(tabId, tab.url);
    }
  } catch (error) {
    console.error('Error reloading styles:', error);
  }
}

/**
 * Execute user script in page context
 * This function is injected into the page
 */
function executeUserScript(script) {
  try {
    // Create a function from the script and execute it
    const fn = new Function(script);
    fn();
  } catch (error) {
    console.error('[N-Styler] Error executing user script:', error);
  }
}

/**
 * Installation event - initialize storage if needed
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Initialize with empty rules
    await chrome.storage.local.set({ rules: {} });
    console.log('N-Styler installed successfully');
  }
});
