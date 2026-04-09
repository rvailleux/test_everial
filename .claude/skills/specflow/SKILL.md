---
name: specflow
description: This skill should be used when the user says "/specflow", "run specflow", or wants to execute the full specify→plan→tasks→implement pipeline end to end with no interruption.
argument-hint: "Describe the feature to implement"
compatibility: "Requires spec-kit project structure with .specify/ directory"
---

# Specflow — Full Pipeline Orchestrator

Run the complete speckit pipeline from feature description to working implementation. Execute every step consecutively without stopping for user input.

## Pipeline

```
speckit-specify → speckit-plan → speckit-tasks → speckit-implement
```

## Execution Rules

**No interruptions.** Do not stop between steps, do not ask for confirmation, do not wait for approval. Execute each step immediately after the previous one completes.

**No context clear.** Run all steps in the same session.

**Announce each step** before invoking it:
```
▶ Step N/4 — speckit-<name>
```

## Steps

### Step 1 — speckit-specify

Invoke `speckit-specify` with the feature description provided as argument.

Creates `.specify/spec.md`.

### Step 2 — speckit-plan

Invoke `speckit-plan`.

Creates `.specify/plan.md` from the spec.

### Step 3 — speckit-tasks

Invoke `speckit-tasks`.

Creates `.specify/tasks.md` with dependency-ordered implementation tasks.

### Step 4 — speckit-implement

Invoke `speckit-implement`.

Execute all tasks in `tasks.md`. For each task: write failing tests first, implement until tests pass, run `npx tsc --noEmit`, fix errors before moving to the next task.

## Completion

After all steps finish, output a summary:
```
✅ Specflow complete
Spec:   .specify/spec.md
Plan:   .specify/plan.md
Tasks:  .specify/tasks.md
Tests:  <N> passed, <N> failed
TSC:    clean | <N> errors
Blockers: <list or none>
```
