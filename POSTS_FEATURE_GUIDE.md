# Posts feature guide

Posts are public content managed from the administrator area. The current routes are:

- `/posts` and `/posts/:slug` for public reading
- `/admin/posts`, `/admin/posts/new`, and `/admin/posts/:id` for management

Implementation lives under `app/features/posts/` and `app/routes/admin/posts.*.tsx`. The feature is
an older admin module, so maintain its local conventions when making a small fix. For new tracker
features, use the layered pattern in [`AGENTS.md`](./AGENTS.md), not this feature as a template.

Before changing post behavior, verify:

- admin middleware still protects every management route
- public queries expose only intended published content
- category and media relationships are validated
- rich-text output is sanitized or rendered only through the established safe path
- create, edit, delete, filtering, and public visibility have focused tests
