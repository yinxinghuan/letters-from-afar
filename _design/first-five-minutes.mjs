import assert from 'node:assert/strict';

const paths = [
  {
    id: 'inspect-postmark',
    beats: [8, 8, 9, 8],
    firstChoice: 10,
    routeDecision: 42,
    payoff: 96,
    stateChanges: ['clue:+1', 'route:tide-post-known', 'depart:saltmarsh']
  },
  {
    id: 'ask-ada',
    beats: [8, 8, 9, 8],
    firstChoice: 12,
    routeDecision: 48,
    payoff: 112,
    stateChanges: ['character:ada-known', 'promise:undelivered-reply', 'depart:north-ferry']
  },
  {
    id: 'follow-route-mark',
    beats: [8, 8, 9, 8],
    firstChoice: 9,
    routeDecision: 38,
    payoff: 84,
    stateChanges: ['shared-trace:seen', 'route:saltmarsh-safer', 'depart:saltmarsh']
  }
];

for (const path of paths) {
  const openingSeconds = path.beats.reduce((sum, seconds) => sum + seconds, 0);
  const meaningfulAt = openingSeconds + path.firstChoice;
  const routeAt = meaningfulAt + path.routeDecision;
  const payoffAt = routeAt + path.payoff;
  assert.ok(meaningfulAt <= 45, `${path.id}: first consequential input is too late`);
  assert.ok(routeAt <= 120, `${path.id}: route decision is too late`);
  assert.ok(payoffAt <= 300, `${path.id}: first payoff is too late`);
  assert.ok(path.stateChanges.length >= 3, `${path.id}: opening must change state, not only prose`);
}

console.log(JSON.stringify({passed: paths.length, paths}, null, 2));
