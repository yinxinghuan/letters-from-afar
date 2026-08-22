import assert from 'node:assert/strict';

const paths = [
  {
    id: 'inspect-postmark',
    beats: [7, 7, 8],
    firstChoice: 9,
    routeDecision: 40,
    payoff: 96,
    stateChanges: ['future-date:seen', 'clue:+1', 'depart:saltmarsh']
  },
  {
    id: 'ask-ada',
    beats: [7, 7, 8],
    firstChoice: 10,
    routeDecision: 44,
    payoff: 108,
    stateChanges: ['mail-slot:checked', 'future-date:seen', 'depart:saltmarsh']
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
