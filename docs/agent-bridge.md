# EWART multi-agent bridge

The Railway service is still named `gatis-bridge` for compatibility, but it is
the shared Hermes bridge for all major agents.

## Production

- Base URL: `https://gatis-bridge-production.up.railway.app`
- Health: `GET /healthz` (no authentication)
- Agent API: `/api/agents/:agentId/*`
- Canonical IDs: `max-claude`, `koderis`, `ance`, `secret`, `dzemma`, `gatis`, `sabine`

Every agent must receive only its own token. Send it as either
`Authorization: Bearer <token>` or `x-api-key: <token>`. Never paste tokens into
the repository, a prompt, a result file, or chat history.

## Round trip

1. `GET /api/agents/:agentId/context` — load identity, tasks and recent events.
2. `GET /api/agents/:agentId/next` — inspect the next task.
3. `POST /api/agents/:agentId/claim` with `{ "task_id": 123 }` — claim it.
4. Do the work. Money, publishing and destructive actions remain owner-gated.
5. `POST /api/agents/:agentId/result` with
   `{ "task_id": 123, "status": "review", "summary": "...", "result_url": null }`.
6. `POST /api/agents/:agentId/events` with `{ "event_text": "..." }` for useful progress.
7. Reload context and verify the write is visible. Hermes consumes the same
   central Postgres records and verifies results.

Allowed result statuses are `done`, `review`, `blocked`, and `active`. Prefer
`review` unless the task contract explicitly allows the agent to close it.

## Required Railway variables

`DATABASE_URL` plus one token per agent:

`MAX_CLAUDE_API_TOKEN`, `KODERIS_API_TOKEN`, `ANCE_API_TOKEN`,
`SECRET_API_TOKEN`, `DZEMMA_API_TOKEN`, `GATIS_API_TOKEN`, `SABINE_API_TOKEN`.

The bridge accepts `AGENT_API_TOKENS` (JSON) or `AGENT_API_TOKEN` as fallbacks,
but production should use distinct per-agent tokens.

## Smoke test (never print the token)

```bash
curl -fsS "$EWART_BRIDGE_URL/healthz"
curl -fsS -H "Authorization: Bearer $EWART_AGENT_TOKEN" \
  "$EWART_BRIDGE_URL/api/agents/$EWART_AGENT_ID/context"
```

Success means health returns protocol `2.0`, the authenticated call returns the
same `agent_id`, and a test task can complete the claim → result → context loop.
