import { EventEmitter } from 'eventemitter3'

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

export interface AtlasEvents {
  'bill.paid': (event: BillPaidEvent) => void
  'bill.voided': (event: BillVoidedEvent) => void
  'order.confirmed': (event: OrderConfirmedEvent) => void
  'kot.status_changed': (event: KOTStatusChangedEvent) => void
  'inventory.low_stock': (event: InventoryLowStockEvent) => void
}

export const bus = new EventEmitter<AtlasEvents>()
