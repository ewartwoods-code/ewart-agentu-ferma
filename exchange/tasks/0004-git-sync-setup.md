# Task t-0004 — Git sync setup (Mac side)

- **id:** t-0004
- **from:** Hermes
- **priority:** high
- **type:** setup

## Goal
Connect this Mac's farm workspace to the shared GitHub repo so Hermes and Claude can exchange tasks/results through git instead of the owner copy-pasting.

Repo: `git@github.com:ewartwoods-code/ewart-woods-farm.git`
Hermes' server side already has the repo and its SSH key registered. This task prepares the Mac side.

## Steps
1. Create an SSH key for this Mac only if `~/.ssh/id_ed25519` does not already exist:
   `ssh-keygen -t ed25519 -C "ewart-woods-farm-mac" -f ~/.ssh/id_ed25519 -N ""`
   If it exists, reuse it.
2. Print the PUBLIC key so the owner can register it: `cat ~/.ssh/id_ed25519.pub`
3. Prepare the local farm folder as a git repository linked to that remote. Do NOT delete existing work — `/Users/maksimsjekimovs/ewart-woods-farm` is the working copy.
   `git init` → `git add -A` → commit as ewartwoods@gmail.com / ewart-woods-mac → `git remote add origin` → `git pull origin master --allow-unrelated-histories --no-edit` → `git push -u origin master`
4. Report to the owner in Latvian (3-5 lines): whether the key was created (and the FULL public key to add), instruction to register it on GitHub, and the result of the push attempt.

## Notes
The push will FAIL with "Permission denied (publickey)" until the owner registers the Mac's public key on GitHub → Settings → SSH and GPG keys → New SSH key (Title: ewart-woods-mac). If push fails, do NOT force it — report the exact error plus the full public key.
