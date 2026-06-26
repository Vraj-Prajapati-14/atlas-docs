/**
 * In-process event bus — EventEmitter3.
 *
 * Usage:
 *   bus.emit('bill.paid', { tenantId, billId, grandTotalInPaise })
 *   bus.on('bill.paid', handler)
 *
 * Phase 2: replace bus.emit → Kafka producer, bus.on → Kafka consumer.
 * The call sites stay the same — only this file changes.
 */

import EventEmitter from 'eventemitter3'

// ─── Event payload types ─────────────────────────────────────────────────────

export interface BillPaidEvent {
  tenantId: string
  outletId: string
  billId: string
  orderId: string
  grandTotalInPaise: bigint
  paymentMethods: string[]
}

export interface OrderConfirmedEvent {
  tenantId: string
  outletId: string
  orderId: string
  tableId: string | null
  kotIds: string[]
}

export interface KOTStatusChangedEvent {
  tenantId: string
  kotId: string
  orderId: string
  previousStatus: string
  newStatus: string
}

export interface InventoryLowStockEvent {
  tenantId: string
  inventoryItemId: string
  itemName: string
  currentStock: number
  threshold: number
  unit: string
}

export interface BillVoidedEvent {
  tenantId: string
  billId: string
  orderId: string
  voidedById: string
  reason: string
}

// ─── Event map ───────────────────────────────────────────────────────────────

export interface AtlasEvents {
  'bill.paid': (event: BillPaidEvent) => void
  'bill.voided': (event: BillVoidedEvent) => void
  'order.confirmed': (event: OrderConfirmedEvent) => void
  'kot.status_changed': (event: KOTStatusChangedEvent) => void
  'inventory.low_stock': (event: InventoryLowStockEvent) => void
}

// ─── Singleton bus ────────────────────────────────────────────────────────────

class AtlasEventBus extends EventEmitter<AtlasEvents> {
  /** Emit an event and log it in development. */
  emit<K extends keyof AtlasEvents>(
    event: K,
    ...args: Parameters<AtlasEvents[K]>
  ): boolean {
    if (process.env['NODE_ENV'] === 'development') {
      console.debug(`[bus] ${String(event)}`, args[0])
    }
    return super.emit(event, ...args)
  }
}

export const bus = new AtlasEventBus()
