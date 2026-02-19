/**
 * hints.js — Shift-to-Reveal keyboard hint badges for Keeping.com
 *
 * When the user holds Shift, small keycap badges appear next to the
 * relevant UI controls. Released on Shift keyup.
 *
 * Attaches to window.KeepingShortcuts.hints namespace.
 */
(function () {
  'use strict';

  window.KeepingShortcuts = window.KeepingShortcuts || {};

  // ---------------------------------------------------------------------------
  // Hint definitions: [container selector, hint keys, selector type]
  // ---------------------------------------------------------------------------

  const DROPDOWN_HINTS = [
    { id: 'select-status',      keys: ['o', 'p', 'c', 'd'] },
    { id: 'select-priority',    keys: ['`', '1', '2', '3'] },
    { id: 'select-assigned-to', keys: ['a'] },
    { id: 'select-tag',         keys: ['t'] },
  ];

  const CHEVRON_HINTS = [
    { selector: '.previous-chevron', key: 'k' },
    { selector: '.next-chevron',     key: 'j' },
  ];

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function isInputFocused() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function createHintSpan(key) {
    const span = document.createElement('span');
    span.className = 'ks-hint';
    span.textContent = key;
    return span;
  }

  // ---------------------------------------------------------------------------
  // Inject / Remove hints
  // ---------------------------------------------------------------------------

  function injectHints() {
    // Guard: already injected
    if (document.querySelector('.ks-hint')) return;

    // Dropdown hints
    for (const def of DROPDOWN_HINTS) {
      const container = document.getElementById(def.id);
      if (!container) continue;

      // Find the React Select control element, or fall back to the container's parent
      const control = container.querySelector('[class*="__control"]');
      const target = control ? control.parentElement : container.parentElement;
      if (!target) continue;

      for (const key of def.keys) {
        target.appendChild(createHintSpan(key));
      }
    }

    // Chevron hints
    for (const def of CHEVRON_HINTS) {
      const chevron = document.querySelector(def.selector);
      if (!chevron) continue;

      const target = chevron.parentElement;
      if (!target) continue;

      target.appendChild(createHintSpan(def.key));
    }
  }

  function removeHints() {
    const hints = document.querySelectorAll('.ks-hint');
    for (const hint of hints) {
      hint.remove();
    }
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  function onKeydown(e) {
    if (e.key !== 'Shift') return;
    if (!window.KeepingShortcuts.isEnabled()) return;
    if (isInputFocused()) return;

    injectHints();
  }

  function onKeyup(e) {
    if (e.key !== 'Shift') return;

    removeHints();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  function init() {
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('keyup', onKeyup);
  }

  window.KeepingShortcuts.hints = { init };
})();
