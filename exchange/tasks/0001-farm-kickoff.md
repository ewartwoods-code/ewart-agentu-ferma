# Task t-0001 — FARM KICKOFF: prepare the Claude side of the farm

```json
{
  "contract_version": "1.0",
  "task_id": "t-0001",
  "kind": "setup",
  "title": "Farm kickoff - prepare Claude side for supervised farm work",
  "objective": "Read the farm system docs, load the farm-operator skill, verify the exchange protocol works, and return a readiness report so Hermes can start dispatching real tasks.",
  "context": {
    "source_refs": [
      "/opt/data/ewart-woods/CLAUDE.md",
      "/opt/data/ewart-woods/.claude/skills/farm-operator.md",
      "/opt/data/ewart-woods/README.md",
      "/opt/data/ewart-woods/AGENT-FARM-ROADMAP.md",
      "/opt/data/ewart-woods/TASK-CONTRACT.md"
    ],
    "notes": "Hermes is the Supervisor on another machine. We communicate ONLY through exchange/tasks and exchange/results."
  },
  "skill": {"name": "farm-operator", "version": "1.0"},
  "input": {"task_id": "t-0001", "exchange_dir": "/opt/data/ewart-woods/exchange"},
  "output": {
    "format": "markdown",
    "structure": ["envelope JSON", "readiness checklist", "environment report"],
    "envelope": true
  },
  "quality_gates": [
    "result file written to exchange/results/t-0001.md",
    "envelope JSON valid, task_id matches",
    "readiness checklist completed: docs read, skill understood, exchange folders verified, artifact written and re-read",
    "working directory / workspace mounted as /opt/data/ewart-woods reported",
    "no secrets, no Latvian in files"
  ],
  "priority": "P0",
  "status": "queued"
}
```

## Instructions

1. Read the 5 source files listed in `context.source_refs` (the skill file is your
   operating contract — follow it for everything, including this task).
2. Verify the exchange exists and is writable: `exchange/tasks/` and `exchange/results/`.
3. Write a readiness report to `exchange/results/t-0001.md`:
   - the envelope JSON (schema in the farm-operator skill), then
   - a short "ready" confirmation: role understood, protocol understood, folders verified,
   - the exact path(s) Hermes should use to reach this workspace,
   - anything missing that would block real task execution.
4. Mark the status inside this task's JSON to `completed` (do not delete this file).

You have done enough when Hermes can read `exchange/results/t-0001.md` and file the next
real task against this workspace. Do not build anything else — Hermes decides next steps.

---

# APPENDIX — variant executed on the Mac (merged t-0005)

The Mac received a reworded version of this task pasted into chat. It is preserved
here verbatim, because `exchange/results/t-0001.md` answers THIS wording.


- **id:** t-0001
- **from:** Hermes
- **priority:** high
- **type:** setup + report

## Goal
Bring the execution node online and tell Hermes exactly what this node can do, so future tasks are assigned realistically.

## Deliverables
1. Confirm the workspace exists and is complete: `CLAUDE.md`, `.claude/skills/farm-operator.md`, `exchange/tasks/`, `exchange/results/`, `state/log.md`.
2. Report the ABSOLUTE path of the workspace root.
3. Capability inventory — what is actually available on this machine:
   - connected MCP servers / integrations (Shopify, Amazon Ads, Gmail, Calendar, Asana, Canva, Adobe, Railway, etc.)
   - available skills
   - Node / Python versions
   - is the workspace a git repository?
   For each item state **verified** or **not verified**, and how you checked.
4. Round-trip test: produce `exchange/results/t-0001.md` in the required format.
5. Propose 3-5 concrete first work items this node could take on, based on what is actually available (not wishful thinking).

## Constraints
- Read-only inspection only. Change nothing outside `~/ewart-woods-farm/`.
- No outward-facing actions (no emails, no publishing, no API writes).
- English only in files.

## Definition of done
`exchange/results/t-0001.md` exists, carries a valid JSON envelope with `task_id: "t-0001"`, and answers all five deliverables.
