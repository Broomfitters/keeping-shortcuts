# Inbox Keyboard Shortcuts Design

## Overview

Add keyboard shortcuts to the Keeping inbox list view, including navigation between messages, selection toggling, and all existing action shortcuts (status, priority, assign, tag).

## View Detection

URL-based detection using `hashchange` events:
- **Inbox list**: `app.keeping.com/inbox#/?...` (hash has only query params, no conversation ID)
- **Ticket detail**: `app.keeping.com/inbox#/<id>?...` (hash contains a conversation ID segment)

## Active Item

- CSS class `ks-active` applied to the active `.conversation-list-item` div
- Visual: light background (#f0f4ff) + 3px left border (#e45125)
- State tracked as index into visible conversation items
- Resets on view/page change

## Navigation (inbox only)

- `j` / `ArrowDown` — next item
- `k` / `ArrowUp` — previous item
- Auto-scrolls active item into view
- Stops at boundaries (no wrap)
- First keypress activates the first item if none is active

## Selection (inbox only)

- `x` — toggles checkbox on active item (clicks `.conversation-checkbox`)
- Multiple items can be selected by navigating and pressing x on each

## Opening (inbox only)

- `Enter` — opens active conversation (clicks parent `<a>`)

## Actions on Inbox

Uses the inbox toolbar bulk-action dropdowns:
- `inbox-select-set-status` for status (o/p/c/d)
- `inbox-select-set-priority` for priority (`/1/2/3)
- `inbox-select-assign-agent` for assign (a)
- `inbox-select-set-tag` for tag (t)

Behavior:
1. If active item checkbox is not checked, temporarily check it
2. Trigger the toolbar dropdown action
3. If temporarily checked, uncheck after action completes

If multiple items are manually selected with `x`, action applies to all selected.

`r` (Reply) on inbox acts as Enter (opens the ticket).

## Files Changed

- **shortcuts.js** — Add view detection, active item state, inbox-specific key handling
- **styles.css** — Add `.ks-active` styles
- **hints.js** — Add inbox-specific hints (j/k/arrows, x, Enter)
- **modal.js** — Add inbox shortcuts section to reference modal
