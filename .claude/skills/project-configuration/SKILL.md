---
name: project-configuration
description: Change Catat Progress environment variables, scripts, tooling, email, media storage, workers, build configuration, or deployment-facing settings.
---

# Project configuration

Read `../../../AGENTS.md` first.

- Inspect `package.json`, `.env.example`, and the consuming module before changing configuration.
- Keep secrets only in runtime environment variables. Commit safe placeholders and descriptions,
  never values from `.env`.
- Remove configuration only after confirming there are no runtime or script consumers.
- Keep scripts portable and fail early with a clear message when a required tool or variable is
  absent.
- Update README and relevant deployment files with the same names and behavior.
- Verify the narrow command, then typecheck, Biome, and build when the change affects bundling or
  deployment.
