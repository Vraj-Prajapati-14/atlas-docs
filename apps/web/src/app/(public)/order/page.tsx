'use client'

import { useState, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ShoppingCart, Plus, Minus, Trash2, Send, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PublicMenuResponse, MenuItem, MenuItemVariant } from '@/lib/api-types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? ''

function paise(n: number) {
  return `₹${(n / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
}

interface CartItem {
  menuItemId: string
  variantId: string | null
  menuItemName: string
  variantName: string | null
  priceInPaise: number
  quantity: number
  note: string
}

function cartKey(item: CartItem) {
  return `${item.menuItemId}::${item.variantId ?? ''}`
}

// ─── Page (inner — after Suspense) ───────────────────────────────────────────

function OrderPageInner() {
  const searchParams = useSearchParams()
  const qr = searchParams.get('qr') ?? ''

  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCat, setActiveCat] = useState<string>('all')
  const [name, setName] = useState('')
  const [showCart, setShowCart] = useState(false)
  const [ordered, setOrdered] = useState(false)

  // Fetch public menu
  const { data, isLoading, isError } = useQuery<PublicMenuResponse>({
    queryKey: ['public-menu', qr],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/public/menu?qr=${encodeURIComponent(qr)}`)
      if (!res.ok) throw new Error('Table not found or QR invalid')
      const json = await res.json() as { success: boolean; data: PublicMenuResponse }
      return json.data
    },
    enabled: !!qr,
    staleTime: 5 * 60 * 1000,
  })

  const placeOrder = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr,
          customerName: name.trim() || undefined,
          items: cart.map((c) => ({
            menuItemId: c.menuItemId,
            variantId: c.variantId ?? undefined,
            quantity: c.quantity,
            note: c.note || undefined,
            addOns: [],
          })),
        }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: { message?: string } }
        throw new Error(err.error?.message ?? 'Order failed')
      }
      return res.json()
    },
    onSuccess: () => {
      setOrdered(true)
      setCart([])
      setShowCart(false)
    },
  })

  const addItem = useCallback((item: MenuItem, variant?: MenuItemVariant) => {
    const price = variant ? variant.priceInPaise : item.priceInPaise
    const key = `${item.id}::${variant?.id ?? ''}`
    setCart((prev) => {
      const existing = prev.find((c) => cartKey(c) === key)
      if (existing) return prev.map((c) => c === existing ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, {
        menuItemId: item.id,
        variantId: variant?.id ?? null,
        menuItemName: item.name,
        variantName: variant?.name ?? null,
        priceInPaise: price,
        quantity: 1,
        note: '',
      }]
    })
  }, [])

  const changeQty = useCallback((key: string, delta: number) => {
    setCart((prev) => prev.map((c) => cartKey(c) === key ? { ...c, quantity: c.quantity + delta } : c).filter((c) => c.quantity > 0))
  }, [])

  const visibleItems = useMemo(() => {
    if (!data) return []
    return data.items.filter((i) => activeCat === 'all' || i.categoryId === activeCat)
  }, [data, activeCat])

  const itemCount = cart.reduce((s, c) => s + c.quantity, 0)
  const subtotal  = cart.reduce((s, c) => s + c.priceInPaise * c.quantity, 0)

  if (!qr) {
    return (
      <div className="flex items-center justify-center min-h-dvh p-6 text-center">
        <div>
          <p className="text-2xl font-bold mb-2">Invalid QR</p>
          <p className="text-muted-foreground text-sm">Please scan the QR code on your table.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center min-h-dvh p-6 text-center">
        <div>
          <p className="text-xl font-bold mb-2">QR code not recognised</p>
          <p className="text-muted-foreground text-sm">Please ask staff for assistance.</p>
        </div>
      </div>
    )
  }

  if (ordered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center text-3xl">✓</div>
        <div>
          <p className="text-xl font-bold">Order Placed!</p>
          <p className="text-muted-foreground text-sm mt-1">
            Your order for {data.table.name} has been sent to the kitchen.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOrdered(false)}
          className="text-sm text-primary-500 underline mt-2"
        >
          Order more items
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">{data.table.outlet.name}</p>
          <p className="text-xs text-muted-foreground">{data.table.name}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCart(true)}
          className="relative flex items-center gap-2 bg-primary-500 text-white rounded-full px-4 py-2 text-sm font-bold"
        >
          <ShoppingCart size={15} />
          Cart
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-primary-500 text-[11px] font-extrabold flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-0 px-4 py-2 overflow-x-auto border-b border-border shrink-0 bg-background">
        <CatChip label="All" active={activeCat === 'all'} onClick={() => setActiveCat('all')} />
        {data.categories.map((c) => (
          <CatChip key={c.id} label={c.name} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} />
        ))}
      </div>

      {/* Items */}
      <div className="p-4 space-y-2">
        {visibleItems.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12">No items available</p>
        ) : (
          visibleItems.map((item) => {
            const defaultVariant = item.variants.find((v) => v.isDefault) ?? item.variants[0]
            const displayPrice = defaultVariant ? defaultVariant.priceInPaise : item.priceInPaise
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3 border-b border-border/40 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                  )}
                  <p className="text-sm font-bold text-primary-500 mt-1">{paise(displayPrice)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addItem(item, defaultVariant)}
                  className="w-9 h-9 rounded-full border-2 border-primary-500 text-primary-500 flex items-center justify-center font-bold text-lg hover:bg-primary-500/10 transition-colors shrink-0"
                >
                  <Plus size={18} />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Cart bottom sheet */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50">
          <div className="bg-background-card rounded-t-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <p className="font-bold text-sm">Your Order · {data.table.name}</p>
              <button type="button" onClick={() => setShowCart(false)}>
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">Your cart is empty</p>
              ) : (
                cart.map((c) => {
                  const key = cartKey(c)
                  return (
                    <div key={key} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{c.menuItemName}</p>
                        {c.variantName && <p className="text-xs text-muted-foreground">{c.variantName}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => changeQty(key, -1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary-500">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center tabular-nums">{c.quantity}</span>
                        <button type="button" onClick={() => changeQty(key, 1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary-500">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold tabular-nums w-14 text-right shrink-0">{paise(c.priceInPaise * c.quantity)}</span>
                    </div>
                  )
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-border space-y-3">
                <div className="flex justify-between text-sm font-bold">
                  <span>Subtotal (excl. tax)</span>
                  <span className="tabular-nums text-primary-500">{paise(subtotal)}</span>
                </div>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  disabled={placeOrder.isPending}
                  onClick={() => placeOrder.mutate()}
                  className="w-full bg-primary-500 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {placeOrder.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  Place Order
                </button>
                {placeOrder.isError && (
                  <p className="text-xs text-danger text-center">{(placeOrder.error as Error)?.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Floating cart button ─────────────────────────────────────────────────────

function CatChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors',
        active ? 'border-primary-500 text-primary-500' : 'border-transparent text-muted-foreground',
      )}
    >
      {label}
    </button>
  )
}

// ─── Page export with Suspense (searchParams requires it in App Router) ───────

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderPageInner />
    </Suspense>
  )
}
