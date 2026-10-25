# Theming guide

All app colors live in **one file**: [`app/app.css`](../app/app.css). Components do not
hardcode hex colors — they use semantic utility classes (`bg-primary`, `text-foreground`,
`border-border`, …), so changing a color here re-skins the whole app (home, about, contact,
admin, auth) from a single place.

## Where the palette lives

| Section | Purpose |
| --- | --- |
| `:root { ... }` | Light theme values |
| `.dark { ... }` | Dark theme values |
| `@theme inline { ... }` | Maps each CSS variable to a Tailwind utility (e.g. `--color-primary` → `bg-primary` / `text-primary`) |
| `@theme { ... }` | Font and shadow tokens (`--shadow-soft`, `--shadow-brand`) |

## Change the brand color

Edit the `--primary` value in **both** `:root` and `.dark`:

```css
:root {
  --primary: #2f39a9; /* brand indigo */
}

.dark {
  --primary: #818cf8; /* lighter indigo for dark mode */
}
```

For a darker button hover state, update `--primary-hover`, and update `--ring` to match so
focus rings stay consistent. For example, to switch the brand to green:

```css
/* :root */
--primary: #0f9d58;
--primary-hover: #0b7a44;
--primary-soft: #e6f6ec;
--ring: #0f9d58;

/* .dark */
--primary: #34d399;
--primary-hover: #10b981;
--primary-soft: #064e3b;
--ring: #34d399;
```

## Token reference

| Variable(s) | Role | Example utilities |
| --- | --- | --- |
| `--background` / `--foreground` | page background / main ink text | `bg-background`, `text-foreground` |
| `--card` / `--card-foreground` | white cards | `bg-card` |
| `--primary` / `--primary-foreground` | brand color and its text | `bg-primary`, `text-primary` |
| `--primary-hover` | darker brand hover | `hover:bg-primary-hover` |
| `--primary-soft` | light brand tint (icon chips, callout notes) | `bg-primary-soft` |
| `--secondary` / `--secondary-foreground` | secondary brand | `bg-secondary` |
| `--muted` / `--muted-foreground` | subtle background / body gray text | `bg-muted`, `text-muted-foreground` |
| `--accent` / `--accent-foreground` | subtle hover / selected tint | `bg-accent` |
| `--destructive` | error / danger | `bg-destructive`, `text-destructive` |
| `--border` / `--input` | borders / input borders | `border-border`, `border-input` |
| `--ring` | focus ring | `ring-ring` |
| `--brand-mint` / `--brand-mint-soft` | marketing mint accent / pale mint | `text-brand-mint`, `bg-brand-mint-soft` |
| `--sidebar-*` | admin sidebar surface | `bg-sidebar`, `bg-sidebar-primary` |
| `--chart-1 … --chart-5` | chart series colors | `bg-chart-1` |

## Rules of thumb

- Never add raw hex (`bg-[#…]`) to components — add a token to `app.css` and use the utility.
- Always update both `:root` (light) and `.dark` (dark) when changing a color.
- Shadows use `shadow-soft` and `shadow-brand` (defined in `@theme`).
- After editing `app.css`, restart the dev server or rebuild so Tailwind regenerates the CSS.

## Out of scope

Transactional email templates use a separate palette in
`app/features/email/email-tailwind.server.ts`.
