'use strict';
// In-memory stand-in for pg.Pool. Local tests only — never used in production.
// It records every statement so a test can assert that a rejected request
// never reached the database.

function makeFakePool() {
  const store = { tasks: [], agent_events: [], agents: [], agent_status: [], subscriptions: [] };
  const calls = [];
  let nextId = 1000;

  function tableOf(sql) {
    const m = /farm\."(\w+)"|farm\.(\w+)/.exec(sql);
    return m ? (m[1] || m[2]) : null;
  }

  async function run(sql, values = []) {
    calls.push({ sql, values });
    const text = String(sql);
    if (/^\s*(BEGIN|COMMIT|ROLLBACK)/i.test(text)) return { rows: [] };

    const table = tableOf(text);
    if (!table) return { rows: [] };
    if (!store[table]) store[table] = [];

    // duplicate lookup used by the idempotent insert path
    if (/^\s*SELECT \* FROM/i.test(text) && /created_at > now\(\)/.test(text)) {
      const cols = [...text.matchAll(/"(\w+)" = \$(\d+)/g)].map(m => [m[1], Number(m[2])]);
      const hit = store[table].find(row => cols.every(([c, i]) => String(row[c]) === String(values[i - 1])));
      return { rows: hit ? [hit] : [] };
    }

    if (/^\s*INSERT INTO/i.test(text)) {
      const colBlock = /\(([^)]*)\) VALUES/i.exec(text);
      const cols = colBlock ? colBlock[1].split(',').map(c => c.trim().replace(/"/g, '')) : [];
      const row = { id: String(nextId++), created_at: new Date().toISOString() };
      cols.forEach((c, i) => { row[c] = values[i]; });
      store[table].push(row);
      return { rows: [row] };
    }

    if (/^\s*UPDATE/i.test(text)) {
      const sets = [...text.matchAll(/"(\w+)"=\$(\d+)/g)].map(m => [m[1], Number(m[2])]);
      const target = store[table][store[table].length - 1];
      if (!target) return { rows: [] };
      sets.forEach(([c, i]) => { target[c] = values[i - 1]; });
      return { rows: [target] };
    }

    if (/count\(\*\)/i.test(text)) return { rows: [{ agents: 0, statuses: 0, subscriptions: 0 }] };
    return { rows: store[table] };
  }

  return {
    store,
    calls,
    reset() { calls.length = 0; Object.keys(store).forEach(k => { store[k].length = 0; }); },
    query: (sql, values) => run(sql, values),
    connect: async () => ({ query: (sql, values) => run(sql, values), release() {} })
  };
}

module.exports = { makeFakePool };
