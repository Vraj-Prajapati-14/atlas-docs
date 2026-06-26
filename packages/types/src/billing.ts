import type { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from './enums.js'

export interface Order {
  id: string
  tenantId: string
  outletId: string
  orderNumber: string        // human-readable: "ORD-2026-0001"
  type: OrderType
  status: OrderStatus
  tableId: string | null
  customerId: string | null
  staffId: string            // waiter or cashier who opened order
  guestCount: number | null
  note: string | null
  items: OrderItem[]
  kots: KOT[]
  bill: Bill | null
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  menuItemName: string       // snapshot at time of order
  variantId: string | null
  variantName: string | null
  quantity: number
  unitPriceInPaise: bigint   // snapshot (menu prices can change)
  totalPriceInPaise: bigint  // quantity × unitPrice
  gstRate: 0 | 5 | 12 | 18 | 28
  note: string | null
  addOns: OrderItemAddOn[]
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
}

export interface OrderItemAddOn {
  id: string
  orderItemId: string
  addOnId: string
  addOnName: string
  priceInPaise: bigint
}

export interface KOT {
  id: string
  tenantId: string
  orderId: string
  kotNumber: string          // "KOT-001"
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  printedAt: Date | null
  acceptedAt: Date | null
  doneAt: Date | null
  items: KOTItem[]
  createdAt: Date
}

export interface KOTItem {
  id: string
  kotId: string
  orderItemId: string
  menuItemName: string
  variantName: string | null
  quantity: number
  note: string | null
}

export interface Bill {
  id: string
  tenantId: string
  outletId: string
  orderId: string
  billNumber: string          // "INV-2026-000001" (GST invoice number)
  subtotalInPaise: bigint
  discountInPaise: bigint
  discountReasonCode: string | null
  serviceChargeInPaise: bigint
  serviceChargePercent: number
  cgstInPaise: bigint
  sgstInPaise: bigint
  igstInPaise: bigint
  roundOffInPaise: bigint     // can be negative
  grandTotalInPaise: bigint
  paymentStatus: PaymentStatus
  payments: Payment[]
  voidedAt: Date | null
  voidReason: string | null
  voidedById: string | null
  createdAt: Date
}

export interface Payment {
  id: string
  billId: string
  method: PaymentMethod
  amountInPaise: bigint
  referenceId: string | null  // UPI UTR, card last4, etc.
  gatewayResponse: Record<string, unknown> | null
  paidAt: Date
}

export interface BillSummary {
  subtotal: bigint
  discount: bigint
  serviceCharge: bigint
  cgst: bigint
  sgst: bigint
  igst: bigint
  roundOff: bigint
  grandTotal: bigint
  amountPaid: bigint
  amountDue: bigint
}
