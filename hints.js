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

  // --- Ticket detail view hints ---
  const DETAIL_DROPDOWN_HINTS = [
    { id: 'select-status',      keys: ['o', 'p', 'c', 'd'] },
    { id: 'select-priority',    keys: ['`', '1', '2', '3'] },
    { id: 'select-assigned-to', keys: ['a'] },
    { id: 'select-tag',         keys: ['t'] },
  ];

  const CHEVRON_HINTS = [
    { selector: '.previous-chevron', key: 'k' },
    { selector: '.next-chevron',     key: 'j' },
  ];

  const BUTTON_HINTS = [
    { selector: 'img[src*="mailbox-reply"]', key: 'r' },
  ];

  // --- Inbox list view hints ---
  const INBOX_DROPDOWN_HINTS = [
    { id: 'inbox-select-set-status',   keys: ['o', 'p', 'c', 'd'] },
    { id: 'inbox-select-set-priority', keys: ['`', '1', '2', '3'] },
    { id: 'inbox-select-assign-agent', keys: ['a'] },
    { id: 'inbox-select-set-tag',      keys: ['t'] },
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

  /**
   * Walk up from the React Select container to find the nearest preceding
   * label-like element (the text that says "Assigned to", "Status", etc.)
   * and return it so we can append hints inline with the label.
   */
  function findLabelFor(container) {
    // The typical Keeping layout is:
    //   <wrapper>
    //     <label text>          ← we want this
    //     <react-select div>    ← container lives here
    //   </wrapper>
    // Walk up to the container's nearest block parent, then look for a
    // preceding sibling or child that holds the label text.
    const parent = container.closest('[class]')?.parentElement;
    if (!parent) return null;

    // Look for a previous sibling of the container (or its wrapper) that
    // looks like a label — it won't be an input/select element.
    let node = container;
    while (node && node !== parent) {
      if (node.previousElementSibling) {
        return node.previousElementSibling;
      }
      node = node.parentElement;
    }
    return null;
  }

  function injectHints() {
    // Guard: already injected
    if (document.querySelector('.ks-hint')) return;

    const onInbox = window.KeepingShortcuts.isInboxList && window.KeepingShortcuts.isInboxList();

    if (onInbox) {
      injectInboxHints();
    } else {
      injectDetailHints();
    }
  }

  function injectDetailHints() {
    // Dropdown hints — place next to the label, not the dropdown control
    for (const def of DETAIL_DROPDOWN_HINTS) {
      const container = document.getElementById(def.id);
      if (!container) continue;

      const label = findLabelFor(container);
      const target = label || container.parentElement;
      if (!target) continue;

      const hintGroup = document.createElement('span');
      hintGroup.className = 'ks-hint-group';
      for (const key of def.keys) {
        hintGroup.appendChild(createHintSpan(key));
      }
      target.appendChild(hintGroup);
    }

    // Chevron hints
    for (const def of CHEVRON_HINTS) {
      const chevron = document.querySelector(def.selector);
      if (!chevron) continue;
      const wrapper = chevron.closest('div[class*="cursor-pointer"]') || chevron.parentElement;
      if (!wrapper) continue;
      const hint = createHintSpan(def.key);
      wrapper.insertAdjacentElement('afterend', hint);
    }

    // Button hints
    for (const def of BUTTON_HINTS) {
      const img = document.querySelector(def.selector);
      if (!img) continue;
      const btn = img.closest('button');
      if (!btn) continue;
      const hint = createHintSpan(def.key);
      btn.appendChild(hint);
    }
  }

  function injectInboxHints() {
    // Inbox toolbar dropdown hints
    for (const def of INBOX_DROPDOWN_HINTS) {
      const container = document.getElementById(def.id);
      if (!container) continue;

      const hintGroup = document.createElement('span');
      hintGroup.className = 'ks-hint-group';
      for (const key of def.keys) {
        hintGroup.appendChild(createHintSpan(key));
      }
      // Place after the dropdown control
      const control = container.querySelector('[class*="__control"]');
      if (control) {
        control.insertAdjacentElement('afterend', hintGroup);
      }
    }
  }

  function removeHints() {
    const hints = document.querySelectorAll('.ks-hint, .ks-hint-group');
    for (const el of hints) {
      el.remove();
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
