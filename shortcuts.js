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
  let activeIndex = -1; // currently highlighted inbox item (-1 = none)

  // ---------------------------------------------------------------------------
  // View detection
  // ---------------------------------------------------------------------------

  function isInboxList() {
    // Inbox list: hash is empty, just "?params", or starts with "/?params"
    // Ticket detail: hash contains a conversation ID like "#/abc123?..."
    const hash = window.location.hash;
    if (!hash || hash === '#' || hash === '#/') return true;
    // Strip leading "#/" then check if remainder starts with "?" or is empty
    const path = hash.replace(/^#\/?/, '');
    return !path || path.startsWith('?');
  }

  // ---------------------------------------------------------------------------
  // Inbox active item management
  // ---------------------------------------------------------------------------

  function getConversationItems() {
    return Array.from(document.querySelectorAll('.conversation-list-item'));
  }

  function clearActive() {
    const prev = document.querySelector('.conversation-list-item.ks-active');
    if (prev) prev.classList.remove('ks-active');
  }

  function setActiveIndex(idx) {
    const items = getConversationItems();
    if (items.length === 0) return;
    clearActive();
    activeIndex = Math.max(0, Math.min(idx, items.length - 1));
    const item = items[activeIndex];
    item.classList.add('ks-active');
    item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function resetActive() {
    clearActive();
    activeIndex = -1;
  }

  // Reset active state on view change
  window.addEventListener('hashchange', resetActive);

  // ---------------------------------------------------------------------------
  // Inbox action helpers
  // ---------------------------------------------------------------------------

  function getActiveItem() {
    const items = getConversationItems();
    if (activeIndex < 0 || activeIndex >= items.length) return null;
    return items[activeIndex];
  }

  function isItemChecked(item) {
    const cb = item.querySelector('.conversation-checkbox');
    if (!cb) return false;
    const tick = cb.querySelector('.Tick');
    return tick && !tick.classList.contains('hidden');
  }

  function toggleItemCheckbox(item) {
    const cb = item.querySelector('.conversation-checkbox');
    if (cb) cb.click();
  }

  function anyItemsChecked() {
    return getConversationItems().some(isItemChecked);
  }

  /**
   * Apply an action via the inbox toolbar dropdown.
   * If no items are manually checked, temporarily check the active item,
   * perform the action, then uncheck it.
   */
  function inboxToolbarAction(selectId, optionText) {
    const active = getActiveItem();
    if (!active) return;

    const hadChecked = anyItemsChecked();
    const wasChecked = active ? isItemChecked(active) : false;

    // Ensure the active item is checked
    if (!wasChecked) {
      toggleItemCheckbox(active);
    }

    // Use the inbox toolbar dropdown
    setTimeout(() => {
      setInboxSelectValue(selectId, optionText);

      // If we temporarily checked it and no others were checked, uncheck after action
      if (!hadChecked && !wasChecked) {
        setTimeout(() => {
          if (isItemChecked(active)) toggleItemCheckbox(active);
        }, 300);
      }
    }, 50);
  }

  function setInboxSelectValue(selectId, optionText) {
    const container = document.querySelector(`#${selectId}`);
    if (!container) return;
    const control = container.querySelector('[class*="__control"]');
    if (!control) return;
    control.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    setTimeout(() => {
      const menu = container.querySelector('[class*="__menu"]');
      if (!menu) return;
      const options = menu.querySelectorAll('[class*="__option"]');
      for (const opt of options) {
        if (opt.textContent.trim() === optionText) {
          opt.click();
          setTimeout(() => {
            if (document.activeElement) document.activeElement.blur();
          }, 50);
          return;
        }
      }
    }, 50);
  }

  function openReactSelectInboxDropdown(selectId) {
    const container = document.querySelector(`#${selectId}`);
    if (!container) return;
    const control = container.querySelector('[class*="__control"]');
    if (!control) return;

    const active = getActiveItem();
    if (active) {
      const hadChecked = anyItemsChecked();
      const wasChecked = active ? isItemChecked(active) : false;
      if (!wasChecked) toggleItemCheckbox(active);
    }

    control.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    setTimeout(() => {
      const input = container.querySelector('input');
      if (input) input.focus();
    }, 50);
  }

  // ---------------------------------------------------------------------------
  // Sidebar view cycling
  // ---------------------------------------------------------------------------

  function getSidebarLinks() {
    // The sidebar nav links are <a> tags inside the sidebar nav
    const nav = document.querySelector('nav[aria-label="Sidebar"]');
    if (!nav) return [];
    return Array.from(nav.querySelectorAll('a[href^="#/"]'));
  }

  function getCurrentSidebarIndex() {
    const links = getSidebarLinks();
    for (let i = 0; i < links.length; i++) {
      // Active item has font-semibold on its inner div
      const inner = links[i].querySelector('div.font-semibold');
      if (inner) return i;
    }
    return -1;
  }

  function cycleSidebar(direction) {
    const links = getSidebarLinks();
    if (links.length === 0) return;
    let idx = getCurrentSidebarIndex();
    if (idx < 0) idx = 0;
    else idx += direction;
    // Clamp to bounds
    idx = Math.max(0, Math.min(idx, links.length - 1));
    links[idx].click();
  }

  // ---------------------------------------------------------------------------
  // Inbox status mapping (toolbar uses different labels)
  // ---------------------------------------------------------------------------

  const INBOX_STATUS_MAP = {
    o: 'Open',
    p: 'Pending',
    c: 'Closed',
    d: 'Discard',
  };

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

  function canGoPrev() {
    const img = document.querySelector('.previous-chevron');
    return img && img.closest('div[class*="cursor-pointer"]') !== null;
  }

  function goBackToInbox() {
    const backArrow = document.querySelector('.back-arrow');
    if (backArrow) backArrow.click();
  }

  function advanceOrReturn() {
    if (canGoPrev()) {
      clickPrevChevron();
    } else {
      goBackToInbox();
    }
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
  // Keydown handler — inbox list view
  // ---------------------------------------------------------------------------

  function onKeydownInbox(e) {
    const key = e.key.toLowerCase();

    // Navigation: j / ArrowDown
    if (key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIndex < 0) {
        setActiveIndex(0);
      } else {
        setActiveIndex(activeIndex + 1);
      }
      return;
    }

    // Navigation: k / ArrowUp
    if (key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex < 0) {
        setActiveIndex(0);
      } else {
        setActiveIndex(activeIndex - 1);
      }
      return;
    }

    // Toggle selection: x
    if (key === 'x') {
      e.preventDefault();
      const item = getActiveItem();
      if (item) toggleItemCheckbox(item);
      return;
    }

    // Open conversation: Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      const item = getActiveItem();
      if (!item) return;
      const link = item.closest('a');
      if (link) link.click();
      return;
    }

    // Sidebar cycling: Shift+V up, v down
    if (e.shiftKey && key === 'v') {
      e.preventDefault();
      cycleSidebar(-1);
      return;
    }

    // Shift + status key → set status (no "advance" on inbox)
    if (e.shiftKey && INBOX_STATUS_MAP[key]) {
      e.preventDefault();
      inboxToolbarAction('inbox-select-set-status', INBOX_STATUS_MAP[key]);
      return;
    }

    if (e.shiftKey) return;

    // Sidebar cycling: v down
    if (key === 'v') {
      e.preventDefault();
      cycleSidebar(1);
      return;
    }

    // Status
    if (INBOX_STATUS_MAP[key]) {
      e.preventDefault();
      inboxToolbarAction('inbox-select-set-status', INBOX_STATUS_MAP[key]);
      return;
    }

    // Priority
    if (PRIORITY_MAP[e.key]) {
      e.preventDefault();
      inboxToolbarAction('inbox-select-set-priority', PRIORITY_MAP[e.key]);
      return;
    }

    // Assign
    if (key === 'a') {
      e.preventDefault();
      openReactSelectInboxDropdown('inbox-select-assign-agent');
      return;
    }

    // Tag
    if (key === 't') {
      e.preventDefault();
      openReactSelectInboxDropdown('inbox-select-set-tag');
      return;
    }

    // Reply → open the ticket
    if (key === 'r') {
      e.preventDefault();
      const item = getActiveItem();
      if (!item) return;
      const link = item.closest('a');
      if (link) link.click();
      return;
    }
  }

  // ---------------------------------------------------------------------------
  // Keydown handler — ticket detail view
  // ---------------------------------------------------------------------------

  function onKeydownDetail(e) {
    const key = e.key.toLowerCase();

    // Sidebar cycling: Shift+V up
    if (e.shiftKey && key === 'v') {
      e.preventDefault();
      cycleSidebar(-1);
      return;
    }

    // Shift + status key → set status then advance
    if (e.shiftKey && STATUS_MAP[key]) {
      e.preventDefault();
      setReactSelectValue('select-status', STATUS_MAP[key]);
      if (key === 'd') {
        confirmDiscardModal(advanceOrReturn);
      } else {
        setTimeout(advanceOrReturn, 200);
      }
      return;
    }

    if (e.shiftKey) return;

    // Sidebar cycling: v down
    if (key === 'v') {
      e.preventDefault();
      cycleSidebar(1);
      return;
    }

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

    // Reply
    if (key === 'r') {
      e.preventDefault();
      const replyBtn = document.querySelector('img[src*="mailbox-reply"]');
      if (replyBtn) replyBtn.closest('button').click();
      return;
    }
  }

  // ---------------------------------------------------------------------------
  // Keydown handler — main dispatcher
  // ---------------------------------------------------------------------------

  function onKeydown(e) {
    if (!enabled) return;

    // Escape blurs any focused input (e.g. assign/tag dropdowns)
    if (e.key === 'Escape' && isInputFocused()) {
      e.preventDefault();
      document.activeElement.blur();
      return;
    }

    // Notes textarea: Cmd/Ctrl+Enter submits (clicks send), plain Enter is a line break
    if (e.key === 'Enter' && document.activeElement.id === 'keeping-notes-input') {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        const sendBtn = document.querySelector('#inbox-notes img[src*="send"]');
        if (sendBtn) sendBtn.click();
      }
      // Plain Enter: let browser insert line break (do nothing)
      return;
    }

    // Double Enter blurs: first Enter selects the option (React Select handles it),
    // second Enter (when dropdown menu is already closed) blurs the input.
    // Only applies to React Select inputs — other inputs (search, etc.) handle Enter normally.
    if (e.key === 'Enter' && isInputFocused()) {
      const select = document.activeElement.closest('[class*="__control"], [id^="select-"], [id^="inbox-select-"]');
      if (select) {
        const container = select.closest('[id^="select-"], [id^="inbox-select-"]') || select;
        const menu = container.querySelector('[class*="__menu"]');
        if (!menu) {
          e.preventDefault();
          document.activeElement.blur();
        }
      }
      return;
    }

    if (isInputFocused()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (isInboxList()) {
      onKeydownInbox(e);
    } else {
      onKeydownDetail(e);
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
  window.KeepingShortcuts.isInboxList = isInboxList;
})();
