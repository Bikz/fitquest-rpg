# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Gas Town Summary (Quick Memory)

Gas Town is a multi-agent workspace manager for CLI coding agents. It keeps durable work state in Beads (git-backed) so work survives crashes and restarts. The town directory (often `~/gt`) contains rigs (projects) and agent roles. The Mayor is the main coordinator you talk to; polecats execute tasks; witness monitors; refinery handles merge queue.

Key concepts:
- Town: top-level workspace containing rigs and agents
- Rig: a managed git project
- Roles: Mayor (coordination), Deacon (daemon), Witness (monitor), Refinery (merge queue), Polecat (worker), Overseer (you)
- Beads: issue tracker and workflow ledger under `.beads/`
- Convoy: work order tracking multiple issues
- Hook: per-agent persistent work attachment for resuming after restarts
- Propulsion principle: if your hook has work, run it; molecules survive crashes

## Operator Notes (Self-Reminders)

- When given a PRD/spec: distill into Beads issues or a formula, then hand to the Mayor (preferred) or sling via CLI.
- For multi-step work: write/use a formula (`.beads/formulas/*.toml`), then `bd cook` and `bd mol pour` before slinging.
- Use the Mayor for orchestration; long waits are normal while agents run.
- For JS/TS work on this Mac, use `bun` by default (install/run/test).

## Gas Town Key Commands

Town lifecycle and sessions:
```bash
gt start                 # Start Gas Town (daemon + Mayor session)
gt shutdown              # Graceful shutdown
gt status                # Town overview
gt agents                # Switch between agent sessions
gt <role> attach         # e.g. gt mayor attach, gt witness attach
```

Rigs and personal workspace:
```bash
gt install ~/gt --git                 # Create town workspace
gt rig add <rig> <git-url>            # Add a project rig
gt crew add <yourname> --rig <rig>    # Personal workspace under rig
```

Work tracking (convoys) and assignment:
```bash
gt convoy create "Feature X" <issues...>
gt convoy list
gt convoy status <id>
gt sling <bead-id> <rig>              # Assign work to a polecat
```

Communication and health:
```bash
gt mail inbox
gt mail send <addr> -s "..." -m "..."
gt handoff
gt peek <agent>
gt doctor
gt doctor --fix
```

Dashboard and completions:
```bash
gt dashboard --port 8080
gt completion zsh   # or bash/fish
```

Beads workflow (core):
```bash
bd ready
bd show <id>
bd update <id> --status in_progress
bd close <id>
bd sync
```

Beads formulas and molecules (durable multi-step workflows):
```bash
bd formula list
bd cook <formula>
bd mol pour <formula> --var key=value
```

## Modes

- Full stack (recommended): tmux + Mayor session
- Minimal (no tmux): run agent sessions manually (e.g. `claude --resume`)

## Mayor Usage (Primary Interface)

Use the Mayor session for orchestration:
```bash
gt mayor attach
```

Example prompts inside the Mayor session:
- "Create a convoy for issues 123 and 456 in myproject"
- "Sling issue-123 to myproject"
- "What's the status of my work?"
- "Show me what the witness is doing"

## PRD to Execution (Suggested Flow)

1. Read the PRD/spec and break into Beads issues or a formula.
2. If a formula is appropriate, write it in `.beads/formulas/`, then:
   - `bd cook <formula>`
   - `bd mol pour <formula> --var key=value`
3. Create a convoy for the issues or molecule.
4. Use the Mayor to sling work to the correct rig and monitor progress.
5. Wait for agents to complete; check `gt convoy list` and `gt convoy status`.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
