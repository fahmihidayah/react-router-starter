---
name: ui-and-i18n
description: Build or modify Catat Progress components, layouts, accessibility behavior, responsive states, or English and Indonesian user-facing copy.
---

# UI and localization

Read `../../../AGENTS.md` first.

- Reuse `app/components/ui` primitives and feature-local composites before adding abstractions.
- Preserve labels, keyboard access, focus behavior, semantic HTML, loading, error, and empty states.
- Use theme tokens rather than hardcoded colors when a token expresses the intent.
- Add public and tracker copy to both `messages/en.json` and `messages/id.json`, then run
  `pnpm i18n:compile`. Do not edit `app/paraglide` by hand.
- Test behavior through roles, accessible names, visible content, and user interaction rather than
  internal component structure.
