/**
 * content.js — Entry-point orchestrator for Keeping Keyboard Shortcuts.
 *
 * Loads enabled state from storage, initialises each module, and wires
 * the toggle callback.  Individual modules attach to window.KeepingShortcuts.
 */
(function () {
  'use strict';

  const KS = window.KeepingShortcuts;

  // Load persisted enabled state (default: true), then boot.
  chrome.storage.local.get({ enabled: true }, (data) => {
    KS.setEnabled(data.enabled);
    KS.init();
    if (KS.modal) KS.modal.init(data.enabled);
    if (KS.hints) KS.hints.init();
  });

  // Listen for toggle changes from the popup / other scripts.
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
      KS.setEnabled(changes.enabled.newValue);
    }
  });
})();
