
**Prompt:**

I'm refactoring a React Router (framework mode) + Drizzle ORM codebase away from an inherited-class repository pattern toward plain namespaced query modules. Migrate the code I provide following these rules.

**Target pattern:**

* Replace repository classes with plain exported async functions in a** **`queries.server.ts` module per feature.
* Consumers import via namespace:** **`import * as userQueries from "~/features/users/queries.server"` and call** **`userQueries.getById(id)`.
* No base class, no inheritance, no** **`this`, no singleton instance export (`export const xRepository = new X()`).
* Prefer Drizzle's relational query API (`db.query.x.findMany/findFirst`) so return types stay inferred. Don't cast with** **`as` or reintroduce generic** **`InferSelectModel` wrappers — let types flow from the actual query.
* Drop generic CRUD helpers (`findAll`,** **`findOne`,** **`save`,** **`exists`, etc.) unless they're actually used. Only port methods that are called somewhere. For each generic method a caller relies on, inline it as a purpose-named function (e.g.** **`getById`,** **`listUsers`,** **`countAdmins`) rather than a passthrough.
* Keep pagination as a small standalone helper, not a base-class method — either a shared** **`paginate()` util in** **`~/lib/pagination.server.ts` or an explicit count+limit+offset in the specific query that needs it.
* These are data-access functions only: no auth checks, no business rules, no throwing domain errors. That logic belongs in a service layer, not here.

**What to produce for each file:**

1. The rewritten** **`queries.server.ts` module.
2. A short list of every call site that must change (old** **`xRepository.method()` → new** **`xQueries.method()`), so I can grep and update.
3. Flag any base-class method that was being used but has no obvious purpose-named replacement, and propose a name.

**Constraints:**

* Don't invent methods that weren't in the original or clearly needed by callers.
* Don't add a service layer in this pass — queries only. I'll wire services separately.
* Preserve exact query semantics (same** **`where`, same relations loaded, same count logic).

Here's the first file to migrate:** **`[paste UserRepository]`

For reference, check on file /users/repositories/user-repository.ts
