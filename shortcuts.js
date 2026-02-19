/**
 * shortcuts.js — Keyboard shortcut logic for Keeping.com
 *
 * Attaches to window.KeepingShortcuts namespace.
 * Exposes init() and setEnabled(bool).
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Namespace
  // ---------------------------------------------------------------------------
  window.KeepingShortcuts = window.KeepingShortcuts || {};

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let enabled = true;

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

  function clickNextChevron() {
    const img = document.querySelector('.next-chevron');
    if (img) img.closest('div[class*="cursor-pointer"]')?.click();
  }

  function clickPrevChevron() {
    const img = document.querySelector('.previous-chevron');
    if (img) img.closest('div[class*="cursor-pointer"]')?.click();
  }

  function setReactSelectValue(selectId, optionText) {
    const container = document.querySelector(`#${selectId}`);
    if (!container) return;

    // Click the control to open the dropdown
    const control = container.querySelector('[class*="__control"]');
    if (!control) return;
    control.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    // Wait for menu to render, then click the matching option
    setTimeout(() => {
      const menu = container.querySelector('[class*="__menu"]');
      if (!menu) return;
      const options = menu.querySelectorAll('[class*="__option"]');
      for (const opt of options) {
        if (opt.textContent.trim() === optionText) {
          opt.click();
          // Blur focus so subsequent keyboard shortcuts still work
          setTimeout(() => {
            if (document.activeElement) document.activeElement.blur();
          }, 50);
          return;
        }
      }
    }, 50);
  }

  function confirmDiscardModal(onConfirm) {
    // Wait for the discard confirmation modal to appear, then click "Discard Ticket"
    // Delay start since the modal appears after the dropdown status change completes
    setTimeout(() => {
      const maxAttempts = 20;
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const btns = document.querySelectorAll('button.bg-grapefruit');
        for (const btn of btns) {
          if (btn.textContent.trim() === 'Discard Ticket') {
            clearInterval(interval);
            btn.click();
            if (onConfirm) setTimeout(onConfirm, 200);
            return;
          }
        }
        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 150);
    }, 300);
  }

  function openReactSelectDropdown(selectId) {
    const container = document.querySelector(`#${selectId}`);
    if (!container) return;
    const control = container.querySelector('[class*="__control"]');
    if (!control) return;
    control.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    // Focus the input so the user can start typing
    setTimeout(() => {
      const input = container.querySelector('input');
      if (input) input.focus();
    }, 50);
  }

  // ---------------------------------------------------------------------------
  // Shortcut maps
  // ---------------------------------------------------------------------------

  const STATUS_MAP = {
    o: 'Open',
    p: 'Pending',
    c: 'Closed',
    d: 'Discard',
  };

  const PRIORITY_MAP = {
    '`': 'None',
    1: 'Low',
    2: 'Mid',
    3: 'High',
  };

  // ---------------------------------------------------------------------------
  // Keydown handler
  // ---------------------------------------------------------------------------

  function onKeydown(e) {
    if (!enabled) return;
    if (isInputFocused()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key.toLowerCase();

    // Shift + status key → set status then advance
    if (e.shiftKey && STATUS_MAP[key]) {
      e.preventDefault();
      setReactSelectValue('select-status', STATUS_MAP[key]);
      if (key === 'd') {
        confirmDiscardModal(clickPrevChevron);
      } else {
        setTimeout(clickPrevChevron, 200);
      }
      return;
    }

    if (e.shiftKey) return;

    // Navigation
    if (key === 'j') {
      e.preventDefault();
      clickNextChevron();
      return;
    }
    if (key === 'k') {
      e.preventDefault();
      clickPrevChevron();
      return;
    }

    // Status
    if (STATUS_MAP[key]) {
      e.preventDefault();
      setReactSelectValue('select-status', STATUS_MAP[key]);
      if (key === 'd') {
        confirmDiscardModal();
      }
      return;
    }

    // Priority
    if (PRIORITY_MAP[e.key]) {
      e.preventDefault();
      setReactSelectValue('select-priority', PRIORITY_MAP[e.key]);
      return;
    }

    // Assign
    if (key === 'a') {
      e.preventDefault();
      openReactSelectDropdown('select-assigned-to');
      return;
    }

    // Tag
    if (key === 't') {
      e.preventDefault();
      openReactSelectDropdown('select-tag');
      return;
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  function init() {
    document.addEventListener('keydown', onKeydown);
  }

  function setEnabled(value) {
    enabled = !!value;
  }

  function isEnabled() {
    return enabled;
  }

  window.KeepingShortcuts.init = init;
  window.KeepingShortcuts.setEnabled = setEnabled;
  window.KeepingShortcuts.isEnabled = isEnabled;
})();
