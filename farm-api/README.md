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
| `app` | `FARM_APP_WRITE_TOKEN` | `chat_messages` | `agent_usage` |

The RPC admin token (`ADMIN_TOKEN`) is deliberately **separate** and is *not*
accepted on the collection routes, so leaking one does not grant the other.

### Responses

- `401` — no credential, or a credential that matches no configured scope.
- `403` — a valid credential whose scope may not perform that operation on that
  table, **or** a deployment with no write credentials configured at all
  (fail-closed: an unconfigured service never accepts anonymous writes).
- `404` — authenticated, but the table is not in the whitelist. Authentication is
  checked first so unauthenticated callers cannot enumerate tables.

Each configured scope must have a **distinct** credential. `farm-api` refuses to
start if two scopes share one value — the error names the two variables and never
prints the value.

## Caller inventory

`SUPABASE_URL` on the deployed `ewart-agentu-ferma` service resolves to
`https://farm-api-production-b3b2.up.railway.app`, so "Supabase" calls in that
codebase are farm-api calls. Verified by reading the served page, not assumed.

| Caller | Route | Operation | Required scope | Credential variable | Change needed | Rollout order |
|---|---|---|---|---|---|---|
| `ewart-agentu-ferma` web service — Herme chat, `server.js:177` | `POST /rest/v1/chat_messages` | insert | `app` | `FARM_APP_WRITE_TOKEN` | none at deploy if the variable is set to the value this service already sends (`SUPABASE_SERVICE_ROLE_KEY`); dedicated value + code change is a follow-up | 1 (before deploy) |
| `ewart-agentu-ferma` web service — usage sync, `server.js:268` | `PATCH /rest/v1/agent_usage` | update | `app` | `FARM_APP_WRITE_TOKEN` | same as above | 1 (before deploy) |
| Hermes task sync, `ewart-woods-farm/scripts/sync-tasks-to-db.js:394` | `POST /rest/v1/rpc/admin_*` | insert/update via RPC | none (RPC `p_token`) | `FARM_ADMIN_TOKEN` (existing) | **none** — never calls the collection routes | unaffected |
| Browser UI (`index.html:468`, `admin.html:124`, `public/control.html:330`) | `GET /rest/v1/:table` | read | none | — | none | unaffected |
| Browser UI mutations | `POST /rest/v1/rpc/*` | RPC | none (RPC `p_token`) | — | none | unaffected |
| Operator/verification scripts run by an agent on the Mac | `POST /rest/v1/tasks` | insert | `hermes` | `FARM_HERMES_WRITE_TOKEN` | must start sending the credential | 2 (after variables set) |
| `gatis-bridge` service | — | — | — | — | none — talks to Postgres directly | unaffected |
| Report pages (`public/reports/*`, `morning-report*`) | `SB_URL` = real Supabase | — | — | — | none — different host | unaffected |

**Does Hermes send an auth header today?** Yes — `sync-tasks-to-db.js:378` sends
`apikey` and `Authorization: Bearer <SUPABASE_ANON_KEY>`. farm-api ignores both:
the RPC route authorizes on the `p_token` field in the body. Note the header name
is `apikey`, not `x-api-key`, so it is not read by the write-scope check either.
Hermes therefore neither gains nor loses access from this change.

**Would any legitimate caller break immediately after deploy?** Yes — the two
`ewart-agentu-ferma` web-service writes, unless `FARM_APP_WRITE_TOKEN` is set
first. That is why it is step 1 below and not optional.

## Multi-row POST: partial writes are possible

`POST /rest/v1/:table` inserts a JSON array row by row, each in its own implicit
transaction. If row *n* fails, rows *1..n-1* stay committed and the request still
returns `400`. This predates the auth change and is **not** fixed here — wrapping
the loop in a transaction is a separate, reviewable change. It is covered by a
regression test (`PG DOCUMENTED RISK`) that pins the current behaviour against a
real PostgreSQL instance so a future fix is a deliberate decision, not a surprise.

Callers that need all-or-nothing semantics should post one row per request or use
an `admin_*` RPC, which does run inside `tx()`.

## Required Railway variables

Names only — never commit or print a value.

- `DATABASE_URL` (existing)
- `ADMIN_TOKEN` (existing; RPC only)
- `FARM_ADMIN_WRITE_TOKEN` (new)
- `FARM_HERMES_WRITE_TOKEN` (new)
- `FARM_AGENT_WRITE_TOKEN` (new)
- `FARM_APP_WRITE_TOKEN` (new)

## Rollout order — no gap in either direction

The goal is no window where unauthenticated writes are still accepted **and** no
window where a legitimate caller fails.

1. **Set all four variables on the `farm-api` service first**, before merge and
   before deploy. Set `FARM_APP_WRITE_TOKEN` to the value the
   `ewart-agentu-ferma` service already sends (its `SUPABASE_SERVICE_ROLE_KEY`),
   so that service keeps working across the deploy with no code change and no
   redeploy of its own. All four values must be distinct from each other or the
   service refuses to start.
   *Setting variables on a not-yet-deployed revision changes nothing about the
   running one — the old code ignores them, so this step is safe on its own.*
2. **Merge** (owner approval required).
3. **Deploy `farm-api`** (separate owner approval required). The moment the new
   revision serves traffic, anonymous writes stop and the `app` scope keeps
   working. There is no intermediate state: Railway swaps revisions atomically.
4. **Verify after deploy — never claim it without running it:**
   ```
   curl -s -o /dev/null -w '%{http_code}' -X POST \
     https://farm-api-production-b3b2.up.railway.app/rest/v1/tasks     # expect 401
   ```
   and confirm the Herme chat still persists a message.
5. **Follow-up, not part of this deploy:** give the web service its own
   `FARM_APP_WRITE_TOKEN` value, change `sbServiceFetch` to send it, then rotate
   `SUPABASE_SERVICE_ROLE_KEY`.

`gatis-bridge` is unaffected: it talks to Postgres directly. No bridge redeploy.

## Rollback

1. **Roll back the `farm-api` deployment** to the previous Railway revision. That
   restores the old code, which ignores the new variables entirely — no variable
   change is needed to roll back, and no caller has to change.
2. Leave the four variables in place; the old revision does not read them.
3. Rolling back **re-opens the unauthenticated write hole**, so treat it as an
   incident stop-gap, not a resting state.
4. If instead only the `app` scope misbehaves, the narrower rollback is to correct
   `FARM_APP_WRITE_TOKEN` and restart — no redeploy of the web service required.

## Repeat-safe writes

`POST /rest/v1/tasks` and `POST /rest/v1/agent_events` reuse an identical row
written within the last 10 minutes instead of inserting a duplicate — the same
behaviour the agent bridge already has. A reused row returns `200` with
`X-Idempotent-Reuse: <n>`; a genuinely new row returns `201`.

## Tests

```
cd farm-api && npm install && npm test          # fast, in-memory fake pool
npm install --no-save embedded-postgres && npm run test:pg   # real PostgreSQL
```

`npm test` runs against an in-memory fake pool (`test/fake-pool.js`).
`npm run test:pg` boots a **real, disposable PostgreSQL cluster** in a temp
directory, creates an empty `farm` schema, runs the negative, positive,
regression, idempotency and partial-write tests against it, and destroys it. It
skips cleanly when `embedded-postgres` is not installed. Neither suite ever
touches production data. It covers unauthenticated rejection (asserting the database
was never reached), least-privilege rejection, authorized Hermes and agent writes,
read-path and RPC regressions, and retry idempotency. Credential strings in the
tests are throwaway local fixtures, not real values.
