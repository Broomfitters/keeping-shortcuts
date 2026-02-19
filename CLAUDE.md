# Keeping Keyboard Shortcuts

Chrome extension (Manifest V3) that adds keyboard shortcuts to the [Keeping](https://app.keeping.com) helpdesk app.

## Architecture

This is a content script extension — no background service worker, no popup. Everything runs in the Keeping app page context.

- **manifest.json** — Extension config, injects into `app.keeping.com/*`
- **shortcuts.js** — Core keyboard shortcut handler (keybindings, actions, state)
- **hints.js** — Visual keyboard shortcut hints overlay on the UI
- **modal.js** — Shortcuts reference modal (? key) showing all available bindings
- **content.js** — Entry point that wires everything together
- **styles.css** — Styles for hints and modal

## Key Patterns

- All JS is vanilla — no build step, no bundler, no framework
- Extension uses `chrome.storage.sync` for user preferences
- Shortcuts interact with Keeping's DOM directly (querySelector-based)
- The extension adds a toolbar button and hint badges to Keeping's UI using Keeping's own Tailwind CSS classes where possible

## Development

Load as unpacked extension at `chrome://extensions` pointed at this directory. Reload extension after changes.

## No Build Step

Edit files directly. No `npm install`, no compilation needed.
