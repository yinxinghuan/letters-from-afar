import assert from 'node:assert/strict';

const ROUTES = {
  rain_coast: ['longwind_steppe', 'lakewood'],
  longwind_steppe: ['rain_coast', 'broken_rail_basin', 'redland_plateau'],
  lakewood: ['rain_coast', 'broken_rail_basin', 'white_ridge'],
  broken_rail_basin: ['longwind_steppe', 'lakewood', 'redland_plateau'],
  redland_plateau: ['longwind_steppe', 'broken_rail_basin', 'white_ridge'],
  white_ridge: ['lakewood', 'redland_plateau', 'farshore_isles'],
  farshore_isles: ['white_ridge']
};

function initialState() {
  return {
    location: 'rain_coast',
    destination: null,
    journey: null,
    activeIncident: null,
    energy: 72,
    funds: 8,
    clues: 0,
    inventory: new Map([['future_letter', 1]]),
    known: new Set(['rain_coast', 'longwind_steppe', 'lakewood']),
    choices: [],
    actionIds: new Map(),
    worldVersion: 1,
    cursor: 0,
    pendingReceipts: new Set(),
    history: []
  };
}

function clone(state) {
  return {
    ...state,
    inventory: new Map(state.inventory),
    known: new Set(state.known),
    actionIds: new Map(state.actionIds),
    pendingReceipts: new Set(state.pendingReceipts),
    history: [...state.history],
    choices: [...state.choices],
    journey: state.journey ? {...state.journey} : null,
    activeIncident: state.activeIncident ? {...state.activeIncident} : null
  };
}

function groundedChoices(state) {
  if (state.activeIncident) {
    const incident = state.activeIncident;
    return [
      {id:`address:${incident.id}`, kind:'incident', label:`处理${incident.label}`},
      {id:`inspect:${incident.id}`, kind:'incident', label:`先确认${incident.label}的具体情况`},
      {id:`retreat:${incident.id}`, kind:'retreat', label:`承担后果并离开${incident.label}`}
    ];
  }
  if (state.journey && state.journey.stage !== 'arrived') {
    return [
      {id:`continue:${state.journey.id}`, kind:'journey', label:`继续前往${state.journey.to}`},
      {id:`rest:${state.journey.id}`, kind:'rest', label:'在当前路段短休'},
      {id:`turnback:${state.journey.id}`, kind:'journey', label:`沿原路返回${state.journey.from}`}
    ];
  }
  return ROUTES[state.location]
    .filter((id) => state.known.has(id))
    .map((id) => ({id:`travel:${id}`, kind:'travel', label:`查看前往${id}的路线`}));
}

function assertPlayable(state) {
  const choices = groundedChoices(state);
  assert.ok(choices.length >= 1 && choices.length <= 5, 'every state exposes 1–5 grounded actions');
  if (state.activeIncident) {
    assert.ok(choices.every((choice) => choice.kind === 'incident' || choice.kind === 'retreat'));
  }
  return {...state, choices};
}

function transact(state, actionId, reducer) {
  if (state.actionIds.has(actionId)) return clone(state.actionIds.get(actionId));
  const next = assertPlayable(reducer(clone(state)));
  next.actionIds.set(actionId, clone(next));
  return next;
}

function startJourney(state, to) {
  assert.equal(state.activeIncident, null, 'cannot silently abandon an active incident');
  assert.ok(ROUTES[state.location].includes(to), 'destination must be adjacent');
  assert.ok(state.known.has(to), 'destination must be known');
  state.destination = to;
  state.journey = {id:`${state.location}->${to}`, from:state.location, to, stage:'departed'};
  state.energy = Math.max(0, state.energy - 8);
  state.history.push(`departed:${state.journey.id}`);
  return state;
}

function triggerIncident(state, id, label) {
  assert.ok(state.journey, 'route incidents require an active journey');
  state.activeIncident = {id, label};
  state.journey.stage = 'interrupted';
  state.history.push(`incident:${id}`);
  return state;
}

function resolveIncident(state, energyCost = 6) {
  assert.ok(state.activeIncident);
  state.energy = Math.max(0, state.energy - energyCost);
  state.history.push(`resolved:${state.activeIncident.id}`);
  state.activeIncident = null;
  if (state.journey) state.journey.stage = 'en_route';
  return state;
}

function arrive(state) {
  assert.equal(state.activeIncident, null);
  assert.ok(state.journey);
  state.location = state.journey.to;
  state.destination = null;
  state.journey.stage = 'arrived';
  state.history.push(`arrived:${state.location}`);
  state.journey = null;
  ROUTES[state.location].forEach((id) => state.known.add(id));
  return state;
}

function shortRest(state) {
  const before = state.energy;
  state.energy = Math.min(100, state.energy + 12);
  assert.ok(state.energy >= before, 'explicit rest cannot reduce energy');
  state.history.push('rest:+12');
  return state;
}

function spend(state, amount, consent) {
  assert.equal(consent, true, 'money cannot be spent without explicit consent');
  assert.ok(state.funds >= amount, 'cannot overspend');
  state.funds -= amount;
  state.history.push(`funds:-${amount}`);
  return state;
}

function earn(state, amount) {
  state.funds = Math.min(99, state.funds + amount);
  state.history.push(`funds:+${amount}`);
  return state;
}

function recoverAtZero(state) {
  assert.equal(state.energy, 0);
  state.energy = 35;
  state.history.push('forced-recovery:+35');
  return state;
}

function commitShared(state, {actionId, expectedVersion, event, receiptId}) {
  if (state.actionIds.has(actionId)) return clone(state.actionIds.get(actionId));
  assert.equal(expectedVersion, state.worldVersion, 'stale version must refresh before commit');
  state.worldVersion += 1;
  state.cursor += 1;
  state.history.push(`shared:${event}`);
  if (receiptId) state.pendingReceipts.add(receiptId);
  state.actionIds.set(actionId, clone(state));
  return state;
}

function acknowledgeReceipt(state, receiptId, privateSaveReadback) {
  assert.equal(privateSaveReadback, true, 'receipt ack requires private-save readback');
  assert.ok(state.pendingReceipts.has(receiptId));
  state.pendingReceipts.delete(receiptId);
  state.history.push(`receipt-acked:${receiptId}`);
  return state;
}

function simulate(name, fn) {
  const state = assertPlayable(fn(initialState()));
  return {
    name,
    location: state.location,
    energy: state.energy,
    funds: state.funds,
    clues: state.clues,
    worldVersion: state.worldVersion,
    cursor: state.cursor,
    activeIncident: state.activeIncident?.id ?? null,
    journey: state.journey?.id ?? null,
    choices: state.choices.map((choice) => choice.id),
    history: state.history
  };
}

const reports = [];

reports.push(simulate('direct-route-with-incident', (s) => {
  s = transact(s, 'a1', (x) => startJourney(x, 'longwind_steppe'));
  s = transact(s, 'a2', (x) => triggerIncident(x, 'washed_bridge', '被冲坏的木桥'));
  assert.ok(groundedChoices(s).every((choice) => !choice.id.startsWith('travel:')));
  s = transact(s, 'a3', (x) => resolveIncident(x, 6));
  return transact(s, 'a4', arrive);
}));

reports.push(simulate('rest-preserves-journey', (s) => {
  s = transact(s, 'b1', (x) => startJourney(x, 'lakewood'));
  const journeyId = s.journey.id;
  s = transact(s, 'b2', shortRest);
  assert.equal(s.journey.id, journeyId);
  return transact(s, 'b3', arrive);
}));

reports.push(simulate('payment-and-wage', (s) => {
  s = transact(s, 'c1', (x) => earn(x, 9));
  assert.equal(s.funds, 17);
  s = transact(s, 'c2', (x) => spend(x, 5, true));
  assert.equal(s.funds, 12);
  return s;
}));

reports.push(simulate('zero-energy-recovery', (s) => {
  s.energy = 6;
  s = transact(s, 'd1', (x) => startJourney(x, 'longwind_steppe'));
  assert.equal(s.energy, 0);
  s = transact(s, 'd2', recoverAtZero);
  assert.ok(s.energy > 0);
  assert.ok(s.journey, 'recovery must not erase the journey');
  return s;
}));

reports.push(simulate('shared-idempotency', (s) => {
  s = commitShared(s, {actionId:'e1', expectedVersion:1, event:'repair-road'});
  const once = {version:s.worldVersion, cursor:s.cursor};
  s = commitShared(s, {actionId:'e1', expectedVersion:1, event:'repair-road'});
  assert.deepEqual({version:s.worldVersion, cursor:s.cursor}, once);
  return s;
}));

reports.push(simulate('receipt-roundtrip', (s) => {
  s = commitShared(s, {actionId:'f1', expectedVersion:1, event:'relay-letter-claimed', receiptId:'letter-17'});
  assert.ok(s.pendingReceipts.has('letter-17'));
  s.inventory.set('relay_letter_17', 1);
  return acknowledgeReceipt(s, 'letter-17', true);
}));

reports.push(simulate('offline-world-advance', (s) => {
  s.worldVersion = 8;
  s.cursor = 12;
  s.history.push('reconnected:road-opened-by-others');
  s.known.add('broken_rail_basin');
  return s;
}));

reports.push(simulate('wander-without-main-clues', (s) => {
  s = transact(s, 'h1', (x) => startJourney(x, 'lakewood'));
  s = transact(s, 'h2', arrive);
  s = transact(s, 'h3', (x) => startJourney(x, 'broken_rail_basin'));
  s = transact(s, 'h4', arrive);
  assert.equal(s.clues, 0);
  return s;
}));

reports.push(simulate('explicit-retreat-from-incident', (s) => {
  s = transact(s, 'i1', (x) => startJourney(x, 'longwind_steppe'));
  s = transact(s, 'i2', (x) => triggerIncident(x, 'roadside_fire', '路边仓房起火'));
  return transact(s, 'i3', (x) => {
    x.history.push('retreated:roadside_fire:relationship-cost');
    x.activeIncident = null;
    x.journey.stage = 'en_route';
    return x;
  });
}));

reports.push(simulate('generated-place-stays-on-parent-route', (s) => {
  s = transact(s, 'j1', (x) => startJourney(x, 'lakewood'));
  const place = {id:'rain-coast__lakewood__glass-roof-stop', parentJourney:s.journey.id};
  s.history.push(`generated:${place.id}:${place.parentJourney}`);
  assert.equal(place.parentJourney, 'rain_coast->lakewood');
  return s;
}));

console.log(JSON.stringify({passed: reports.length, reports}, null, 2));
