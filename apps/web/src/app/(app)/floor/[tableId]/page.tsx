'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, ShoppingCart, Trash2, Plus, Minus, Send, UserRound, X, ArrowRightLeft, Star, ChevronRight } from 'lucide-react'
import { useTable, useTables } from '@/hooks/use-tables'
import { useMenuCategories, useMenuItems } from '@/hooks/use-menu'
import { useActiveTableOrder, useCreateAndConfirmOrder, useFireKOT, useTransferOrder } from '@/hooks/use-orders'
import { useCustomers } from '@/hooks/use-customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { FoodTypeDot } from '@/components/pos/food-type-dot'
import { cn } from '@/lib/utils'
import type { CartItem, Customer, MenuItem, MenuItemVariant, Table } from '@/lib/api-types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function paise(n: number) {
  return `₹ ${(n / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
}

function cartKey(item: CartItem) {
  return `${item.menuItemId}::${item.variantId ?? ''}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function POSPage({ params }: { params: { tableId: string } }) {
  const { tableId } = params
  const router = useRouter()

  const { data: table, isLoading: tableLoading } = useTable(tableId)
  const { data: activeOrder } = useActiveTableOrder(tableId)
  const { data: categories = [] } = useMenuCategories()
  const { data: allTables = [] } = useTables()
  const createAndConfirm = useCreateAndConfirmOrder()
  const fireKOT = useFireKOT()
  const transferOrder = useTransferOrder()

  const [activeCat, setActiveCat] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [transferOpen, setTransferOpen] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<'menu' | 'cart'>('menu')

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
        outletId: table!.outletId,
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
      <div className={cn(
        'flex-col flex-1 min-w-0 border-r border-border bg-background',
        mobilePanel === 'menu' ? 'flex' : 'hidden md:flex',
      )}>
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
          <div className="relative flex-1 md:flex-none md:w-52">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search dishes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs w-full"
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
        {/* Mobile: sticky cart bar */}
        {cart.length > 0 && (
          <button
            type="button"
            onClick={() => setMobilePanel('cart')}
            className={cn(
              'md:hidden shrink-0 flex items-center justify-between',
              'px-4 py-3 bg-primary-500 text-white',
            )}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} />
              <span className="text-sm font-bold">
                {cart.reduce((s, c) => s + c.quantity, 0)} item{cart.reduce((s, c) => s + c.quantity, 0) !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold">{paise(total)}</span>
              <ChevronRight size={16} />
            </div>
          </button>
        )}
      </div>

      {/* ── Right: Cart ─────────────────────────────────────────────────── */}
      <div className={cn(
        'flex-col bg-background-card',
        mobilePanel === 'cart' ? 'flex flex-1' : 'hidden md:flex',
        'md:w-[320px] md:flex-none',
      )}>
        {/* Cart header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobilePanel('menu')}
              className="md:hidden flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 -ml-1"
              aria-label="Back to menu"
            >
              <ArrowLeft size={15} />
            </button>
            <ShoppingCart size={15} className="text-primary-500" />
            <span className="text-sm font-bold">Cart</span>
            {cart.length > 0 && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                {cart.reduce((s, c) => s + c.quantity, 0)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {activeOrder && (
              <Button variant="ghost" size="icon-sm" title="Transfer table" onClick={() => setTransferOpen(true)}>
                <ArrowRightLeft size={13} className="text-muted-foreground hover:text-foreground" />
              </Button>
            )}
            {cart.length > 0 && (
              <Button variant="ghost" size="icon-sm" onClick={() => setCart([])}>
                <Trash2 size={13} className="text-danger" />
              </Button>
            )}
          </div>
        </div>

        {/* Customer attach */}
        <div className="px-4 py-2 border-b border-border/50 shrink-0">
          <CustomerPicker selected={customer} onSelect={setCustomer} />
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

      {/* Transfer table modal */}
      {transferOpen && activeOrder && (
        <TransferTableModal
          orderId={activeOrder.id}
          currentTableId={tableId}
          tables={allTables}
          onClose={() => setTransferOpen(false)}
          onTransfer={async (toTableId) => {
            await transferOrder.mutateAsync({ orderId: activeOrder.id, toTableId })
            setTransferOpen(false)
            router.push(`/floor/${toTableId}`)
          }}
          isPending={transferOrder.isPending}
        />
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function CustomerPicker({ selected, onSelect }: { selected: Customer | null; onSelect: (c: Customer | null) => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data } = useCustomers(query.length >= 2 ? { search: query } : undefined)
  const customers = data?.items ?? []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (selected) {
    return (
      <div className="flex items-center justify-between bg-primary-500/10 rounded-lg px-3 py-1.5">
        <div className="flex items-center gap-2">
          <UserRound size={12} className="text-primary-500 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-primary-500">{selected.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-muted-foreground">{selected.phone}</p>
              {selected.loyaltyPointsBalance > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-warning font-semibold">
                  <Star size={9} className="fill-warning text-warning" />
                  {selected.loyaltyPointsBalance} pts
                </span>
              )}
            </div>
          </div>
        </div>
        <button type="button" onClick={() => onSelect(null)} className="text-muted-foreground hover:text-foreground p-0.5">
          <X size={12} />
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 bg-background-card border border-border/50 rounded-lg px-2.5 py-1.5">
        <UserRound size={12} className="text-muted-foreground shrink-0" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Attach customer (optional)…"
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none min-w-0"
        />
      </div>
      {open && customers.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-background-card border border-border rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {customers.slice(0, 8).map(c => (
            <button key={c.id} type="button"
              onMouseDown={e => { e.preventDefault(); onSelect(c); setQuery(''); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-left">
              <div className="w-6 h-6 rounded-full bg-primary-500/15 text-primary-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.phone}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

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

function TransferTableModal({
  orderId,
  currentTableId,
  tables,
  onClose,
  onTransfer,
  isPending,
}: {
  orderId: string
  currentTableId: string
  tables: Table[]
  onClose: () => void
  onTransfer: (toTableId: string) => Promise<void>
  isPending: boolean
}) {
  const available = tables.filter(
    (t) => t.id !== currentTableId && t.status === 'AVAILABLE',
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background-card border border-border rounded-xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-bold">Transfer to Another Table</p>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto">
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No available tables to transfer to.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {available.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => onTransfer(t.id)}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-background hover:border-primary-500/60 hover:bg-background-hover transition-colors disabled:opacity-50"
                >
                  <span className="text-xs font-bold text-foreground">{t.name}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Cap {t.capacity}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const FOOD_BG: Record<string, string> = {
  VEG:     'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
  NON_VEG: 'linear-gradient(135deg, #450a0a 0%, #991b1b 100%)',
  EGG:     'linear-gradient(135deg, #451a03 0%, #92400e 100%)',
  VEGAN:   'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
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
        'flex flex-col items-start rounded-xl text-left overflow-hidden',
        'border border-border bg-background-card',
        'hover:border-primary-500/50 hover:shadow-md hover:shadow-black/10',
        'active:scale-[0.97] transition-all duration-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      {/* Image / food-type placeholder */}
      <div className="relative w-full h-[80px] shrink-0 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: FOOD_BG[item.foodType] ?? FOOD_BG.VEG }}
          />
        )}
        <div className="absolute bottom-1.5 left-1.5">
          <FoodTypeDot type={item.foodType} />
        </div>
        {item.isFeatured && (
          <div className="absolute top-1.5 right-1.5">
            <span className="text-[9px] font-bold text-warning bg-black/55 rounded-full px-1.5 py-0.5">⭐</span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col flex-1 p-2.5 w-full">
        <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight mb-auto">
          {item.name}
        </p>
        <div className="flex items-center justify-between w-full mt-1.5">
          <span className="text-xs font-bold text-primary-500 tabular-nums">
            {paise(displayPrice)}
          </span>
          {hasVariants && (
            <span className="text-[9px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
              +{item.variants.length - 1}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
