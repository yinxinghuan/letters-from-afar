import type { Locale, StorySave } from '../story/types'
import type { RelayReceipt } from './types'

export function applyRelayReceiptToSave(current: StorySave, receipt: RelayReceipt, locale: Locale): StorySave {
  const itemId = `shared-relay:${receipt.relayId}`
  const withoutRelay = current.inventory.filter((item) => item.id !== itemId)
  const inventory = receipt.operation === 'add'
    ? [...withoutRelay, {
        id: itemId,
        label: locale === 'zh' ? '远行接力信' : 'Relay letter',
        count: 1,
        rarity: 'rare' as const,
        detail: locale === 'zh'
          ? '由另一位旅人交到公共路册中的接力信；只能由当前持有人送到标明地点。'
          : 'A relay letter left in the public route ledger by another traveler; only its current holder can deliver it.',
        effect: locale === 'zh' ? `接力编号：${receipt.relayId}` : `Relay id: ${receipt.relayId}`,
      }]
    : withoutRelay
  const receiptNotice = {
    id: `relay-receipt-${receipt.id}`,
    kind: 'event' as const,
    text: receipt.operation === 'add'
      ? (locale === 'zh' ? '接力信已经写入你的私人行囊。' : 'The relay letter is now recorded in your private pack.')
      : (locale === 'zh' ? '接力信已从你的私人行囊移除并完成交接。' : 'The relay letter has left your private pack and the handoff is complete.'),
    data: { relayReceiptId: receipt.id, relayId: receipt.relayId, operation: receipt.operation },
  }
  return current.blocks.some((block) => block.id === receiptNotice.id)
    ? { ...current, inventory }
    : { ...current, inventory, blocks: [...current.blocks, receiptNotice] }
}
