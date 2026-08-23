import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chooseStoryAudioCue } from '../src/story/audio/cueDirector'
import { generateAudioMedia, MediaServiceError } from '../src/shared/runtime/media'
import { createAmbientTexture, RECORDED_SOUND_PROFILE, resolveRecordedAmbience, shouldReplayRecordedBed, SFX_OUTPUT_PROFILE, StorySynth, SYNTH_AMBIENT_PROFILE } from '../src/story/audio/StorySynth'
import type { StoryAudioTheme, StoryBlock } from '../src/story/types'

function seededRandom(seed = 173): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x1_0000_0000
  }
}

const sampleRate = 8_000
const [left, right] = createAmbientTexture(sampleRate, 'wayfarer', seededRandom())
assert.equal(left.length, sampleRate * SYNTH_AMBIENT_PROFILE.textureSeconds)
assert.equal(right.length, left.length)
assert.notDeepEqual(Array.from(left.slice(0, 256)), Array.from(right.slice(0, 256)), 'stereo channels must not duplicate')

function rms(values: Float32Array): number {
  return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length)
}

const edge = Math.floor(sampleRate * .08)
const leftStart = rms(left.slice(0, edge))
const leftEnd = rms(left.slice(-edge))
assert.ok(Math.abs(20 * Math.log10(leftStart / leftEnd)) < 4, 'loop edges must remain energy-compatible')
assert.ok(Math.abs(left[0] - left.at(-1)!) < .08, 'loop boundary must not create a large click')

const recordedTheme: StoryAudioTheme = {
  material: 'wayfarer', bpm: 64, rootHz: 146.83, scale: [0, 2, 5, 7, 9],
  levels: { music: .04, ambient: .12, sfx: .17, master: .72 },
  tension: [],
  recorded: {
    music: { src: 'road-theme.mp3', gain: .22 },
    ambience: { src: 'road.mp3', gain: .3 },
    ambienceByLocationId: { 'old-post-office': { src: 'coast.mp3', gain: .34, replay: 'once-per-visit' } },
    cues: { travel: { src: 'arrival.mp3', gain: .62 } },
  },
}
assert.equal(resolveRecordedAmbience(recordedTheme, 'old-post-office')?.src, 'coast.mp3')
assert.equal(resolveRecordedAmbience(recordedTheme, 'old-post-office')?.replay, 'once-per-visit')
assert.equal(resolveRecordedAmbience(recordedTheme, 'unknown-place')?.src, 'road.mp3')
assert.equal(shouldReplayRecordedBed('ambient', resolveRecordedAmbience(recordedTheme, 'old-post-office')!), false)
assert.equal(shouldReplayRecordedBed('ambient', resolveRecordedAmbience(recordedTheme, 'unknown-place')!), true)
assert.equal(shouldReplayRecordedBed('music', { src: 'theme.mp3', gain: .2, replay: 'once-per-visit' }), true)
assert.equal(RECORDED_SOUND_PROFILE.maxCueVoices, 2)
assert.ok(SFX_OUTPUT_PROFILE.gainScale <= .52)
assert.ok(SFX_OUTPUT_PROFILE.minimumCueIntervalSeconds >= .18)
assert.ok(RECORDED_SOUND_PROFILE.musicRepeatDelayMs >= 5_000)
assert.ok(RECORDED_SOUND_PROFILE.ambienceRepeatDelayMs >= 5_000)

class FakeAudioElement {
  preload = ''
  currentTime = 0
  volume = 1
  playCount = 0
  pauseCount = 0
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(public readonly src: string) {}
  play(): Promise<void> { this.playCount += 1; return Promise.resolve() }
  pause(): void { this.pauseCount += 1 }
}

Object.assign(globalThis, {
  window: { setTimeout, clearTimeout },
  document: { hidden: false },
  Audio: FakeAudioElement,
})
const visitSynth = new StorySynth() as unknown as {
  theme: StoryAudioTheme
  unlocked: boolean
  recordedAmbience: FakeAudioElement
  syncRecordedAmbience: (track: NonNullable<StoryAudioTheme['recorded']>['ambience'], restartVisit?: boolean) => void
  resumeRecordedBeds: () => void
}
visitSynth.theme = recordedTheme
visitSynth.unlocked = true
const oneVisitTrack = resolveRecordedAmbience(recordedTheme, 'old-post-office')!
visitSynth.syncRecordedAmbience(oneVisitTrack)
await Promise.resolve()
assert.equal(visitSynth.recordedAmbience.playCount, 1, 'ambience starts once on location entry')
visitSynth.recordedAmbience.onended?.()
visitSynth.resumeRecordedBeds()
assert.equal(visitSynth.recordedAmbience.playCount, 1, 'completed ambience stays silent on resume during the same visit')
visitSynth.syncRecordedAmbience(oneVisitTrack, true)
await Promise.resolve()
assert.equal(visitSynth.recordedAmbience.playCount, 2, 'entering a new location visit permits one fresh ambience play')
await assert.rejects(
  () => generateAudioMedia({ sessionId: 'test-session', kind: 'sfx', prompt: 'test', durationSeconds: 0.25 }),
  (error: unknown) => error instanceof MediaServiceError && error.code === 'INVALID_REQUEST',
)
await assert.rejects(
  () => generateAudioMedia({ sessionId: ' ', kind: 'music', prompt: 'test', durationSeconds: 5 }),
  (error: unknown) => error instanceof MediaServiceError && error.code === 'INVALID_REQUEST',
)
await assert.rejects(
  () => generateAudioMedia({ sessionId: 'test-session', kind: 'music', prompt: ' ', durationSeconds: 5 }),
  (error: unknown) => error instanceof MediaServiceError && error.code === 'INVALID_REQUEST',
)

const block = (kind: StoryBlock['kind'], data: StoryBlock['data'] = {}, text = ''): StoryBlock => ({ id: `${kind}-${Math.random()}`, kind, text, data })
assert.equal(chooseStoryAudioCue([block('change', { stat: 'coin', delta: 6 })]), 'coinGain')
assert.equal(chooseStoryAudioCue([block('change', { stat: 'coin', delta: -3 })]), 'coinSpend')
assert.equal(chooseStoryAudioCue([block('change', { stat: 'energy', delta: -7 })]), null)
assert.equal(chooseStoryAudioCue([block('change', { stat: 'renown', delta: 2 })]), null)
assert.equal(chooseStoryAudioCue([block('change', { relationshipChange: 'trusted' })]), 'relationship')
assert.equal(chooseStoryAudioCue([block('event', { arrival: 'Silverleaf' })]), 'travel')
assert.equal(chooseStoryAudioCue([block('change', { itemAction: 'add' })]), 'item')
assert.equal(chooseStoryAudioCue([block('change', { itemAction: 'add', rarity: 'rare' })]), 'treasure')
assert.equal(chooseStoryAudioCue([block('check', { outcome: 'success' })]), 'success')
assert.equal(chooseStoryAudioCue([block('check', { outcome: 'failure' })]), 'failure')
assert.equal(chooseStoryAudioCue([block('event')]), null)
assert.equal(chooseStoryAudioCue([block('narration')]), null)

const shell = await readFile(new URL('../src/story/StoryShell.tsx', import.meta.url), 'utf8')
assert.doesNotMatch(shell, /audio\.cue\('image'\)/, 'image completion must stay silent')

console.log('hybrid audio contract passed')
