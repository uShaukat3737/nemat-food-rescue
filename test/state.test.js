const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const STATE_SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'state.js'), 'utf8');

// Loads js/state.js in a fake browser whose fetch is `fetchImpl`.
function loadState(fetchImpl) {
  const store = new Map();
  const sandbox = {
    fetch: fetchImpl,
    localStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
    console: { log() {}, warn() {}, error() {} },
    window: {},
  };
  vm.createContext(sandbox);
  vm.runInContext(STATE_SRC, sandbox);
  return sandbox.window.NematState;
}

function apiResponse(status, body) {
  return async () => ({ ok: status < 400, status, json: async () => body });
}

test('reserveBag fails and stores nothing when the API rejects the booking', async () => {
  const state = loadState(apiResponse(409, { error: 'Maximum 2 active reservations allowed per customer (FR-25).' }));
  const before = state.state.reservations.length;

  const result = await state.reserveBag('drop-1');

  assert.strictEqual(result.success, false);
  assert.match(result.message, /Maximum 2 active reservations/);
  assert.strictEqual(state.state.reservations.length, before);
});

test('verifyPickupCode fails when the API rejects a code for a saved reservation', async () => {
  const state = loadState(apiResponse(409, { error: 'Invalid code, or bag already collected.' }));
  state.state.reservations.unshift({ id: 'res-x', code: '4321', status: 'RESERVED', persisted: true });

  const result = await state.verifyPickupCode('4321');

  assert.strictEqual(result.success, false);
  assert.strictEqual(state.state.reservations[0].status, 'RESERVED');
});
