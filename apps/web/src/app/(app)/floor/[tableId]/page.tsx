'use client'

import { use, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, ShoppingCart, Trash2, Plus, Minus, Send } from 'lucide-react'
import { useTable } from '@/hooks/use-tables'
import { useMenuCategories, useMenuItems } from '@/hooks/use-menu'
import { useActiveTableOrder, useCreateAndConfirmOrder, useFireKOT } from '@/hooks/use-orders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { FoodTypeDot } from '@/components/pos/food-type-dot'
import { cn } from '@/lib/utils'
import type { CartItem, MenuItem, MenuItemVariant } from '@/lib/api-types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function paise(n: number) {
  return `₹ ${(n / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
}

function cartKey(item: CartItem) {
  return `${item.menuItemId}::${item.variantId ?? ''}`
}

// Hard-coded outletId fallback — real apps read from user/settings store
const DEFAULT_OUTLET_ID = 'default'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function POSPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params)
  const router = useRouter()

  const { data: table, isLoading: tableLoading } = useTable(tableId)
  const { data: activeOrder } = useActiveTableOrder(tableId)
  const { data: categories = [] } = useMenuCategories()
  const createAndConfirm = useCreateAndConfirmOrder()
  const fireKOT = useFireKOT()

  const [activeCat, setActiveCat] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])

  const { data: items = [], isLoading: itemsLoading } = useMenuItems({
    categoryId: activeCat === 'all' ? undefined : activeCat,
    search: search || undefined,
  })

  const visibleItems = useMemo(
    () => items.filter((i) => i.isAvailable),
    [items],
  )

  // ── Cart ops ──────────────────────────────────────────────────────────────
  const addItem = useCallback((item: MenuItem, variant?: MenuItemVariant) => {
    const price = variant ? variant.priceInPaise : item.priceInPaise
    const key = `${item.id}::${variant?.id ?? ''}`

    setCart((prev) => {
      const existing = prev.find((c) => cartKey(c) === key)
      if (existing) {
        return prev.map((c) => c === existing ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          variantId: variant?.id ?? null,
          menuItemName: item.name,
          variantName: variant?.name ?? null,
          priceInPaise: price,
          quantity: 1,
          note: '',
          addOns: [],
        },
      ]
    })
  }, [])

  const changeQty = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => cartKey(c) === key ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0),
    )
  }, [])

  const subtotal = cart.reduce((s, c) => s + c.priceInPaise * c.quantity, 0)
  const gst = Math.round(subtotal * 0.05)
  const total = subtotal + gst

  const handleSendKOT = async () => {
    if (!cart.length) return
    if (activeOrder) {
      await fireKOT.mutateAsync({ orderId: activeOrder.id, cartItems: cart })
    } else {
      await createAndConfirm.mutateAsync({
        outletId: DEFAULT_OUTLET_ID,
        tableId,
        cartItems: cart,
      })
    }
    setCart([])
  }

  const isPending = createAndConfirm.isPending || fireKOT.isPending

  if (tableLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" className="text-primary-500" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-56px)] gap-0 -m-6">
      {/* ── Left: Menu Browser ──────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-border bg-background">
        {/* Sticky header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
            <ArrowLeft size={16} />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              {table?.name ?? 'Table'} — New Order
            </p>
            {activeOrder && (
              <p className="text-[10px] text-muted-foreground">
                Active order #{activeOrder.orderNumber} · adding items
              </p>
            )}
          </div>
          {/* Search */}
          <div className="relative w-52">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search dishes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-0 px-4 overflow-x-auto border-b border-border shrink-0 bg-background">
          <CatTab id="all" label="All" active={activeCat === 'all'} onClick={() => setActiveCat('all')} />
          {categories
            .filter((c) => c.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((c) => (
              <CatTab key={c.id} id={c.id} label={c.name} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} />
            ))}
        </div>

        {/* Items grid */}
        {itemsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="default" className="text-primary-500" />
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            No items found
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {visibleItems.map((item) => (
                <MenuItemCard key={item.id} item={item} onAdd={addItem} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Cart ─────────────────────────────────────────────────── */}
      <div className="flex flex-col w-[320px] shrink-0 bg-background-card">
        {/* Cart header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={15} className="text-primary-500" />
            <span className="text-sm font-bold">Cart</span>
            {cart.length > 0 && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                {cart.reduce((s, c) => s + c.quantity, 0)}
              </Badge>
            )}
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" size="icon-sm" onClick={() => setCart([])}>
              <Trash2 size={13} className="text-danger" />
            </Button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <ShoppingCart size={32} className="opacity-20" />
              <p className="text-xs">Tap a dish to add</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {cart.map((c) => {
                const key = cartKey(c)
                return (
                  <li key={key} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{c.menuItemName}</p>
                      {c.variantName && (
                        <p className="text-[10px] text-muted-foreground">{c.variantName}</p>
                      )}
                    </div>
                    {/* Qty stepper */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => changeQty(key, -1)}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary-500 hover:text-primary-500 transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="w-4 text-center text-xs font-bold tabular-nums">{c.quantity}</span>
                      <button
                        type="button"
                        onClick={() => changeQty(key, 1)}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary-500 hover:text-primary-500 transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground tabular-nums w-16 text-right">
                      {paise(c.priceInPaise * c.quantity)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Totals + CTA */}
        <div className="shrink-0 border-t border-border px-4 pb-4 pt-3 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{paise(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>GST (est.)</span>
            <span className="tabular-nums">{paise(gst)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-2">
            <span>Total</span>
            <span className="tabular-nums text-primary-500">{paise(total)}</span>
          </div>
          <Button
            className="w-full mt-1"
            disabled={!cart.length || isPending}
            onClick={handleSendKOT}
          >
            {isPending ? (
              <><Spinner size="sm" /> Sending…</>
            ) : (
              <><Send size={14} /> Send KOT</>
            )}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push(`/billing?tableId=${tableId}`)}>
            Go to Billing
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function CatTab({ id, label, active, onClick }: { id: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      key={id}
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors duration-100',
        active
          ? 'border-primary-500 text-primary-500'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem, variant?: MenuItemVariant) => void }) {
  const defaultVariant = item.variants.find((v) => v.isDefault) ?? item.variants[0]
  const hasVariants = item.variants.length > 0
  const displayPrice = defaultVariant ? defaultVariant.priceInPaise : item.priceInPaise

  return (
    <button
      type="button"
      onClick={() => onAdd(item, defaultVariant)}
      className={cn(
        'flex flex-col items-start p-3 rounded-lg text-left',
        'border border-border bg-background-card',
        'hover:border-primary-500/60 hover:bg-background-hover',
        'active:scale-[0.97] transition-all duration-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <div className="flex items-start justify-between w-full gap-1 mb-1.5">
        <FoodTypeDot type={item.foodType} />
        {item.isFeatured && (
          <span className="text-[9px] font-bold text-warning uppercase tracking-wider">⭐</span>
        )}
      </div>
      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight mb-1">
        {item.name}
      </p>
      <div className="flex items-center justify-between w-full mt-auto pt-1">
        <span className="text-xs font-bold text-primary-500 tabular-nums">
          {paise(displayPrice)}
        </span>
        {hasVariants && (
          <span className="text-[9px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
            +{item.variants.length - 1} sizes
          </span>
        )}
      </div>
    </button>
  )
}
