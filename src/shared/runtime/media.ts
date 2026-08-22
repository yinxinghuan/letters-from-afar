const MEDIA_API_BASE = 'https://game.aiwaves.tech/alteru-media/api'

export type MediaImageMode = 'text' | 'edit'
export type MediaAudioKind = 'music' | 'sfx'

export function fitMediaImageSize(requested: { width: number; height: number }): { width: number; height: number } {
  const width = Math.max(1, requested.width)
  const height = Math.max(1, requested.height)
  const targetRatio = width / height
  const targetArea = Math.min(width * height, 1_572_864)
  let best = { width: 512, height: 512 }
  let bestScore = Number.POSITIVE_INFINITY
  for (let candidateWidth = 256; candidateWidth <= 1536; candidateWidth += 64) {
    for (let candidateHeight = 256; candidateHeight <= 1536; candidateHeight += 64) {
      const area = candidateWidth * candidateHeight
      if (area > 1_572_864) continue
      const score = Math.abs(Math.log((candidateWidth / candidateHeight) / targetRatio)) * 4 + Math.abs(Math.log(area / targetArea))
      if (score < bestScore) { bestScore = score; best = { width: candidateWidth, height: candidateHeight } }
    }
  }
  return best
}

export interface MediaImageTask {
  task_id: string
  request_id: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  media?: { type: 'image'; url: string; width: number; height: number; format: 'png' | 'webp' }
  error?: { code: string; message: string; retryable: boolean }
}

export interface MediaAudioTask {
  task_id: string
  request_id: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  media?: {
    type: 'audio'
    kind: MediaAudioKind
    url: string
    duration_seconds: number
    format: 'mp3'
    sample_rate_hz: 44100
    channels: 2
  }
  error?: { code: string; message: string; retryable: boolean; details?: { retry_after_seconds?: number } }
}

export class MediaServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable: boolean,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message)
    this.name = 'MediaServiceError'
  }
}

export function createMediaRequestId(): string {
  if (!crypto.randomUUID) throw new MediaServiceError('RUNTIME_UNAVAILABLE', 'crypto.randomUUID is unavailable', false)
  return crypto.randomUUID()
}

function requireText(value: string, label: string): string {
  const normalized = value.trim()
  if (!normalized) throw new MediaServiceError('INVALID_REQUEST', `${label} is required`, false)
  return normalized
}

async function readResponse(response: Response): Promise<MediaImageTask> {
  const body = await response.json().catch(() => null) as MediaImageTask & { error?: MediaImageTask['error'] & { details?: { retry_after_seconds?: number } } }
  if (!response.ok) throw new MediaServiceError(
    body?.error?.code ?? 'HTTP_ERROR',
    body?.error?.message ?? `Media Service failed with HTTP ${response.status}`,
    body?.error?.retryable ?? response.status >= 500,
    body?.error?.details?.retry_after_seconds,
  )
  if (body.status === 'failed') throw new MediaServiceError(body.error?.code ?? 'GENERATION_FAILED', body.error?.message ?? 'Image generation failed', body.error?.retryable ?? false)
  return body
}

async function readAudioResponse(response: Response): Promise<MediaAudioTask> {
  const body = await response.json().catch(() => null) as MediaAudioTask
  if (!response.ok) throw new MediaServiceError(
    body?.error?.code ?? 'HTTP_ERROR',
    body?.error?.message ?? `Media Service failed with HTTP ${response.status}`,
    body?.error?.retryable ?? response.status >= 500,
    body?.error?.details?.retry_after_seconds,
  )
  if (body.status === 'failed') throw new MediaServiceError(body.error?.code ?? 'GENERATION_FAILED', body.error?.message ?? 'Audio generation failed', body.error?.retryable ?? false)
  return body
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}

export async function getMediaImageTask(taskId: string): Promise<MediaImageTask> {
  const response = await fetch(`${MEDIA_API_BASE}/v1/tasks/${encodeURIComponent(taskId)}`)
  return readResponse(response)
}

export async function getMediaAudioTask(taskId: string): Promise<MediaAudioTask> {
  const response = await fetch(`${MEDIA_API_BASE}/v1/tasks/${encodeURIComponent(taskId)}`)
  return readAudioResponse(response)
}

async function waitForImage(task: MediaImageTask): Promise<MediaImageTask & { media: NonNullable<MediaImageTask['media']> }> {
  const deadline = Date.now() + 180_000
  let current = task
  while (current.status === 'queued' || current.status === 'running') {
    if (Date.now() >= deadline) throw new MediaServiceError('TIMEOUT', 'Image generation timed out', true)
    await delay(8_000)
    current = await getMediaImageTask(current.task_id)
  }
  if (current.status !== 'succeeded' || current.media?.type !== 'image') throw new MediaServiceError('INVALID_RESPONSE', 'Image task completed without image media', false)
  return current as MediaImageTask & { media: NonNullable<MediaImageTask['media']> }
}

async function waitForAudio(task: MediaAudioTask): Promise<MediaAudioTask & { media: NonNullable<MediaAudioTask['media']> }> {
  const deadline = Date.now() + 180_000
  let current = task
  while (current.status === 'queued' || current.status === 'running') {
    if (Date.now() >= deadline) throw new MediaServiceError('TIMEOUT', 'Audio generation timed out', true)
    await delay(8_000)
    current = await getMediaAudioTask(current.task_id)
  }
  if (current.status !== 'succeeded' || current.media?.type !== 'audio') throw new MediaServiceError('INVALID_RESPONSE', 'Audio task completed without audio media', false)
  return current as MediaAudioTask & { media: NonNullable<MediaAudioTask['media']> }
}

export async function generateMediaImage(input: {
  sessionId: string
  prompt: string
  mode: MediaImageMode
  referenceUrl?: string
  width?: number
  height?: number
  requestId?: string
}): Promise<{ url: string; taskId: string }> {
  const mode: MediaImageMode = input.referenceUrl ? 'edit' : input.mode
  const size = fitMediaImageSize({ width: input.width ?? 768, height: input.height ?? 576 })
  let response: Response
  try {
    response = await fetch(`${MEDIA_API_BASE}/v1/images/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: input.requestId ?? createMediaRequestId(),
        session_id: input.sessionId,
        mode,
        prompt: input.prompt,
        reference_urls: input.referenceUrl ? [input.referenceUrl] : [],
        size,
      }),
    })
  } catch (cause) {
    throw new MediaServiceError('NETWORK_ERROR', cause instanceof Error ? cause.message : 'Media Service network request failed', true)
  }
  const completed = await waitForImage(await readResponse(response))
  return { url: completed.media.url, taskId: completed.task_id }
}

export async function generateAudioMedia(input: {
  sessionId: string
  kind: MediaAudioKind
  prompt: string
  durationSeconds: number
  requestId?: string
}): Promise<{ url: string; taskId: string; durationSeconds: number }> {
  if (!Number.isFinite(input.durationSeconds) || input.durationSeconds < 0.5 || input.durationSeconds > 120) {
    throw new MediaServiceError('INVALID_REQUEST', 'durationSeconds must be between 0.5 and 120', false)
  }
  const sessionId = requireText(input.sessionId, 'sessionId')
  const prompt = requireText(input.prompt, 'prompt')
  let response: Response
  try {
    response = await fetch(`${MEDIA_API_BASE}/v1/audio/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: input.requestId ?? createMediaRequestId(),
        session_id: sessionId,
        kind: input.kind,
        prompt,
        duration_seconds: input.durationSeconds,
      }),
    })
  } catch (cause) {
    throw new MediaServiceError('NETWORK_ERROR', cause instanceof Error ? cause.message : 'Media Service network request failed', true)
  }
  const completed = await waitForAudio(await readAudioResponse(response))
  return { url: completed.media.url, taskId: completed.task_id, durationSeconds: completed.media.duration_seconds }
}
