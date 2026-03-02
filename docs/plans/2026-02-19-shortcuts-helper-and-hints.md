# Shortcuts Helper Button & Shift-to-Reveal Hints Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a toolbar button that opens a shortcuts reference modal with an on/off toggle, plus inline key hints that appear when holding Shift.

**Architecture:** All UI is injected via content script into the Keeping DOM. The helper button sits next to the existing Help button in the top toolbar. The modal is a centered overlay with backdrop. Shift hints are dynamically injected/removed spans positioned near their corresponding UI controls. Toggle state persists via `chrome.storage.local`. Code is split into separate files: `shortcuts.js` (core shortcut logic, extracted from current content.js), `modal.js` (button + modal), `hints.js` (shift-to-reveal), `styles.css` (all injected styles). `content.js` becomes the entry point that wires everything together.

**Tech Stack:** Vanilla JS, Chrome Extension Manifest V3, chrome.storage.local

---

### Task 1: Extract Shortcut Logic into `shortcuts.js`

**Files:**
- Create: `shortcuts.js`
- Modify: `content.js`

**Step 1: Create `shortcuts.js`**

Extract all shortcut logic from `content.js` into `shortcuts.js`. Expose an `enabled` flag that the toggle can control. The module should export `init()` and `setEnabled(bool)` by attaching to a global `window.KeepingShortcuts` namespace.

Contains: `isInputFocused`, `clickNextChevron`, `clickPrevChevron`, `setReactSelectValue`, `openReactSelectDropdown`, `STATUS_MAP`, `PRIORITY_MAP`, the keydown listener, and the `enabled` gate.

**Step 2: Simplify `content.js` to entry point**

`content.js` becomes the orchestrator — it loads the enabled state from `chrome.storage.local`, calls init on each module, and wires the toggle callback.

**Step 3: Commit**

```bash
git add shortcuts.js content.js
git commit -m "refactor: extract shortcut logic into shortcuts.js"
```

---

### Task 2: Add `styles.css` and Update Manifest

**Files:**
- Create: `styles.css`
- Modify: `manifest.json`

**Step 1: Create `styles.css`**

All styles for: helper button (pill-shaped, matching Keeping toolbar), modal overlay + card, toggle switch, shortcut reference table rows with keycap styling, shift-to-reveal hint badges. Use `.ks-` prefix for all classes to avoid collisions.

**Step 2: Update `manifest.json`**

- Bump version to `"1.1"`
- Add `"permissions": ["storage"]`
- Add all new JS files and the CSS file to the content_scripts entry:
  ```json
  "css": ["styles.css"],
  "js": ["shortcuts.js", "hints.js", "modal.js", "content.js"]
  ```

**Step 3: Commit**

```bash
git add styles.css manifest.json
git commit -m "feat: add styles and update manifest for v1.1"
```

---

### Task 3: Build the Modal (`modal.js`)

**Files:**
- Create: `modal.js`

**Step 1: Create `modal.js`**

Builds and injects:
1. **Helper button** — injected next to the Help button in the toolbar. Keyboard icon (inline SVG) + "Shortcuts" label. Uses a `MutationObserver` to wait for the Help button to appear in the DOM, then inserts the button adjacent to it.
2. **Modal** — on button click, creates and appends a centered overlay with:
   - Header: "Keyboard Shortcuts" title + close button (×)
   - Toggle row: "Shortcuts enabled" label + toggle switch. Reads/writes `chrome.storage.local` key `ks_enabled` (default: `true`). On toggle, calls `window.KeepingShortcuts.setEnabled(bool)`.
   - Shortcut reference sections: Navigation (`j`/`k`), Status (`o`/`p`/`c`/`d`), Priority (`` ` ``/`1`/`2`/`3`), Other (`a`/`t`). Each row has a keycap-styled key + action label.
   - Footer note: "Hold shift + status key to set and advance"
3. **Dismiss** — click backdrop, click ×, or press Escape.

Attach to `window.KeepingShortcuts.modal` namespace.

**Step 2: Commit**

```bash
git add modal.js
git commit -m "feat: add shortcuts helper button and reference modal"
```

---

### Task 4: Build the Shift-to-Reveal Hints (`hints.js`)

**Files:**
- Create: `hints.js`

**Step 1: Create `hints.js`**

Listens for `keydown`/`keyup` on the Shift key. When Shift is held (and shortcuts are enabled):

- Finds the status dropdown (`#select-status`) and injects hint badges `o` `p` `c` `d` next to its label/control
- Finds the priority dropdown (`#select-priority`) and injects `\`` `1` `2` `3`
- Finds the assign dropdown (`#select-assigned-to`) and injects `a`
- Finds the tag dropdown (`#select-tag`) and injects `t`
- Finds the navigation chevrons (`.previous-chevron`, `.next-chevron`) and injects `k` and `j` next to them

On Shift release, removes all `.ks-hint` elements.

Uses the label or container element adjacent to each dropdown as the injection point. Each hint is a `<span class="ks-hint">` with the lowercase key character.

Attach to `window.KeepingShortcuts.hints` namespace. Respects the `enabled` flag.

**Step 2: Commit**

```bash
git add hints.js
git commit -m "feat: add shift-to-reveal inline key hints"
```

---

### Task 5: Wire Everything Together in `content.js`

**Files:**
- Modify: `content.js`

**Step 1: Update `content.js` as orchestrator**

```js
(function () {
  'use strict';

  const DEFAULT_ENABLED = true;

  chrome.storage.local.get('ks_enabled', (result) => {
    const enabled = result.ks_enabled !== undefined ? result.ks_enabled : DEFAULT_ENABLED;
    window.KeepingShortcuts.setEnabled(enabled);
    window.KeepingShortcuts.modal.init(enabled, (newState) => {
      chrome.storage.local.set({ ks_enabled: newState });
      window.KeepingShortcuts.setEnabled(newState);
    });
    window.KeepingShortcuts.hints.init();
  });
})();
```

**Step 2: Commit**

```bash
git add content.js
git commit -m "feat: wire up entry point with storage and module init"
```

---

### Task 6: Update README

**Files:**
- Modify: `README.md`

**Step 1: Update README**

Add sections for:
- The helper button and how to open the shortcuts reference
- The on/off toggle
- The shift-to-reveal hints feature
- Update version reference

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README for v1.1 features"
```
