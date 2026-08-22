import assert from 'node:assert/strict';

const GRAPH = {
  rain_coast: ['longwind_steppe', 'lakewood'],
  longwind_steppe: ['rain_coast', 'broken_rail_basin', 'redland_plateau'],
  lakewood: ['rain_coast', 'broken_rail_basin', 'white_ridge'],
  broken_rail_basin: ['longwind_steppe', 'lakewood', 'redland_plateau'],
  redland_plateau: ['longwind_steppe', 'broken_rail_basin', 'white_ridge'],
  white_ridge: ['lakewood', 'redland_plateau', 'farshore_isles'],
  farshore_isles: ['white_ridge']
};

const REGION_IDS = Object.keys(GRAPH);

function rng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function choose(random, values) {
  return values[Math.floor(random() * values.length)];
}

function makeState(seed) {
  return {
    seed,
    location: 'rain_coast',
    energy: 72,
    funds: 8,
    supplies: 0,
    clues: 0,
    visited: new Set(['rain_coast']),
    activeIncident: null,
    incidentAge: 0,
    lastAction: null,
    sameActionCount: 0,
    steps: 0,
    journeyCount: 0,
    incidentCount: 0,
    rests: 0,
    paidActions: 0,
    earnedActions: 0,
    sharedActions: 0,
    history: []
  };
}

function actions(state) {
  if (state.energy === 0) {
    return [{id:'recover', kind:'recovery'}];
  }
  if (state.activeIncident) {
    return [
      {id:`resolve:${state.activeIncident}`, kind:'incident'},
      {id:`investigate:${state.activeIncident}`, kind:'incident'},
      {id:`retreat:${state.activeIncident}`, kind:'retreat'}
    ];
  }
  const list = GRAPH[state.location].map((to) => ({id:`travel:${to}`, kind:'travel', to}));
  if (state.energy < 88) list.push({id:'rest', kind:'rest'});
  if (state.funds >= 3 && state.supplies < 2) {
    list.push({id:'buy-specific-supply:3', kind:'spend', amount:3, consent:true});
  }
  return list.slice(0, 5);
}

function apply(state, action, random) {
  const before = {...state};
  state.steps += 1;

  if (action.id === state.lastAction) state.sameActionCount += 1;
  else state.sameActionCount = 1;
  state.lastAction = action.id;
  assert.ok(state.sameActionCount <= 3, `unproductive loop: ${action.id}`);

  switch (action.kind) {
    case 'recovery':
      state.energy = 35;
      state.rests += 1;
      break;
    case 'rest':
      state.energy = Math.min(100, state.energy + 20);
      state.rests += 1;
      assert.ok(state.energy >= before.energy);
      break;
    case 'spend':
      assert.equal(action.consent, true);
      assert.ok(state.funds >= action.amount);
      state.funds -= action.amount;
      state.supplies += 1;
      state.paidActions += 1;
      break;
    case 'incident':
      state.incidentAge += 1;
      if (action.id.startsWith('resolve:') || state.incidentAge >= 3) {
        state.energy = Math.max(0, state.energy - (4 + Math.floor(random() * 7)));
        state.activeIncident = null;
        state.incidentAge = 0;
      }
      break;
    case 'retreat':
      state.activeIncident = null;
      state.incidentAge = 0;
      state.energy = Math.max(0, state.energy - 2);
      break;
    case 'travel': {
      assert.ok(GRAPH[state.location].includes(action.to));
      state.energy = Math.max(0, state.energy - (6 + Math.floor(random() * 9)));
      if (state.supplies > 0 && random() < 0.22) state.supplies -= 1;
      state.location = action.to;
      state.visited.add(action.to);
      state.journeyCount += 1;
      if (random() < 0.32) {
        state.activeIncident = `route-${state.location}-${state.steps}`;
        state.incidentAge = 0;
        state.incidentCount += 1;
      }
      if (random() < 0.22 && state.clues < 12) state.clues += 1;
      if (random() < 0.18) {
        state.funds = Math.min(99, state.funds + 4);
        state.earnedActions += 1;
      }
      if (random() < 0.16) state.sharedActions += 1;
      break;
    }
    default:
      throw new Error(`unknown action kind ${action.kind}`);
  }

  assert.ok(REGION_IDS.includes(state.location));
  assert.ok(state.energy >= 0 && state.energy <= 100);
  assert.ok(state.funds >= 0 && state.funds <= 99);
  assert.ok(state.supplies >= 0 && state.supplies <= 2);
  assert.ok(state.clues >= 0 && state.clues <= 12);
  assert.ok(state.incidentAge <= 3);
  state.history.push(action.id);
}

function strategyFor(archetype, state, available, random) {
  if (available.length === 1) return available[0];
  const incident = available.filter((a) => a.kind === 'incident' || a.kind === 'retreat');
  if (incident.length) {
    if (archetype === 'cautious') return incident.find((a) => a.kind === 'retreat') ?? incident[0];
    return incident.find((a) => a.id.startsWith('resolve:')) ?? incident[0];
  }
  const rest = available.find((a) => a.kind === 'rest');
  if (rest && state.energy < (archetype === 'cautious' ? 58 : 28)) return rest;
  const travel = available.filter((a) => a.kind === 'travel');
  if (archetype === 'explorer') {
    const unvisited = travel.filter((a) => !state.visited.has(a.to));
    if (unvisited.length) return choose(random, unvisited);
  }
  if (archetype === 'mainline') {
    const priority = ['longwind_steppe','broken_rail_basin','redland_plateau','white_ridge','farshore_isles'];
    const forward = travel
      .filter((a) => priority.includes(a.to))
      .sort((a,b) => priority.indexOf(b.to) - priority.indexOf(a.to));
    if (forward.length) return forward[0];
  }
  if (archetype === 'helper') {
    const spend = available.find((a) => a.kind === 'spend');
    if (spend && state.funds >= 9 && random() < 0.45) return spend;
  }
  return choose(random, travel.length ? travel : available);
}

function run(seed, archetype, maxSteps = 80) {
  const random = rng(seed);
  const state = makeState(seed);
  while (state.steps < maxSteps) {
    const available = actions(state);
    assert.ok(available.length >= 1 && available.length <= 5);
    if (state.activeIncident) {
      assert.ok(available.every((a) => a.kind === 'incident' || a.kind === 'retreat'));
    }
    apply(state, strategyFor(archetype, state, available, random), random);
  }
  return state;
}

const archetypes = ['mainline', 'explorer', 'helper', 'cautious'];
const summaries = [];
for (const archetype of archetypes) {
  const runs = [];
  for (let i = 1; i <= 50; i += 1) runs.push(run(i * 7919, archetype));
  summaries.push({
    archetype,
    runs: runs.length,
    minVisited: Math.min(...runs.map((s) => s.visited.size)),
    maxVisited: Math.max(...runs.map((s) => s.visited.size)),
    minEnergy: Math.min(...runs.map((s) => s.energy)),
    maxClues: Math.max(...runs.map((s) => s.clues)),
    totalIncidents: runs.reduce((n,s) => n + s.incidentCount, 0),
    totalRests: runs.reduce((n,s) => n + s.rests, 0),
    totalSharedActions: runs.reduce((n,s) => n + s.sharedActions, 0),
    unfinishedIncidents: runs.filter((s) => s.activeIncident).length
  });
}

console.log(JSON.stringify({passedRuns: 200, stepsPerRun: 80, summaries}, null, 2));
