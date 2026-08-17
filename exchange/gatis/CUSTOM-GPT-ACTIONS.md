# GATIS → HERMES BRIDGE — Custom GPT "Actions" (OpenAPI) setup

This lets Hermes give tasks to your subscription Custom GPT **Gatis** and get
results back — the same two-way channel you had with Claude, but over HTTP.

## 1. The live base URL (Railway, after deploy)
```
https://ewart-agentu-ferma-production.up.railway.app
```

## 2. In ChatGPT: configure Gatis' "Actions"
Open your **Gatis** Custom GPT → **Configure** → scroll to **Actions** →
**Create new action** → paste this OpenAPI spec into the **Schema** box:

```yaml
openapi: 3.1.0
info:
  title: EWART Gatis Bridge
  version: "1.0"
servers:
  - url: https://ewart-agentu-ferma-production.up.railway.app
paths:
  /api/gatis/next:
    get:
      summary: Get the next pending task for Gatis from Hermes
      operationId: gatisNext
      responses:
        '200':
          description: { ok, task (id, to, task, context_ref, deadline) or null }
          content:
            application/json:
              schema:
                type: object
                properties:
                  ok: { type: boolean }
                  task:
                    type: object
                    nullable: true
                    properties:
                      id: { type: string }
                      to: { type: string }
                      task: { type: string }
                      context_ref: { type: string }
                      deadline: { type: string }
  /api/gatis/result:
    post:
      summary: Submit Gatis' result back to Hermes
      operationId: gatisResult
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [id, status, summary]
              properties:
                id: { type: string }
                status: { type: string, enum: [done, needs_review, blocked] }
                summary: { type: string }
                artifacts: { type: array, items: { type: string } }
      responses:
        '200': { description: { ok: true } }
  /api/gatis/context:
    get:
      summary: Fetch the shared EWART knowledge/skill pack
      operationId: gatisContext
      responses:
        '200': { description: plain-text context.md }
  /api/gatis/skill:
    post:
      summary: Append/update a skill note for Gatis (learned capability)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text: { type: string }
      responses:
        '200': { description: { ok: true } }
```

## 3. Gatis' system instruction (the "Instructions" field)
```
You are Gatis, the EWART WOODS farm agent (owner's skilled GPT). You work in a
two-way loop with Hermes via the Actions above:
1. On demand (or when the owner says "jāizdara uzdevumi"), call `gatisNext` to
   get the next pending task. If a task arrives: read its context_ref if given.
2. Do the task (you can use web/email skills you have; never invent numbers;
   truth-rate external claims).
3. Call `gatisResult` to POST {id, status: done|needs_review|blocked, summary,
   artifacts:[...]} so Hermes gets the result.
4. If you learned a reusable capability (money authorizations, best practices),
   call `gatisSkill` to update your remembered skills for tomorrow.
5. Communicate with the owner in Latvian, short and concrete.

You are the owner's personal GPT: helpful, honest, no fabricated facts.
```

## 4. First real round-trip (test)

1. Hermes enqueues (already done): task **g-0002** = "email Ance ...".
2. In Gatis, invoke the action **gatisNext**. It returns g-0002.
3. Gatis reads `email-to-ance.txt`, ACTUALLY sends it via his mail tool, then
   calls **gatisResult** with `{id:'g-0002',status:'done',summary:'sent to
   ance...',message_id:'...'}`.
4. Hermes sees it in `exchange/gatis/outbox.ndjson` and verifies.

That's the loop — Gatis becomes a first-class remote agent reachable by
Hermes over HTTP, his skills updatable via the skill endpoint.

— Hermes, 2026-08-17