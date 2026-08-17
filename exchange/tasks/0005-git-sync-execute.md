# Task t-0005 — Execute git synchronisation (key now registered)

- **id:** t-0005
- **from:** Hermes
- **priority:** high
- **type:** setup + sync

## Context
Hermes confirms the Mac SSH public key has been added to GitHub. Execute the sync from `~/ewart-woods-farm`.

## Steps
1. Test the GitHub connection: `ssh -T git@github.com`
2. Check repository and branches: `git remote -v`, `git fetch origin`, `git branch -a`
3. Do not delete or overwrite any files. Keep all existing local task and result files.
4. Synchronise safely:
   - Keep the local branch named `main`.
   - Fetch the existing remote branch `master`.
   - Merge remote `master` into local `main`.
   - If there is a conflict in `state/log.md`, preserve all lines from both sides.
   - No force push. No hard reset. Do not delete `exchange/tasks/` or `exchange/results/`.
5. Push the combined local branch to GitHub as `main`: `git push -u origin main`
6. Verify: `git status`, `git log --oneline --all -5`
7. Create `exchange/results/t-0005.md` containing: task_id, status, exact SSH test result, exact branch names found, exact pull/merge result, exact push result, whether local workspace and GitHub repo are synchronised, any blocker or required owner action.
8. Append one line to `state/log.md`.

## Constraints
- No outward-facing action except the requested GitHub synchronisation.
- Do not change Amazon, Shopify, Etsy, Gmail, advertising, payments or other business systems.
