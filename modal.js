/**
 * modal.js — Helper button + shortcut reference modal for Keeping Shortcuts.
 *
 * Attaches to window.KeepingShortcuts.modal namespace.
 * Exposes init(initialEnabled) which sets up a MutationObserver to inject the
 * helper button next to the Keeping "Help" button, and builds the modal UI.
 */
(function () {
  'use strict';

  const KS = window.KeepingShortcuts = window.KeepingShortcuts || {};

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let currentEnabled = true;
  let overlayEl = null;

  // ---------------------------------------------------------------------------
  // Keyboard SVG icon (16x16) — built via DOM API
  // ---------------------------------------------------------------------------
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function createKeyboardIcon() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', '2');
    rect.setAttribute('y', '4');
    rect.setAttribute('width', '20');
    rect.setAttribute('height', '16');
    rect.setAttribute('rx', '2');
    svg.appendChild(rect);

    // Key dots — rows of 4 at y=8 and y=12
    const dotPositions = [
      [6, 8], [10, 8], [14, 8], [18, 8],
      [6, 12], [10, 12], [14, 12], [18, 12],
    ];
    for (const [x, y] of dotPositions) {
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', String(x));
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x));
      line.setAttribute('y2', String(y));
      svg.appendChild(line);
    }

    // Spacebar
    const spacebar = document.createElementNS(SVG_NS, 'line');
    spacebar.setAttribute('x1', '8');
    spacebar.setAttribute('y1', '16');
    spacebar.setAttribute('x2', '16');
    spacebar.setAttribute('y2', '16');
    svg.appendChild(spacebar);

    return svg;
  }

  // ---------------------------------------------------------------------------
  // Shortcut reference data
  // ---------------------------------------------------------------------------
  const SECTIONS = [
    {
      title: 'Navigation',
      rows: [
        { key: 'j', action: 'Next ticket' },
        { key: 'k', action: 'Previous ticket' },
      ],
    },
    {
      title: 'Status',
      rows: [
        { key: 'o', action: 'Open' },
        { key: 'p', action: 'Pending' },
        { key: 'c', action: 'Closed' },
        { key: 'd', action: 'Discard' },
      ],
    },
    {
      title: 'Priority',
      rows: [
        { key: '`', action: 'None' },
        { key: '1', action: 'Low' },
        { key: '2', action: 'Medium' },
        { key: '3', action: 'High' },
      ],
    },
    {
      title: 'Other',
      rows: [
        { key: 'a', action: 'Assign' },
        { key: 't', action: 'Tag' },
        { key: 'r', action: 'Reply' },
        { key: 'Esc', action: 'Close dropdown' },
        { key: '↵↵', action: 'Select & close dropdown' },
      ],
    },
  ];

  // ---------------------------------------------------------------------------
  // DOM builders
  // ---------------------------------------------------------------------------

  function createHelperButton() {
    const btn = document.createElement('button');
    // Use Keeping's own Tailwind classes for a native look, plus our class for extras
    btn.className = 'ks-helper-btn rounded bg-light-blue py-1 px-2 inline-flex items-center justify-center mr-2 h-7';
    btn.appendChild(createKeyboardIcon());
    const label = document.createTextNode(' Shortcuts');
    btn.appendChild(label);
    btn.addEventListener('click', openModal);
    return btn;
  }

  function buildRow(key, action) {
    const row = document.createElement('div');
    row.className = 'ks-row';

    const keySpan = document.createElement('span');
    keySpan.className = 'ks-key';
    keySpan.textContent = key;

    const actionSpan = document.createElement('span');
    actionSpan.className = 'ks-action';
    actionSpan.textContent = action;

    row.appendChild(keySpan);
    row.appendChild(actionSpan);
    return row;
  }

  function buildSection(section) {
    const el = document.createElement('div');
    el.className = 'ks-section';

    const title = document.createElement('div');
    title.className = 'ks-section-title';
    title.textContent = section.title;
    el.appendChild(title);

    for (const row of section.rows) {
      el.appendChild(buildRow(row.key, row.action));
    }
    return el;
  }

  function buildModal() {
    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'ks-overlay';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    // Modal card
    const modal = document.createElement('div');
    modal.className = 'ks-modal';

    // Header
    const header = document.createElement('div');
    header.className = 'ks-modal-header';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'ks-modal-title';
    titleSpan.textContent = 'Keyboard Shortcuts';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ks-modal-close';
    closeBtn.textContent = '\u00d7';
    closeBtn.addEventListener('click', closeModal);

    header.appendChild(titleSpan);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Toggle row
    const toggleRow = document.createElement('div');
    toggleRow.className = 'ks-toggle-row';

    const toggleLabel = document.createElement('span');
    toggleLabel.className = 'ks-toggle-label';
    toggleLabel.textContent = 'Shortcuts enabled';

    const toggle = document.createElement('label');
    toggle.className = 'ks-toggle';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = currentEnabled;
    checkbox.addEventListener('change', function () {
      var newValue = checkbox.checked;
      currentEnabled = newValue;
      chrome.storage.local.set({ enabled: newValue });
      KS.setEnabled(newValue);
    });

    const slider = document.createElement('span');
    slider.className = 'ks-toggle-slider';

    toggle.appendChild(checkbox);
    toggle.appendChild(slider);
    toggleRow.appendChild(toggleLabel);
    toggleRow.appendChild(toggle);
    modal.appendChild(toggleRow);

    // Shortcut sections
    for (const section of SECTIONS) {
      modal.appendChild(buildSection(section));
    }

    // Footer note
    const note = document.createElement('div');
    note.className = 'ks-note';
    note.textContent = 'Hold shift + status key to set and go back';
    modal.appendChild(note);

    overlay.appendChild(modal);
    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Open / Close
  // ---------------------------------------------------------------------------

  function openModal() {
    if (overlayEl) return;
    overlayEl = buildModal();
    document.body.appendChild(overlayEl);
    document.addEventListener('keydown', onEscape);
  }

  function closeModal() {
    if (!overlayEl) return;
    overlayEl.remove();
    overlayEl = null;
    document.removeEventListener('keydown', onEscape);
  }

  function onEscape(e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeModal();
    }
  }

  // ---------------------------------------------------------------------------
  // MutationObserver — inject button next to Help
  // ---------------------------------------------------------------------------

  function findHelpButton() {
    // The Help button is an <a> linking to docs.keeping.com/help
    const link = document.querySelector('a[href*="keeping.com/help"]');
    if (link) return link;

    // Fallback: look for any element whose text includes "Help"
    const candidates = document.querySelectorAll('a, button, [role="button"]');
    for (const el of candidates) {
      const text = el.textContent.trim();
      if (text === 'Help' || text.endsWith('Help') || text.startsWith('Help')) {
        return el;
      }
    }
    return null;
  }

  function injectButton() {
    // Avoid duplicate injection
    if (document.querySelector('.ks-helper-btn')) return true;

    const helpBtn = findHelpButton();
    if (!helpBtn) return false;

    const btn = createHelperButton();
    helpBtn.parentNode.insertBefore(btn, helpBtn.nextSibling);
    return true;
  }

  function observeForHelpButton() {
    // Try immediately first
    if (injectButton()) return;

    const observer = new MutationObserver(function () {
      if (injectButton()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  function init(initialEnabled) {
    currentEnabled = initialEnabled !== undefined ? !!initialEnabled : true;
    observeForHelpButton();
  }

  KS.modal = { init: init };
})();
