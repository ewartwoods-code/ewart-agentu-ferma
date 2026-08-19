# farm-api — authentication and authorization

`farm-api` exposes the `farm.*` schema of central Postgres over a PostgREST-shaped
HTTP surface. Production service: `farm-api-production-b3b2.up.railway.app`.

> The path `…/ewart-agentu-ferma-production.up.railway.app/farm-api` is **not** a
> route of this service and returns `404`. Use the service domain above.

## Why this exists

Before this change, `POST /rest/v1/:table` and `PATCH /rest/v1/:table` performed
`INSERT` and `UPDATE` against the whitelisted `farm.*` tables with **no
authentication at all**. `requireAdmin()` was applied only inside the `admin_*`
RPC handlers, so the raw collection routes bypassed it entirely. Any caller able
to reach the public domain could write to `tasks`, `agents`, `subscriptions` and
every other exposed table. Security finding `SEC-2026-08-19-001`.

## Authorization model

Reads are unchanged and stay unauthenticated. **Every database-mutating route now
requires a scoped credential**, checked before any database access:

| Route | Guard | Operation |
|---|---|---|
| `GET /rest/v1/:table` | none (unchanged) | read |
| `POST /rest/v1/:table` | `requireWriteScope('insert')` | insert |
| `PATCH /rest/v1/:table` | `requireWriteScope('update')` | update |
| `POST /rest/v1/rpc/:fn` | `requireAdmin()` (unchanged) | privileged RPC |
| `GET /healthz` | none (unchanged) | read |

Credentials travel as `Authorization: Bearer <SCOPED_CRED>` or
`x-api-key: <SCOPED_CRED>`, are compared in constant time, and are never logged.

### Scopes (least privilege)

| Scope | Variable | May insert | May update |
|---|---|---|---|
| `admin` | `FARM_ADMIN_WRITE_TOKEN` | any exposed table | any exposed table |
| `hermes` | `FARM_HERMES_WRITE_TOKEN` | `tasks`, `agent_events`, `agent_status`, `commands`, `farm_plan`, `skills`, `agent_skills`, `token_budgets` | same list |
| `agent` | `FARM_AGENT_WRITE_TOKEN` | `agent_events`, `agent_usage`, `agent_module_usage` | `agent_status`, `agent_usage`, `agent_module_usage` |

The RPC admin token (`ADMIN_TOKEN`) is deliberately **separate** and is *not*
accepted on the collection routes, so leaking one does not grant the other.

### Responses

- `401` — no credential, or a credential that matches no configured scope.
- `403` — a valid credential whose scope may not perform that operation on that
  table, **or** a deployment with no write credentials configured at all
  (fail-closed: an unconfigured service never accepts anonymous writes).
- `404` — authenticated, but the table is not in the whitelist. Authentication is
  checked first so unauthenticated callers cannot enumerate tables.

## Required Railway variables

Names only — never commit or print a value.

- `DATABASE_URL` (existing)
- `ADMIN_TOKEN` (existing; RPC only)
- `FARM_ADMIN_WRITE_TOKEN` (new)
- `FARM_HERMES_WRITE_TOKEN` (new)
- `FARM_AGENT_WRITE_TOKEN` (new)

## Rollout order (must be followed to avoid breaking Hermes)

1. **Set the three new variables first**, on the `farm-api` production service,
   before merging or deploying. The service fails closed: if it deploys with none
   of them set, every write returns `403` and Hermes task creation stops.
2. **Give each caller its credential** out of band: Hermes gets
   `FARM_HERMES_WRITE_TOKEN`, agent/telemetry writers get `FARM_AGENT_WRITE_TOKEN`,
   break-glass operators get `FARM_ADMIN_WRITE_TOKEN`.
3. **Deploy** `farm-api` (owner approval required).
4. **Verify after deploy** — never claim this without re-running it:
   ```
   curl -X POST https://farm-api-production-b3b2.up.railway.app/rest/v1/tasks   # expect 401
   ```
5. The `gatis-bridge` service is **unaffected**: it talks to Postgres directly and
   does not call `farm-api`. No bridge redeploy is needed.

## Repeat-safe writes

`POST /rest/v1/tasks` and `POST /rest/v1/agent_events` reuse an identical row
written within the last 10 minutes instead of inserting a duplicate — the same
behaviour the agent bridge already has. A reused row returns `200` with
`X-Idempotent-Reuse: <n>`; a genuinely new row returns `201`.

## Tests

```
cd farm-api && npm install && npm test
```

The suite runs against an in-memory fake pool (`test/fake-pool.js`) and never
touches production. It covers unauthenticated rejection (asserting the database
was never reached), least-privilege rejection, authorized Hermes and agent writes,
read-path and RPC regressions, and retry idempotency. Credential strings in the
tests are throwaway local fixtures, not real values.
