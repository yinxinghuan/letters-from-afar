import { resolveCartridge } from '../src/story/cartridges'
import { aigramAdapter } from '../src/story/adapters/aigram'
import { executeStoryTurn } from '../src/story/engine/executeTurn'
import { normalizeSave } from '../src/story/useStoryEngine'
import { applyRelayReceiptToSave } from '../src/shared-world/receipt'
import { LettersWorld, handleWorldApi } from './worldSource.js'
import { createStorySessionRuntime } from './storySessionRuntime'

const runtime = createStorySessionRuntime({
  gameId: 'letters-from-afar',
  resolveCartridge: locale => resolveCartridge(null, locale),
  normalizeSave,
  executeTurn: executeStoryTurn as any,
  generator: aigramAdapter,
  applyMutation: (save, mutation) => {
    if (mutation?.type !== 'relay-receipt' || !mutation.receipt) throw new Error('INVALID_RELAY_RECEIPT')
    return applyRelayReceiptToSave(save, mutation.receipt, save.locale)
  },
})

export { LettersWorld }
export const StorySessionAuthority = runtime.StorySessionAuthority

export async function handleApi(request: Request, env: any) {
  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/story/')) return runtime.handleStoryApi(request, env)
  return handleWorldApi(request, env)
}
