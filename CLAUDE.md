# CLAUDE.md

@AGENTS.md

## Second Brain Vault (Obsidian)

This project is connected to a personal Obsidian vault ("Second Brain") that serves as
long-term memory for notes, projects, decisions and knowledge.

**Vault path** (referred to as `{VAULT}` below; use the path that exists on this device):

- macOS: `/Users/raphael/Developer/Workspaces/SecondBrain`
- Windows: `C:\Users\rapha\Developer\Workspaces\SecondBrain`

### When the vault is relevant

Read from or write to the vault when, in this coding session:

- the user asks about earlier context, decisions or notes on this repo
  ("what did we decide about X?", "are there notes on this already?")
- a technical decision is made that should hold beyond this one project
  (-> decision note in `08-Decisions/`)
- an insight comes up that is useful for other projects too
  (-> knowledge note in `05-Knowledge/`)
- the user explicitly asks to save or look something up "im Vault", "in meinen Notizen"
  or in the "second brain"

For plain coding tasks without any of these: ignore the vault, and do not reference or
fill it on your own initiative.

### Code style and Git workflow

Before you write code or commit in this session, read
`{VAULT}/05-Knowledge/Coding Guidelines.md` and the sections "Code-Stil" and
"Git-Workflow" in `{VAULT}/09-AI-Memory/Preferences.md` once, and follow them (clean code;
comments in English and only where needed; no cryptic abbreviations; never commit to
`main`, one branch with a pull request per feature or bugfix; commits and pull requests
in English; no AI attribution, so no "Generated with …" and no `Co-Authored-By`).

### How to load the vault conventions

The vault has its own rules for consistency (frontmatter, naming conventions, folder
structure, avoiding duplicates). **Before you read or write in the vault**, load these
once per session with your normal Read tool:

1. `{VAULT}/CLAUDE.md` (principles, folder structure, standard workflow)
2. The rule files it references in `{VAULT}/.claude/rules/`:
   naming-and-frontmatter.md, linking-tags-quality.md, content-types.md,
   duplicates-and-memory.md, automations.md

These are ordinary Markdown files, not system files. Follow all rules described there
(search before writing; no duplicates; frontmatter is mandatory; link notes; no secrets
in plain text; ask when unsure) exactly as if you were working in the vault directly.
The vault notes themselves are written in German.

### Link to this project

This repository belongs to the vault project `Plannr`, a folder in `{VAULT}/02-Projects/Plannr/`:

- Project concept, scope and decisions: `Plannr.md`
- Project tasks and bugs: `Plannr Tasks.md`
- Entities, fields, permissions and rules: `Plannr Data Model.md`
- Project history log: `Plannr Log.md` (created once history piles up)

Rules for these files:

- For tasks, bugs (`#bug`) or next steps (`⏫`), read and edit **only** `Plannr Tasks.md`.
  Mark done tasks as `- [x] … ✅ YYYY-MM-DD`, in one or two sentences.
- `Plannr Tasks.md` is the only place for tasks in the vault. Other notes (daily notes,
  `Plannr.md`, sub-notes) never get checkboxes; they only link to the task, e.g.
  `- … → [[Plannr Tasks]]`. Write each task so the line explains itself, since the
  dashboard shows only that line.
- Keep `Plannr.md` lean: only the current status and the decisions that still hold.
  Move the previous status, long PR write-ups and superseded decisions to `Plannr Log.md`.
- When an entity, field, permission or rule changes in the code, update `Plannr Data Model.md`.
- **Never read `Plannr Log.md` unprompted.** Only open it when the user asks about past
  history, earlier PRs or old findings.

### Important

- The vault is synced between devices by Obsidian LiveSync and has no `.git` here; its Git
  repository lives on a server. Do not commit there from this project: a session hook does
  that, and it only fires when a session runs _inside_ the vault (so not from here).
- Do not write credentials, API keys or secrets from this project into the vault.
- When unsure whether something belongs in the vault: ask briefly instead of assuming.
