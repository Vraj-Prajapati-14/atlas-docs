'use client'

import { useState } from 'react'
import { Receipt, CreditCard, X, ChevronRight, Trash2, Printer, Star, Lock, ArrowLeft } from 'lucide-react'
import { useOrders } from '@/hooks/use-orders'
import { useBills, useBill, useGenerateBill, useRecordPayment, useVoidBill, useVerifyManagerPIN } from '@/hooks/use-billing'
import { useSettings } from '@/hooks/use-settings'
import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { Bill, Order, PaymentMethod } from '@/lib/api-types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function paise(n: number) {
  return `₹ ${(n / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

const PAYMENT_STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'muted' | 'default' | 'info' }> = {
  PAID:     { label: 'Paid',     variant: 'success' },
  PARTIAL:  { label: 'Partial',  variant: 'warning' },
  PENDING:  { label: 'Pending',  variant: 'default' },
  REFUNDED: { label: 'Refunded', variant: 'info' },
  FAILED:   { label: 'Failed',   variant: 'danger' },
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'CASH',   label: 'Cash',     icon: '💵' },
  { value: 'UPI',    label: 'UPI',      icon: '📲' },
  { value: 'CARD',   label: 'Card',     icon: '💳' },
  { value: 'WALLET', label: 'Wallet',   icon: '👛' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null)
  const [tab, setTab] = useState<'to-bill' | 'bills'>('to-bill')
  const [generateModalOrder, setGenerateModalOrder] = useState<Order | null>(null)

  // SERVED orders (ready to bill) + BILLED orders (already have a bill)
  const { data: ordersData } = useOrders({ status: 'SERVED', limit: 50 })
  const { data: billedData }  = useOrders({ status: 'BILLED', limit: 50 })
  const { data: billsData }   = useBills()
  const { data: settingsData } = useSettings()

  const servedOrders  = ordersData ?? []
  const billedOrders  = billedData ?? []
  const bills         = billsData ?? []

  const generateBill  = useGenerateBill()

  const discountThreshold = settingsData?.settings?.discountApprovalThreshold ?? 0
  const loyaltyEnabled    = settingsData?.settings?.loyaltyEnabled ?? false
  const redemptionRate    = settingsData?.settings?.loyaltyRedemptionRate ?? 100

  const [mobilePanel, setMobilePanel] = useState<'list' | 'detail'>('list')

  const handleSelectOrder = (order: Order) => {
    setSelectedOrderId(order.id)
    setSelectedBillId(null)
    const existing = bills.find((b) => b.orderId === order.id)
    if (existing) {
      setSelectedBillId(existing.id)
      setMobilePanel('detail')
    } else {
      setGenerateModalOrder(order)
    }
  }

  const handleSelectBill = (billId: string) => {
    setSelectedBillId(billId)
    setSelectedOrderId(null)
    setMobilePanel('detail')
  }

  return (
    <div className="flex h-[calc(100dvh-56px)] -m-6">
      {/* ── Left: order/bill list ──────────────────────────────────────── */}
      <div className={cn(
        'flex-col shrink-0 border-r border-border bg-background',
        mobilePanel === 'list' ? 'flex flex-1' : 'hidden md:flex',
        'md:w-[280px] md:flex-none',
      )}>
        {/* Tabs */}
        <div className="flex border-b border-border">
          <TabBtn active={tab === 'to-bill'} onClick={() => setTab('to-bill')}>
            To Bill {servedOrders.length > 0 && <span className="ml-1 text-primary-500">({servedOrders.length})</span>}
          </TabBtn>
          <TabBtn active={tab === 'bills'} onClick={() => setTab('bills')}>
            Bills
          </TabBtn>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {tab === 'to-bill' ? (
            servedOrders.length === 0 && billedOrders.length === 0 ? (
              <EmptyState message="No orders ready to bill" />
            ) : (
              <>
                {servedOrders.map((o) => (
                  <ListRow
                    key={o.id}
                    label={o.table?.name ?? `Order #${o.orderNumber}`}
                    sub={`${o.items.length} items · ${paise(o.subtotalInPaise)}`}
                    badge={<Badge variant="warning">Served</Badge>}
                    active={selectedOrderId === o.id}
                    loading={generateBill.isPending && selectedOrderId === o.id}
                    onClick={() => handleSelectOrder(o)}
                  />
                ))}
                {billedOrders.map((o) => {
                  const b = bills.find((bl) => bl.orderId === o.id)
                  return (
                    <ListRow
                      key={o.id}
                      label={o.table?.name ?? `Order #${o.orderNumber}`}
                      sub={b ? `Bill #${b.billNumber}` : `${o.items.length} items`}
                      badge={b ? <Badge variant={PAYMENT_STATUS_BADGE[b.paymentStatus]?.variant ?? 'muted'}>{PAYMENT_STATUS_BADGE[b.paymentStatus]?.label}</Badge> : null}
                      active={selectedBillId === b?.id}
                      onClick={() => b && handleSelectBill(b.id)}
                    />
                  )
                })}
              </>
            )
          ) : (
            bills.length === 0 ? (
              <EmptyState message="No bills today" />
            ) : (
              bills.map((b) => (
                <ListRow
                  key={b.id}
                  label={b.order.table?.name ?? `Order #${b.order.orderNumber}`}
                  sub={`Bill #${b.billNumber} · ${paise(b.grandTotalInPaise)}`}
                  badge={<Badge variant={PAYMENT_STATUS_BADGE[b.paymentStatus]?.variant ?? 'muted'}>{PAYMENT_STATUS_BADGE[b.paymentStatus]?.label}</Badge>}
                  active={selectedBillId === b.id}
                  onClick={() => handleSelectBill(b.id)}
                />
              ))
            )
          )}
        </div>
      </div>

      {/* ── Right: bill detail ─────────────────────────────────────────── */}
      <div className={cn(
        'flex-1 overflow-y-auto bg-background-card',
        mobilePanel === 'detail' ? 'flex flex-col' : 'hidden md:flex md:flex-col',
      )}>
        {/* Mobile back button */}
        {mobilePanel === 'detail' && (
          <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-border bg-background shrink-0">
            <button
              type="button"
              onClick={() => setMobilePanel('list')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={15} />
              Back
            </button>
          </div>
        )}
        {selectedBillId ? (
          <BillDetail billId={selectedBillId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Receipt size={40} className="opacity-15" />
            <p className="text-sm">Select an order to generate a bill</p>
          </div>
        )}
      </div>

      {/* Generate bill modal — discount + loyalty before bill creation */}
      {generateModalOrder && (
        <GenerateBillModal
          order={generateModalOrder}
          discountThreshold={discountThreshold}
          loyaltyEnabled={loyaltyEnabled}
          redemptionRate={redemptionRate}
          onClose={() => setGenerateModalOrder(null)}
          onGenerate={async (payload) => {
            const bill = await generateBill.mutateAsync({ orderId: generateModalOrder.id, ...payload })
            setSelectedBillId(bill.id)
            setGenerateModalOrder(null)
          }}
          isPending={generateBill.isPending}
        />
      )}
    </div>
  )
}

// ─── Bill Detail Panel ────────────────────────────────────────────────────────

function BillDetail({ billId }: { billId: string }) {
  const { data: bill, isLoading } = useBill(billId)
  const { data: settingsData } = useSettings()
  const [showPayment, setShowPayment] = useState(false)
  const [showVoidConfirm, setShowVoidConfirm] = useState(false)
  const [showPrint, setShowPrint] = useState(false)
  const voidBill = useVoidBill()
  const user = useAuthStore((s) => s.user)
  const canVoid = user?.role === 'OWNER' || user?.role === 'MANAGER'
  const restaurantName = settingsData?.tenant?.name ?? 'Restaurant'

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Spinner size="lg" className="text-primary-500" /></div>
  }

  if (!bill) return null

  const paidAmount = bill.payments.reduce((s, p) => s + p.amountInPaise, 0)
  const balance = bill.grandTotalInPaise - paidAmount
  const ps = PAYMENT_STATUS_BADGE[bill.paymentStatus] ?? { label: bill.paymentStatus, variant: 'muted' as const }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-5">
      {/* Bill header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">Bill #{bill.billNumber}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {bill.order.table?.name ?? `Order #${bill.order.orderNumber}`}
            {bill.order.guestCount ? ` · ${bill.order.guestCount} covers` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setShowPrint(true)}>
            <Printer size={13} /> Print
          </Button>
          <Badge variant={ps.variant}>{ps.label}</Badge>
        </div>
      </div>

      {/* Line items */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-background">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Items</span>
        </div>
        <div className="divide-y divide-border">
          {bill.order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                  {item.menuItemName}{item.variantName ? ` (${item.variantName})` : ''}
                  <span className="ml-1.5 text-xs text-muted-foreground">×{item.quantity}</span>
                </p>
                {item.gstRate > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    GST {item.gstRate}% {item.isGSTInclusive ? '(incl.)' : '(excl.)'}
                  </p>
                )}
              </div>
              <span className="tabular-nums text-sm font-semibold text-foreground ml-4">{paise(item.totalPriceInPaise)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <TotalRow label="Subtotal" value={paise(bill.subtotalInPaise)} />
        {bill.discountInPaise > 0 && (
          <TotalRow label="Discount" value={`−${paise(bill.discountInPaise)}`} className="text-success" />
        )}
        {bill.serviceChargeInPaise > 0 && (
          <TotalRow label="Service charge" value={paise(bill.serviceChargeInPaise)} />
        )}
        {(bill.cgstInPaise > 0 || bill.sgstInPaise > 0) && (
          <>
            <TotalRow label={`CGST`} value={paise(bill.cgstInPaise)} />
            <TotalRow label={`SGST`} value={paise(bill.sgstInPaise)} />
          </>
        )}
        {bill.igstInPaise > 0 && <TotalRow label="IGST" value={paise(bill.igstInPaise)} />}
        {bill.roundOffInPaise !== 0 && (
          <TotalRow label="Round off" value={paise(bill.roundOffInPaise)} />
        )}
        <div className="border-t border-border pt-2 flex justify-between items-center">
          <span className="text-sm font-bold">Grand Total</span>
          <span className="text-lg font-extrabold text-primary-500 tabular-nums">{paise(bill.grandTotalInPaise)}</span>
        </div>
      </div>

      {/* Payments recorded */}
      {bill.payments.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-2 border-b border-border bg-background">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Payments</span>
          </div>
          {bill.payments.map((p) => (
            <div key={p.id} className="flex justify-between items-center px-4 py-2.5 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2">
                <CreditCard size={13} className="text-muted-foreground" />
                <span className="text-sm">{p.method}</span>
                {p.referenceId && <span className="text-xs text-muted-foreground">· {p.referenceId}</span>}
              </div>
              <span className="tabular-nums text-sm font-semibold text-success">{paise(p.amountInPaise)}</span>
            </div>
          ))}
          {balance > 0 && (
            <div className="flex justify-between items-center px-4 py-2 bg-danger/5">
              <span className="text-sm font-semibold text-danger">Balance due</span>
              <span className="tabular-nums text-sm font-bold text-danger">{paise(balance)}</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {bill.paymentStatus !== 'PAID' && bill.paymentStatus !== 'REFUNDED' && (
        <>
          {!showPayment ? (
            <Button className="w-full" onClick={() => setShowPayment(true)}>
              <CreditCard size={15} /> Record Payment
            </Button>
          ) : (
            <PaymentForm
              bill={bill}
              balance={balance}
              onClose={() => setShowPayment(false)}
            />
          )}
        </>
      )}

      {bill.paymentStatus === 'PAID' && (
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-success/10 border border-success/20 text-success">
          <span className="text-lg">✓</span>
          <span className="text-sm font-semibold">Bill fully settled</span>
        </div>
      )}

      {/* Void — OWNER / MANAGER only, not on already-voided bills */}
      {showPrint && <PrintBillModal bill={bill} restaurantName={restaurantName} onClose={() => setShowPrint(false)} />}

      {canVoid && bill.paymentStatus !== 'REFUNDED' && (
        showVoidConfirm ? (
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 space-y-3">
            <p className="text-sm font-semibold text-danger">Void this bill?</p>
            <p className="text-xs text-muted-foreground">This action cannot be undone. Any payments will need to be manually refunded.</p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                className="flex-1"
                disabled={voidBill.isPending}
                onClick={() => voidBill.mutate(
                  { billId: bill.id, reason: 'Voided by manager' },
                  { onSuccess: () => setShowVoidConfirm(false) },
                )}
              >
                {voidBill.isPending ? <Spinner size="xs" /> : 'Yes, void bill'}
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => setShowVoidConfirm(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="text-danger/60 hover:text-danger w-full" onClick={() => setShowVoidConfirm(true)}>
            <Trash2 size={13} /> Void Bill
          </Button>
        )
      )}
    </div>
  )
}

// ─── Generate Bill Modal ──────────────────────────────────────────────────────

interface GenerateBillPayload {
  discountInPaise?: number
  discountReasonCode?: string
  loyaltyPointsRedeem?: number
  customerName?: string
  customerPhone?: string
}

function GenerateBillModal({
  order,
  discountThreshold,
  loyaltyEnabled,
  redemptionRate,
  onClose,
  onGenerate,
  isPending,
}: {
  order: Order
  discountThreshold: number
  loyaltyEnabled: boolean
  redemptionRate: number
  onClose: () => void
  onGenerate: (payload: GenerateBillPayload) => Promise<void>
  isPending: boolean
}) {
  const [discountRupees, setDiscountRupees] = useState('')
  const [discountReason, setDiscountReason] = useState('')
  const [loyaltyRedeem, setLoyaltyRedeem] = useState('')
  const [pinEntry, setPinEntry] = useState('')
  const [pinVerified, setPinVerified] = useState(false)
  const [pinError, setPinError] = useState('')
  const [verifyingPin, setVerifyingPin] = useState(false)
  const verifyPIN = useVerifyManagerPIN()

  const subtotal       = order.subtotalInPaise
  const loyaltyBalance = order.customer?.loyaltyPointsBalance ?? 0
  const discountPaise  = Math.round((parseFloat(discountRupees) || 0) * 100)
  const discountPct    = subtotal > 0 ? (discountPaise / subtotal) * 100 : 0
  const loyaltyPoints  = Math.min(parseInt(loyaltyRedeem) || 0, loyaltyBalance)
  const loyaltyDiscount = Math.floor((loyaltyPoints / redemptionRate) * 100)

  const needsApproval  = discountThreshold > 0 && discountPct > discountThreshold && !pinVerified

  async function handleVerifyPIN() {
    if (pinEntry.length !== 4) return
    setVerifyingPin(true)
    setPinError('')
    try {
      const res = await verifyPIN.mutateAsync(pinEntry)
      if (res.valid) {
        setPinVerified(true)
        setPinEntry('')
      } else {
        setPinError('Invalid PIN. Ask a manager or owner.')
      }
    } finally {
      setVerifyingPin(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (needsApproval) return
    onGenerate({
      discountInPaise: discountPaise > 0 ? discountPaise : undefined,
      discountReasonCode: discountReason || undefined,
      loyaltyPointsRedeem: loyaltyPoints > 0 ? loyaltyPoints : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-background-card border border-border rounded-xl w-full max-w-sm shadow-2xl space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Generate Bill</p>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="rounded-lg bg-background px-4 py-2.5">
          <p className="text-xs text-muted-foreground">
            {order.table?.name ?? `Order #${order.orderNumber}`}
            {order.customer ? ` · ${order.customer.name}` : ''}
          </p>
          <p className="text-sm font-bold text-foreground mt-0.5">{paise(subtotal)} (est. subtotal)</p>
        </div>

        {/* Discount */}
        <div className="space-y-1.5">
          <Label>Discount (₹) {discountThreshold > 0 && <span className="text-[10px] text-muted-foreground ml-1">PIN required above {discountThreshold}%</span>}</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max={(subtotal / 100).toFixed(2)}
            placeholder="0.00"
            value={discountRupees}
            onChange={(e) => { setDiscountRupees(e.target.value); setPinVerified(false) }}
          />
          {discountPaise > 0 && (
            <Input
              type="text"
              placeholder="Discount reason (optional)"
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
            />
          )}
        </div>

        {/* Manager PIN gate */}
        {discountPct > discountThreshold && discountThreshold > 0 && !pinVerified && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 space-y-2">
            <p className="text-xs font-semibold text-warning flex items-center gap-1.5">
              <Lock size={12} /> Manager approval required ({discountPct.toFixed(1)}% discount)
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit PIN"
                value={pinEntry}
                onChange={(e) => { setPinEntry(e.target.value.replace(/\D/g, '')); setPinError('') }}
                className="flex-1 font-mono tracking-widest"
              />
              <Button type="button" size="sm" disabled={pinEntry.length !== 4 || verifyingPin} onClick={handleVerifyPIN}>
                {verifyingPin ? <Spinner size="xs" /> : 'Verify'}
              </Button>
            </div>
            {pinError && <p className="text-[11px] text-danger">{pinError}</p>}
          </div>
        )}
        {pinVerified && (
          <p className="text-xs text-success flex items-center gap-1"><span>✓</span> Manager approved</p>
        )}

        {/* Loyalty redeem */}
        {loyaltyEnabled && loyaltyBalance > 0 && (
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Star size={11} className="text-warning fill-warning" />
              Redeem Loyalty Points
              <span className="text-[10px] text-muted-foreground font-normal ml-1">({loyaltyBalance} available)</span>
            </Label>
            <Input
              type="number"
              min="0"
              max={loyaltyBalance}
              placeholder="0"
              value={loyaltyRedeem}
              onChange={(e) => setLoyaltyRedeem(e.target.value)}
            />
            {loyaltyPoints > 0 && (
              <p className="text-[11px] text-success">
                Redeem {loyaltyPoints} pts = {paise(loyaltyDiscount)} discount
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={isPending || needsApproval}>
            {isPending ? <Spinner size="sm" /> : 'Generate Bill'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// ─── Print Bill Modal ─────────────────────────────────────────────────────────

function PrintBillModal({ bill, restaurantName, onClose }: { bill: Bill; restaurantName: string; onClose: () => void }) {
  function handlePrint() {
    const printArea = document.getElementById('atlas-print-receipt')
    if (!printArea) return
    const win = window.open('', '_blank', 'width=320,height=600')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Bill #${bill.billNumber}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  body { font-family: 'Courier New', monospace; font-size: 11px; color: #000; background: #fff; padding: 8px; width: 80mm; }
  h1 { font-size: 14px; text-align: center; margin: 0 0 4px; }
  .center { text-align: center; }
  .divider { border: none; border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  td { padding: 1px 0; }
  .right { text-align: right; }
  .bold { font-weight: bold; }
  .total-row td { padding-top: 4px; }
  .grand td { font-size: 13px; border-top: 1px solid #000; padding-top: 4px; font-weight: bold; }
</style></head><body>`)
    win.document.write(printArea.innerHTML)
    win.document.write('</body></html>')
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      win.onafterprint = () => win.close()
    }, 200)
  }

  const paidAmount = bill.payments.reduce((s, p) => s + p.amountInPaise, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white text-black rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col w-[340px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="font-bold text-sm text-gray-800">Print Preview</span>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={15} /></button>
        </div>

        <div id="atlas-print-receipt" className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-tight bg-white text-black">
          <h1 className="text-[14px] font-bold text-center mb-1">{restaurantName}</h1>
          <p className="text-center text-[10px] mb-1">Tax Invoice</p>
          <hr className="border-dashed border-gray-400 my-2" />
          <table className="w-full">
            <tbody>
              <tr><td>Bill No:</td><td className="text-right font-bold">#{bill.billNumber}</td></tr>
              <tr><td>Order:</td><td className="text-right">#{bill.order?.orderNumber}</td></tr>
              {bill.order?.table && <tr><td>Table:</td><td className="text-right">{bill.order.table.name}</td></tr>}
              <tr><td>Date:</td><td className="text-right">{new Date(bill.createdAt).toLocaleDateString('en-IN')}</td></tr>
              <tr><td>Time:</td><td className="text-right">{new Date(bill.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td></tr>
            </tbody>
          </table>
          <hr className="border-dashed border-gray-400 my-2" />

          <table className="w-full">
            <thead>
              <tr className="font-bold">
                <td>Item</td><td className="text-right">Qty</td><td className="text-right">Amt</td>
              </tr>
            </thead>
            <tbody>
              {bill.order?.items?.map((item) => (
                <tr key={item.id}>
                  <td className="max-w-[140px] break-words pr-1">
                    {item.menuItemName}{item.variantName ? ` (${item.variantName})` : ''}
                  </td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right whitespace-nowrap">₹{(item.totalPriceInPaise / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="border-dashed border-gray-400 my-2" />

          <table className="w-full">
            <tbody>
              <tr><td>Subtotal</td><td className="text-right">₹{(bill.subtotalInPaise / 100).toFixed(2)}</td></tr>
              {bill.discountInPaise > 0 && <tr><td>Discount</td><td className="text-right">-₹{(bill.discountInPaise / 100).toFixed(2)}</td></tr>}
              {bill.serviceChargeInPaise > 0 && <tr><td>Service Charge</td><td className="text-right">₹{(bill.serviceChargeInPaise / 100).toFixed(2)}</td></tr>}
              {bill.cgstInPaise > 0 && <tr><td>CGST</td><td className="text-right">₹{(bill.cgstInPaise / 100).toFixed(2)}</td></tr>}
              {bill.sgstInPaise > 0 && <tr><td>SGST</td><td className="text-right">₹{(bill.sgstInPaise / 100).toFixed(2)}</td></tr>}
              {bill.igstInPaise > 0 && <tr><td>IGST</td><td className="text-right">₹{(bill.igstInPaise / 100).toFixed(2)}</td></tr>}
              {bill.roundOffInPaise !== 0 && <tr><td>Round Off</td><td className="text-right">₹{(bill.roundOffInPaise / 100).toFixed(2)}</td></tr>}
            </tbody>
          </table>
          <hr className="border-solid border-gray-800 my-1" />
          <table className="w-full">
            <tbody>
              <tr className="font-bold text-[13px]">
                <td>GRAND TOTAL</td>
                <td className="text-right">₹{(bill.grandTotalInPaise / 100).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {bill.payments.length > 0 && (
            <>
              <hr className="border-dashed border-gray-400 my-2" />
              <table className="w-full">
                <tbody>
                  {bill.payments.map(p => (
                    <tr key={p.id}><td>{p.method}</td><td className="text-right">₹{(p.amountInPaise / 100).toFixed(2)}</td></tr>
                  ))}
                  {paidAmount >= bill.grandTotalInPaise && (
                    <tr className="font-bold"><td>CHANGE</td><td className="text-right">₹{((paidAmount - bill.grandTotalInPaise) / 100).toFixed(2)}</td></tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          <hr className="border-dashed border-gray-400 my-2" />
          <p className="text-center text-[10px]">Thank you for dining with us!</p>
          <p className="text-center text-[10px] mt-1">Powered by Atlas POS</p>
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-gray-200">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
          <button type="button" onClick={handlePrint} className="flex-1 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-orange-600">
            <Printer size={14} /> Print Bill
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Payment Form ─────────────────────────────────────────────────────────────

function PaymentForm({ bill, balance, onClose }: { bill: Bill; balance: number; onClose: () => void }) {
  const [method, setMethod] = useState<PaymentMethod>('CASH')
  const [amount, setAmount] = useState(String((balance / 100).toFixed(2)))
  const [ref, setRef] = useState('')
  const recordPayment = useRecordPayment()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const paise = Math.round(parseFloat(amount) * 100)
    if (!paise || paise <= 0) return
    await recordPayment.mutateAsync({ billId: bill.id, method, amountInPaise: paise, referenceId: ref || undefined })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Record Payment</h3>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
      </div>

      {/* Method selector */}
      <div className="grid grid-cols-4 gap-2">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMethod(m.value)}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-semibold transition-all',
              method === m.value
                ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                : 'border-border text-muted-foreground hover:border-primary-500/40',
            )}
          >
            <span className="text-lg">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label>Amount (₹)</Label>
        <Input
          type="number"
          step="0.01"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="font-mono text-base"
        />
      </div>

      {/* Reference (UPI/Card) */}
      {(method === 'UPI' || method === 'CARD') && (
        <div className="space-y-1.5">
          <Label>{method === 'UPI' ? 'UPI Reference / UTR' : 'Card last 4 digits'}</Label>
          <Input
            type="text"
            placeholder={method === 'UPI' ? '123456789012' : '4242'}
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={recordPayment.isPending}>
        {recordPayment.isPending ? <Spinner size="sm" /> : `Confirm ${method} Payment`}
      </Button>
    </form>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 px-3 py-3 text-xs font-semibold border-b-2 -mb-px transition-colors duration-100',
        active ? 'border-primary-500 text-primary-500' : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function ListRow({
  label, sub, badge, active, loading, onClick,
}: {
  label: string
  sub: string
  badge?: React.ReactNode
  active?: boolean
  loading?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100',
        active ? 'bg-primary-500/10 border-r-2 border-primary-500' : 'hover:bg-white/3',
      )}
    >
      {loading ? <Spinner size="xs" className="text-primary-500 shrink-0" /> : <ChevronRight size={13} className="text-muted-foreground shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</p>
      </div>
      {badge}
    </button>
  )
}

function TotalRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex justify-between items-center', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="tabular-nums text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
      {message}
    </div>
  )
}
