# Keeping Keyboard Shortcuts

A Chrome extension that adds keyboard shortcuts to [Keeping.com](https://keeping.com), the helpdesk app built inside Gmail. Navigate tickets, set statuses, assign priorities, and more — all without leaving the keyboard.

## Shortcuts

### Navigation

| Key | Action |
|-----|--------|
| `j` | Next ticket |
| `k` | Previous ticket |

### Status

| Key | Action |
|-----|--------|
| `o` | Open |
| `p` | Pending |
| `c` | Closed |
| `d` | Discard |

Hold **Shift** with any status key (e.g. `Shift+c`) to set the status *and* advance to the next ticket automatically.

### Priority

| Key | Action |
|-----|--------|
| `` ` `` | None |
| `1` | Low |
| `2` | Medium |
| `3` | High |

### Other

| Key | Action |
|-----|--------|
| `a` | Open the Assign dropdown |
| `t` | Open the Tag dropdown |

Shortcuts are disabled while typing in any input field, textarea, or rich text editor.

## Helper Button & Toggle

A **Shortcuts** button appears in the Keeping toolbar next to the Help button. Click it to open a reference modal showing all available shortcuts. The modal includes an on/off toggle to enable or disable shortcuts without uninstalling the extension — your preference is saved across sessions.

## Shift-to-Reveal Hints

Hold **Shift** to see key hint badges appear inline next to each control — status, priority, assign, tag dropdowns and navigation chevrons. Release Shift to hide them. A quick way to remember what keys do what.

## Install

1. Clone or download this repo
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the project folder

The extension activates automatically on `app.keeping.com`.

## How it works

The extension injects a content script that listens for keydown events on the Keeping web app. It interacts with the UI by clicking navigation chevrons and programmatically controlling React Select dropdowns for status, priority, assignment, and tag fields.

## License

MIT
