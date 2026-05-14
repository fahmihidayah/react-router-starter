---
name: code-review
description: >
  How to review code in this project. Use this skill when the user asks Claude to review code,
  check a PR, audit a file, find issues, or improve code quality. Also trigger when asked to
  "look at this", "what's wrong with this", "is this good", "can you review", or any request
  to evaluate existing code. Covers both what to check and how to communicate feedback.
---

# Code Review Standards

## Review Priorities (in order)

1. **Correctness** — Does it work? Logic errors, off-by-ones, null access, race conditions.
2. **Security** — SQL injection (raw queries), XSS, auth bypass, exposed secrets.
3. **Error handling** — Missing try/catch in actions, unhandled null from repository, no ErrorBoundary.
4. **Type safety** — Any `any` usage, missing types, incorrect type assertions.
5. **Architecture** — Correct layer (loader vs action vs component), feature boundary violations.
6. **Naming** — Follows conventions (T prefix for types, kebab-case files, descriptive names).
7. **Performance** — Unnecessary re-renders, N+1 queries, missing pagination.
8. **Readability** — Clear intent, reasonable function length, no clever tricks.

Do NOT flag: formatting issues (Biome handles it), import order, minor style preferences.

## Red Flags (Always Flag)

These should always be called out:

```
🔴 `any` type usage — suggest `unknown` + narrowing or proper type
🔴 Missing error handling in action — every action needs try/catch
🔴 Raw SQL without parameterization — use Drizzle operators
🔴 Secret/credential in code — should be in .env
🔴 `console.log` left in — use logger.create() instead
🔴 Default export on non-route file — named exports only
🔴 Cross-feature import — features must import through index.ts
🔴 Missing null check after findById — it can return null
🔴 Mutation in a loader — loaders are GET, use actions for mutations
🔴 useEffect for data fetching — use loader or React Query
```

## Yellow Flags (Mention, Not Block)

Worth noting but not necessarily wrong:

```
🟡 Component > 200 lines — consider splitting
🟡 Prop drilling > 2 levels — consider context or composition
🟡 Inline type definition > 5 fields — extract to named type with T prefix
🟡 Multiple responsibilities in one function — may need decomposition
🟡 Magic numbers/strings — extract to constants
🟡 No loading/error state in component using React Query
🟡 Missing aria-label on icon-only button
```

## Review Feedback Format

When reviewing, organize feedback by severity. Be specific — show the problem AND the fix.

```
### Issues

**🔴 Missing error handling in createProductAction (line 15)**
The action has no try/catch. If the repository throws, the route will crash
instead of returning a user-friendly error.

Fix:
- Wrap in try/catch
- Return `{ success: false, message: 'Failed to create product' }`
- Log the error with `logger.create('ProductActions')`

**🟡 Component could be split (product-list.tsx, 280 lines)**
The table configuration, filter logic, and delete handling could be
extracted into separate hooks or sub-components.

### Looks Good
- Type safety is solid throughout
- Loader correctly validates session before fetching data
- Pagination params have sensible defaults
```

## Architecture Checks

When reviewing feature code, verify the layer boundaries:

```
Route file (app/routes/)
├── imports loader from features/[name]/loaders/     ✅
├── imports action from features/[name]/actions/     ✅
├── imports component from features/[name]/components/ ✅
├── imports UI from components/ui/                   ✅
├── calls repository directly                       🔴 Wrong layer
├── imports from another feature's internals         🔴 Boundary violation
└── has business logic inline                        🟡 Extract to loader/action
```

## Testing Check

When reviewing a new feature or significant change:
- Does it have tests for the repository methods used?
- Does it have tests for the loader (param parsing, response shape)?
- Does it have tests for the action (success, failure, edge cases)?
- Does it have tests for interactive components (user events, validation)?

If tests are missing, note which tests should be added and what they should cover.

## Checklist for Common Patterns

### New CRUD Feature
- [ ] Schema has T-prefixed types exported
- [ ] Repository extends BaseRepository
- [ ] Loaders handle missing params gracefully
- [ ] Actions return consistent `{ success, message }` shape
- [ ] Bulk delete uses `inArray()` not raw SQL
- [ ] Route has ErrorBoundary for 404/unexpected errors
- [ ] List page has empty state
- [ ] Delete has confirmation dialog
- [ ] Toast notifications on action results

### New Form
- [ ] Zod schema defined, type inferred with `z.infer`
- [ ] Using zodResolver with react-hook-form
- [ ] All fields show validation errors inline
- [ ] Submit button disabled during submission
- [ ] Server errors shown via toast
- [ ] Edit form pre-fills with defaultValues

### New Component
- [ ] Named export (no default export)
- [ ] Props typed with `T[Name]Props`
- [ ] Uses semantic color tokens (not raw colors)
- [ ] Icon-only buttons have aria-label
- [ ] Responsive (works on mobile)
- [ ] Handles empty/loading states if applicable
