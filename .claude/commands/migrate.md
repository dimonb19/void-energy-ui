Migrate consumers from a `-legacy` component to its Void Energy replacement.

## Strategy

The codebase uses a **strangler fig** migration pattern:
- Void Energy components have the clean names (`Modal.svelte`, `/styles/`)
- Old components are renamed with `-legacy` suffix (`Modal-legacy.svelte`, `/styles-legacy/`)
- Migration = updating **consumers** to use the new component's API, then deleting the `-legacy` file when zero consumers remain

## Input

`$ARGUMENTS` is the component name (e.g., `Modal`, `Toggle`, `SearchField`).

If no argument is provided, ask the user which component to migrate.

## Migration Process

### 1. Understand the New Component

Read the Void Energy version (`$ARGUMENTS.svelte`) to understand:
- Props interface (names, types, defaults)
- Bindable props (`$bindable()`)
- Callback props (e.g., `onchange`, `onclose` instead of `on:change`, `on:close`)
- Slot usage (`{@render children()}` vs `<slot>`)
- Required data attributes for state
- Any breaking API differences from the legacy version

### 2. Understand the Legacy Component

Read the `-legacy` version (`$ARGUMENTS-legacy.svelte`) to understand:
- Its props (names, types, defaults)
- Its events (`on:event` dispatchers)
- Its slots (`<slot>`, `<slot name="...">`)
- Any other consumer-facing API

### 3. Build the Transformation Map

Create a concrete mapping between old and new APIs:

```
LEGACY API                          → VOID ENERGY API
─────────────────────────────────────────────────────
import Modal from './Modal-legacy'  → import Modal from './Modal'
on:close={handler}                  → onclose={handler}
bind:open                           → bind:open (if same) or open={value} (if changed)
<slot>content</slot>                → {#snippet children()}content{/snippet} (if changed)
class="legacy-modal"                → class="modal" (if class name changed)
```

### 4. Find All Consumers

Search for every file that imports the `-legacy` version:

```
grep -r "import.*$ARGUMENTS-legacy" src/
grep -r "import.*$ARGUMENTS.*legacy" src/
```

List all consumer files and the specific lines that need changes.

### 5. Migrate Each Consumer

For each consumer file:
1. Update the import path (remove `-legacy` suffix)
2. Update prop names if they changed
3. Convert `on:event` dispatchers to callback props (`on:close` → `onclose`)
4. Convert `<slot>` usage to `{@render}` snippets if the new component uses them
5. Update any CSS class references if the component's class name changed
6. Update any legacy style references (e.g., old CSS variables → new tokens)

**Do NOT modify the component itself** — only its consumers.

### 6. Check for Remaining Consumers

After migrating, verify no consumers of the `-legacy` version remain:

```
grep -r "$ARGUMENTS-legacy" src/
```

### 7. Summary

Output:
- **Transformation map:** The old → new API mapping used
- **Consumers migrated:** List of files updated with specific changes
- **Remaining consumers:** Any files still using `-legacy` (if migration was scoped)
- **Ready to delete:** Whether the `-legacy` file can be safely removed (zero remaining consumers)
- **Manual checks needed:** Any prop behavior differences that need visual testing
- **Next steps:** After migrating and testing, run `/document $ARGUMENTS` to update CHEAT-SHEET.md with any API changes

## Rules

- **Never modify `-legacy` files.** They are read-only references. Only modify consumers.
- **Never modify the new Void Energy component.** It's already correct. Only modify consumers.
- **One component at a time.** Don't cascade into migrating other components encountered along the way.
- **Flag breaking changes.** If the new component has a fundamentally different API (e.g., different prop semantics, different behavior), report it and ask before proceeding.
- **Preserve behavior.** The consumer should work identically after migration — same UX, same interactions, same data flow.
