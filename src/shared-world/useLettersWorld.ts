import { useCallback, useEffect, useMemo, useState } from 'react'
import { telegramId } from '../shared/runtime/bridge'
import { getGameApiBase } from '../shared/runtime/game-id'
import type { PlayerProfile } from '../story/usePlayerProfile'
import { readSharedWorld } from './engine'
import { LocalSharedWorldGateway, RemoteSharedWorldGateway } from './gateway'
import type { CommitCode, RelayLetter, RelayReceipt, SharedWorldAction, SharedWorldArchive, SharedWorldView } from './types'

export function useLettersWorld(profile: PlayerProfile, applyRelayReceipt: (receipt: RelayReceipt) => Promise<void>) {
  const query = useMemo(() => new URLSearchParams(window.location.search), [])
  const localMode = query.get('local') === '1'
  const apiBase = query.get('api_base') || (localMode ? '' : getGameApiBase())
  const gateway = useMemo(() => apiBase ? new RemoteSharedWorldGateway(apiBase) : new LocalSharedWorldGateway(), [apiBase])
  const actor = useMemo(() => gateway.mode === 'local'
    ? { id: query.get('actor') === 'second' ? 'traveler-second' : 'traveler-first', name: query.get('actor') === 'second' ? 'Second Traveler' : profile.name }
    : { id: String(telegramId || '__alteru_guest__'), name: profile.name, ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}) }, [gateway.mode, profile.avatarUrl, profile.name, query])
  const [archive, setArchive] = useState<SharedWorldArchive | null>(null)
  const [view, setView] = useState<SharedWorldView | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<CommitCode | 'NETWORK_ERROR' | null>(null)
  const canWrite = gateway.mode === 'local' || actor.id !== '__alteru_guest__'

  const reconcileReceipts = useCallback(async (direct: RelayReceipt[] = []) => {
    if (!canWrite) return
    const pending = await gateway.pendingReceipts(actor.id).catch(() => [])
    const unique = [...direct, ...pending].filter((receipt, index, all) => all.findIndex((candidate) => candidate.id === receipt.id) === index)
    for (const receipt of unique) {
      await applyRelayReceipt(receipt)
      await gateway.acknowledgeReceipt(actor.id, receipt.id)
    }
  }, [actor.id, applyRelayReceipt, canWrite, gateway])

  const refresh = useCallback(async () => {
    const next = await gateway.load(view?.cursor ?? 0)
    setArchive(next.archive); setView(next.view); setError(null)
    await reconcileReceipts()
    return next
  }, [gateway, reconcileReceipts, view?.cursor])

  useEffect(() => { refresh().catch(() => setError('NETWORK_ERROR')) }, [gateway])
  useEffect(() => {
    if (gateway.mode !== 'remote') return
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible' && !busy) refresh().catch(() => {}) }, 15_000)
    return () => window.clearInterval(timer)
  }, [busy, gateway.mode, refresh])

  const commit = useCallback(async (type: SharedWorldAction['type'], payload: SharedWorldAction['payload']) => {
    if (!archive || busy || !canWrite) return null
    const action = { actionId: crypto.randomUUID(), actor, expectedVersion: archive.version, rulesetId: archive.rulesetId, createdAt: Date.now(), type, payload } as SharedWorldAction
    setBusy(true)
    try {
      const result = await gateway.commit(action)
      await reconcileReceipts(result.receipts)
      setArchive(result.archive); setView(readSharedWorld(result.archive)); setError(null)
      return result
    } catch (caught) {
      const code = typeof caught === 'object' && caught && 'code' in caught ? String((caught as { code: string }).code) as CommitCode : 'NETWORK_ERROR'
      const latest = await gateway.load(0).catch(() => null)
      if (latest) { setArchive(latest.archive); setView(latest.view) }
      setError(code)
      return null
    } finally { setBusy(false) }
  }, [actor, archive, busy, canWrite, gateway, reconcileReceipts])

  const claimRelay = useCallback((relay: RelayLetter) => commit('claim_relay', { relayId: relay.id }), [commit])
  const deliverRelay = useCallback((relay: RelayLetter, locationId: string) => commit('deliver_relay', { relayId: relay.id, locationId }), [commit])
  const leavePassableTrace = useCallback((routeId: string, locationId: string) => commit('leave_trace', { routeId, locationId, kind: 'passable' }), [commit])
  const contributeRoute = useCallback((routeId: string) => commit('contribute_route', { routeId, amount: 1 }), [commit])

  return { actor, archive, view, busy, error, mode: gateway.mode, canWrite, refresh, claimRelay, deliverRelay, leavePassableTrace, contributeRoute }
}
