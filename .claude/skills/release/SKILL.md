---
name: release
description: Prepare a version release — bump version files, commit, and tag. Just run /release with no arguments.
---

# Release

Prepare a version release. No arguments — reads git state and decides what to do.

## Usage

```
/release
```

## Project Config

- **Type:** generic (Claude Code plugin)
- **Version files:**
  - `.claude-plugin/plugin.json` → `version`
- **Platforms:** none (single-platform)
- **Main branch:** main

## Protocol

### 1. Qualify

Run in parallel:
- `git status` — working tree must be clean. If dirty, stop: "Commit or stash changes first."
- `git branch --show-current` — must be on `main`. If not, warn and ask to continue.

### 2. Read state

```bash
# Latest version tag
git tag -l "v*" --sort=-v:refname | head -1

# Commits since last version tag
git log <latest-tag>..HEAD --oneline

# Check if current commit == tagged commit
git rev-parse HEAD
git rev-parse <latest-tag>^{commit}
```

### 3. Decide

Based on the state, determine which flow to run:

**STATE A — No version tag exists:**
→ Go to "Full Release Flow"

**STATE B — Version tagged, different commit:**
→ Go to "Full Release Flow"

**STATE C — Version tagged, same commit:**
→ "v{latest} fully released. Nothing to do."

### Full Release Flow

**Step 1 — Detect bump level** from conventional commits since last tag:

| Signal | Bump |
|---|---|
| `BREAKING CHANGE:` in body, or `!:` suffix | major |
| `feat:` | minor |
| `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `perf:` | patch |
| No conventional prefixes | patch (default) |

Use the highest level found. If no previous tag exists, ask user for the version.

**Step 2 — Propose:**

> Current: {current_version} → New: {new_version} (auto: N feat, N fix since v{current})
> OK?

Wait for confirmation. User can override the version.

**Step 3 — Bump version files:**

Edit `.claude-plugin/plugin.json`: change the `"version"` field to the new version. Only change that field.

**Step 4 — Generate release notes** from commits since last tag:

```
## What's New
- description (from feat: commits)

## Fixes
- description (from fix: commits)

## Other
- description (from everything else)
```

Omit empty sections. Show to user for approval.

**Step 5 — Commit and tag:**

```bash
git add .claude-plugin/plugin.json
git commit -m "chore: release v{version}"
git tag -a v{version} -m "<release notes>"
```

Use annotated tag. Pass message via HEREDOC.

**Step 6 — Report:**

> Release v{version} prepared.
> To publish: `git push origin main --tags`

## Rules

- Never push. User pushes manually.
- Never proceed if working tree is dirty.
- Never delete or move existing tags.
- All tags are annotated (`git tag -a`).
- No arguments to `/release` — always auto-detect.
