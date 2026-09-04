import { spawnSync } from 'node:child_process'

const scripts = [
  'test:security',
  'test:choices',
  'test:payment',
  'test:turn',
  'test:dynamic-locations',
  'test:pipeline',
  'test:deterministic-choices',
  'test:domain',
  'test:authority-shadow',
  'test:domain-continuity',
  'test:recovery-choice-priority',
  'test:active-thread',
  'test:extended-continuity',
  'test:choice-quality',
  'test:multiturn',
  'test:preset-events',
  'test:image-director',
  'test:resume',
  'test:audio',
  'test:opening-density',
  'test:stat-floor',
  'test:rest-recovery',
  'test:generated-characters',
  'test:danger',
  'test:danger-loop',
  'test:loop-escape',
  'test:slice',
  'test:story-session-client',
  'test:story-session-persistence',
  'test:story-session-directory',
  'test:story-session-migration',
  'test:story-session-shared-boundary',
  'test:story-session-history-browser',
]

for (const script of scripts) {
  const result = spawnSync('npm', ['run', script], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

console.log(`Letters from Afar unified regression: ${scripts.length} suites passed.`)
