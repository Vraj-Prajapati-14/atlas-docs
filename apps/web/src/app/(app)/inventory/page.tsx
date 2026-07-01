'use client'

import { useState } from 'react'
import {
  Search, AlertTriangle, Plus, X, Package,
  Truck, ShoppingCart, BookOpen, ChevronRight, CheckCircle2,
} from 'lucide-react'
import {
  useInventoryItems, useAdjustStock, useCreateInventoryItem,
  useSuppliers, useCreateSupplier, useUpdateSupplier,
  usePurchaseOrders, useCreatePurchaseOrder, useReceivePurchaseOrder,
  useRecipe, useSetRecipe,
} from '@/hooks/use-inventory'
import { useMenuItems } from '@/hooks/use-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { InventoryItem, InventoryUnit, StockAdjustmentType, Supplier, PurchaseOrder } from '@/lib/api-types'

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = 'stock' | 'suppliers' | 'orders' | 'recipes'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'stock',     label: 'Stock',           icon: Package },
  { id: 'suppliers', label: 'Suppliers',        icon: Truck },
  { id: 'orders',    label: 'Purchase Orders',  icon: ShoppingCart },
  { id: 'recipes',   label: 'Recipes',          icon: BookOpen },
]

const UNITS: InventoryUnit[] = ['KG', 'GRAM', 'LITRE', 'ML', 'PIECE', 'DOZEN', 'BOX']
const UNIT_ABBR: Record<string, string> = {
  KG: 'kg', GRAM: 'g', LITRE: 'L', ML: 'mL', PIECE: 'pc', DOZEN: 'doz', BOX: 'box',
}

const ADJ_TYPES: { value: StockAdjustmentType; label: string; desc: string }[] = [
  { value: 'ADD',    label: 'Add stock',    desc: 'Restock / purchase received' },
  { value: 'REMOVE', label: 'Remove stock', desc: 'Usage / waste / transfer out' },
  { value: 'SET',    label: 'Set exact',    desc: 'Physical count override' },
]

const PO_STATUS_VARIANT: Record<string, 'muted' | 'info' | 'success' | 'danger'> = {
  DRAFT: 'muted', ORDERED: 'info', RECEIVED: 'success', CANCELLED: 'danger',
}

function fmt(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function fmtStock(qty: number, unit: string) {
  return `${qty.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${UNIT_ABBR[unit] ?? unit}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>('stock')
  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === id
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'stock'     && <StockTab />}
      {tab === 'suppliers' && <SuppliersTab />}
      {tab === 'orders'    && <OrdersTab />}
      {tab === 'recipes'   && <RecipesTab />}
    </div>
  )
}

// ─── Stock Tab ────────────────────────────────────────────────────────────────

function StockTab() {
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const { data: items = [], isLoading } = useInventoryItems({ search: search || undefined, lowStockOnly })
  const lowStockCount = items.filter((i) => i.isLowStock).length

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search inventory…" className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button
            type="button" onClick={() => setLowStockOnly((v) => !v)}
            className={cn('flex items-center gap-1.5 px-3 h-9 rounded-lg border text-xs font-semibold whitespace-nowrap transition-colors',
              lowStockOnly ? 'border-warning bg-warning/10 text-warning' : 'border-border text-muted-foreground hover:border-warning/40')}
          >
            <AlertTriangle size={12} />
            Low stock
            {lowStockCount > 0 && (
              <span className={cn('ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold', lowStockOnly ? 'bg-warning/20' : 'bg-white/10')}>{lowStockCount}</span>
            )}
          </button>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={13} /> Add Item</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="xl" className="text-primary-500" /></div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Package size={40} className="opacity-15" />
          <p className="text-sm">{lowStockOnly ? 'No low-stock items' : 'No inventory items yet'}</p>
          {!lowStockOnly && <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}><Plus size={13} /> Add first item</Button>}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                {['Item', 'Current Stock', 'Threshold', 'Cost / unit', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className={cn('transition-colors hover:bg-white/2', item.isLowStock && 'bg-warning/3')}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    {item.category && <p className="text-[11px] text-muted-foreground">{item.category}</p>}
                  </td>
                  <td className="px-4 py-3 tabular-nums font-mono font-semibold">
                    <span className={cn(item.isLowStock && 'text-warning')}>{fmtStock(item.currentStockInBaseUnit, item.unit)}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {item.lowStockThreshold != null ? fmtStock(item.lowStockThreshold, item.unit) : <span className="opacity-30">—</span>}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground font-mono">
                    {item.costPerUnitInPaise != null ? `₹${(item.costPerUnitInPaise / 100).toFixed(2)}` : <span className="opacity-30">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {item.isLowStock ? <Badge variant="warning"><AlertTriangle size={9} className="mr-1" />Low</Badge> : <Badge variant="success">OK</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => setAdjustingItem(item)}>Adjust</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adjustingItem && <AdjustModal item={adjustingItem} onClose={() => setAdjustingItem(null)} />}
      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} />}
    </>
  )
}

// ─── Suppliers Tab ────────────────────────────────────────────────────────────

function SuppliersTab() {
  const { data: suppliers = [], isLoading } = useSuppliers()
  const [panel, setPanel] = useState<'add' | Supplier | null>(null)

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setPanel('add')}><Plus size={13} /> Add Supplier</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="xl" className="text-primary-500" /></div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Truck size={40} className="opacity-15" />
          <p className="text-sm">No suppliers yet.</p>
          <Button variant="ghost" size="sm" onClick={() => setPanel('add')}><Plus size={13} /> Add first supplier</Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                {['Supplier', 'Contact', 'Phone', 'GSTIN', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-white/2">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{s.name}</p>
                    {s.address && <p className="text-[11px] text-muted-foreground">{s.address}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.contactPerson ?? '—'}</td>
                  <td className="px-4 py-3 tabular-nums">{s.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{s.gstin ?? '—'}</td>
                  <td className="px-4 py-3"><Badge variant={s.isActive ? 'success' : 'muted'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => setPanel(s)}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {panel !== null && <SupplierPanel supplier={panel === 'add' ? null : panel} onClose={() => setPanel(null)} />}
    </>
  )
}

function SupplierPanel({ supplier, onClose }: { supplier: Supplier | null; onClose: () => void }) {
  const isEdit = !!supplier
  const create = useCreateSupplier()
  const update = useUpdateSupplier()
  const [name, setName] = useState(supplier?.name ?? '')
  const [phone, setPhone] = useState(supplier?.phone ?? '')
  const [contact, setContact] = useState(supplier?.contactPerson ?? '')
  const [email, setEmail] = useState(supplier?.email ?? '')
  const [gstin, setGstin] = useState(supplier?.gstin ?? '')
  const [address, setAddress] = useState(supplier?.address ?? '')

  const isPending = create.isPending || update.isPending
  const fieldCls = 'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40'

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const body = { name, phone, contactPerson: contact || undefined, email: email || undefined, gstin: gstin || undefined, address: address || undefined }
    if (isEdit) update.mutate({ id: supplier.id, ...body }, { onSuccess: onClose })
    else create.mutate(body, { onSuccess: onClose })
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold">{isEdit ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
        </div>
        <form onSubmit={submit} className="px-5 py-4 space-y-3">
          {[
            { label: 'Name *',   val: name,    set: setName,    req: true,  ph: 'Business name' },
            { label: 'Phone *',  val: phone,   set: setPhone,   req: true,  ph: '10-digit mobile' },
            { label: 'Contact',  val: contact, set: setContact, req: false, ph: 'Contact person' },
            { label: 'Email',    val: email,   set: setEmail,   req: false, ph: 'email@supplier.com' },
            { label: 'GSTIN',    val: gstin,   set: setGstin,   req: false, ph: '15-digit GST number' },
            { label: 'Address',  val: address, set: setAddress, req: false, ph: 'Full address' },
          ].map(({ label, val, set, req, ph }) => (
            <div key={label} className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">{label}</label>
              <input value={val} onChange={e => set(e.target.value)} required={req} placeholder={ph} className={fieldCls} />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? <Spinner size="xs" /> : isEdit ? 'Save' : 'Add Supplier'}</Button>
          </div>
        </form>
      </div>
    </Overlay>
  )
}

// ─── Purchase Orders Tab ──────────────────────────────────────────────────────

function OrdersTab() {
  const { data, isLoading } = usePurchaseOrders()
  const { data: suppliers = [] } = useSuppliers()
  const [showCreate, setShowCreate] = useState(false)
  const [receiving, setReceiving] = useState<PurchaseOrder | null>(null)
  const receive = useReceivePurchaseOrder()

  const orders = data ?? []

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus size={13} /> New Order</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="xl" className="text-primary-500" /></div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <ShoppingCart size={40} className="opacity-15" />
          <p className="text-sm">No purchase orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((po) => (
            <div key={po.id} className="rounded-xl border border-border bg-background-card p-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">#{po.poNumber}</span>
                  <Badge variant={PO_STATUS_VARIANT[po.status] ?? 'muted'}>{po.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {po.supplier?.name ?? '—'} · {po.items?.length ?? 0} item{(po.items?.length ?? 0) !== 1 ? 's' : ''} · {fmt(po.totalInPaise)}
                </p>
                {po.invoiceNumber && <p className="text-xs text-muted-foreground">Invoice: {po.invoiceNumber}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {po.status === 'ORDERED' && (
                  <Button size="sm" variant="success" disabled={receive.isPending}
                    onClick={() => setReceiving(po)}>
                    <CheckCircle2 size={13} className="mr-1" /> Receive
                  </Button>
                )}
                <button type="button" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreatePOModal suppliers={suppliers} onClose={() => setShowCreate(false)} />}
      {receiving && (
        <Overlay onClose={() => setReceiving(null)}>
          <ReceivePOModal po={receiving} onClose={() => setReceiving(null)} />
        </Overlay>
      )}
    </>
  )
}

function CreatePOModal({ suppliers, onClose }: { suppliers: Supplier[]; onClose: () => void }) {
  const { data: items = [] } = useInventoryItems()
  const create = useCreatePurchaseOrder()
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '')
  const [lines, setLines] = useState<{ inventoryItemId: string; quantity: string; unitPriceInPaise: string }[]>([
    { inventoryItemId: '', quantity: '', unitPriceInPaise: '' }
  ])
  const [note, setNote] = useState('')

  const selectCls = 'w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500'
  const inputCls  = 'w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono'

  function addLine() { setLines(l => [...l, { inventoryItemId: '', quantity: '', unitPriceInPaise: '' }]) }
  function removeLine(i: number) { setLines(l => l.filter((_, idx) => idx !== i)) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validLines = lines.filter(l => l.inventoryItemId && parseFloat(l.quantity) > 0)
    if (!validLines.length) return
    create.mutate({
      supplierId,
      items: validLines.map(l => ({
        inventoryItemId: l.inventoryItemId,
        quantity: parseFloat(l.quantity),
        unitPriceInPaise: Math.round(parseFloat(l.unitPriceInPaise || '0') * 100),
      })),
      note: note || undefined,
    }, { onSuccess: onClose })
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-sm font-bold">New Purchase Order</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Supplier</label>
            <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className={selectCls}>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Items</label>
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_80px_28px] gap-2 items-center">
                <select value={line.inventoryItemId} onChange={e => setLines(l => l.map((x, idx) => idx === i ? {...x, inventoryItemId: e.target.value} : x))} className={selectCls}>
                  <option value="">Select item…</option>
                  {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                </select>
                <input value={line.quantity} onChange={e => setLines(l => l.map((x, idx) => idx === i ? {...x, quantity: e.target.value} : x))}
                  type="number" min="0.01" step="0.01" placeholder="Qty" className={inputCls} />
                <input value={line.unitPriceInPaise} onChange={e => setLines(l => l.map((x, idx) => idx === i ? {...x, unitPriceInPaise: e.target.value} : x))}
                  type="number" min="0" step="0.01" placeholder="₹/unit" className={inputCls} />
                <button type="button" onClick={() => removeLine(i)} className="text-muted-foreground hover:text-danger"><X size={13} /></button>
              </div>
            ))}
            <button type="button" onClick={addLine} className="text-xs text-primary-500 hover:underline">+ Add line</button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Note</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note…" className={inputCls} />
          </div>
        </form>
        <div className="flex gap-2 px-5 pb-5 shrink-0">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="button" className="flex-1" disabled={create.isPending} onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}>
            {create.isPending ? <Spinner size="xs" /> : 'Create Order'}
          </Button>
        </div>
      </div>
    </Overlay>
  )
}

function ReceivePOModal({ po, onClose }: { po: PurchaseOrder; onClose: () => void }) {
  const receive = useReceivePurchaseOrder()
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [note, setNote] = useState('')
  const inputCls = 'w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500'

  return (
    <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-sm font-bold">Receive Stock — PO #{po.poNumber}</h2>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
      </div>
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs text-muted-foreground">This will mark the order as received and update inventory stock for all {po.items?.length ?? 0} item{(po.items?.length ?? 0) !== 1 ? 's' : ''}.</p>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Invoice number <span className="font-normal opacity-50">(optional)</span></label>
          <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="INV-001" className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Note <span className="font-normal opacity-50">(optional)</span></label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Receiving note…" className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2 px-5 pb-5">
        <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant="success" className="flex-1" disabled={receive.isPending}
          onClick={() => receive.mutate({ id: po.id, invoiceNumber: invoiceNumber || undefined, note: note || undefined }, { onSuccess: onClose })}>
          {receive.isPending ? <Spinner size="xs" /> : 'Confirm Receipt'}
        </Button>
      </div>
    </div>
  )
}

// ─── Recipes Tab ──────────────────────────────────────────────────────────────

function RecipesTab() {
  const { data: menuItems = [] } = useMenuItems()
  const { data: invItems = [] } = useInventoryItems()
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const selectedMenuItem = menuItems.find(m => m.id === selectedItemId)
  const { data: recipe = [], isLoading: recipeLoading } = useRecipe(selectedItemId)
  const setRecipe = useSetRecipe()

  const [ingredients, setIngredients] = useState<{ inventoryItemId: string; quantity: string }[]>([])

  function loadRecipe(id: string) {
    setSelectedItemId(id)
    setIngredients([])
  }

  function handleSave() {
    if (!selectedItemId) return
    const valid = ingredients.filter(i => i.inventoryItemId && parseFloat(i.quantity) > 0)
    setRecipe.mutate({ menuItemId: selectedItemId, ingredients: valid.map(i => ({ inventoryItemId: i.inventoryItemId, quantity: parseFloat(i.quantity) })) })
  }

  const selectCls = 'w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500'
  const inputCls  = 'h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono'

  // Initialise form when recipe loads
  function getDisplayIngredients() {
    if (ingredients.length > 0) return ingredients
    if (recipe.length > 0) return recipe.map(r => ({ inventoryItemId: r.inventoryItemId, quantity: String(r.quantity) }))
    return [{ inventoryItemId: '', quantity: '' }]
  }

  const displayIngredients = getDisplayIngredients()

  return (
    <div className="grid grid-cols-[260px_1fr] gap-6">
      {/* Menu item selector */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Menu Item</p>
        <div className="border border-border rounded-xl overflow-hidden">
          {menuItems.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No menu items.</p>
          ) : (
            menuItems.map(item => (
              <button
                key={item.id} type="button"
                onClick={() => loadRecipe(item.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm border-b border-border/50 last:border-0 transition-colors',
                  selectedItemId === item.id ? 'bg-primary-500/10 text-primary-500' : 'hover:bg-white/5 text-foreground',
                )}
              >
                <ChevronRight size={12} className={cn(selectedItemId === item.id ? 'opacity-100' : 'opacity-0')} />
                <span className="truncate">{item.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Recipe editor */}
      <div>
        {!selectedItemId ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
            <BookOpen size={32} className="opacity-15" />
            <p className="text-sm">Select a menu item to edit its recipe.</p>
          </div>
        ) : recipeLoading ? (
          <div className="flex justify-center py-20"><Spinner size="xl" className="text-primary-500" /></div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">{selectedMenuItem?.name} — Recipe</h3>
              {recipe.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Est. cost: ₹{(recipe.reduce((sum, r) => sum + r.quantity * (r.inventoryItem?.pricePerUnitPaise ?? 0), 0) / 100).toFixed(2)} / serving
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_120px_28px] gap-2 text-xs font-semibold text-muted-foreground px-1">
                <span>Ingredient</span><span>Qty / serving</span><span />
              </div>
              {displayIngredients.map((ing, i) => (
                <div key={i} className="grid grid-cols-[1fr_120px_28px] gap-2 items-center">
                  <select
                    value={ing.inventoryItemId}
                    onChange={e => {
                      const next = displayIngredients.map((x, idx) => idx === i ? {...x, inventoryItemId: e.target.value} : x)
                      setIngredients(next)
                    }}
                    className={selectCls}
                  >
                    <option value="">Select ingredient…</option>
                    {invItems.map(it => <option key={it.id} value={it.id}>{it.name} ({UNIT_ABBR[it.unit] ?? it.unit})</option>)}
                  </select>
                  <input
                    value={ing.quantity}
                    onChange={e => {
                      const next = displayIngredients.map((x, idx) => idx === i ? {...x, quantity: e.target.value} : x)
                      setIngredients(next)
                    }}
                    type="number" min="0.001" step="0.001" placeholder="0.000"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setIngredients(displayIngredients.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-danger"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setIngredients([...displayIngredients, { inventoryItemId: '', quantity: '' }])}
                className="text-xs text-primary-500 hover:underline"
              >
                + Add ingredient
              </button>
            </div>

            <div className="flex gap-3">
              <Button className="gap-2" disabled={setRecipe.isPending} onClick={handleSave}>
                {setRecipe.isPending ? <Spinner size="xs" /> : null}
                Save Recipe
              </Button>
              <Button variant="ghost" onClick={() => setIngredients([])}>Reset</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shared Modals ────────────────────────────────────────────────────────────

function AdjustModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const [adjType, setAdjType] = useState<StockAdjustmentType>('ADD')
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const adjust = useAdjustStock()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const quantity = parseFloat(qty)
    if (isNaN(quantity) || quantity <= 0) return
    await adjust.mutateAsync({ itemId: item.id, type: adjType, quantity, note: note.trim() || undefined })
    onClose()
  }

  const preview = (() => {
    const q = parseFloat(qty)
    if (isNaN(q) || q <= 0) return null
    const cur = item.currentStockInBaseUnit
    if (adjType === 'ADD')    return cur + q
    if (adjType === 'REMOVE') return Math.max(0, cur - q)
    if (adjType === 'SET')    return q
    return null
  })()

  return (
    <Overlay onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-bold">Adjust Stock</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{item.name} · currently {fmtStock(item.currentStockInBaseUnit, item.unit)}</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X size={15} /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Adjustment type</Label>
            <div className="grid grid-cols-3 gap-2">
              {ADJ_TYPES.map((t) => (
                <button key={t.value} type="button" onClick={() => setAdjType(t.value)}
                  className={cn('flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-lg border text-left transition-all',
                    adjType === t.value ? 'border-primary-500 bg-primary-500/10' : 'border-border hover:border-primary-500/40')}>
                  <span className={cn('text-xs font-bold', adjType === t.value ? 'text-primary-500' : 'text-foreground')}>{t.label}</span>
                  <span className="text-[10px] text-muted-foreground">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Quantity ({UNIT_ABBR[item.unit] ?? item.unit})</Label>
            <Input type="number" step="0.01" min="0.01" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" className="font-mono text-base" autoFocus />
            {preview !== null && (
              <p className="text-xs text-muted-foreground">
                New stock: <span className={cn('font-semibold', preview <= (item.lowStockThreshold ?? Infinity) ? 'text-warning' : 'text-success')}>{fmtStock(preview, item.unit)}</span>
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Note <span className="text-[11px] text-muted-foreground font-normal">(optional)</span></Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Morning delivery, waste log…" />
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={adjust.isPending}>{adjust.isPending ? <Spinner size="xs" /> : 'Confirm Adjustment'}</Button>
        </div>
      </form>
    </Overlay>
  )
}

function AddItemModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState<InventoryUnit>('KG')
  const [stock, setStock] = useState('')
  const [threshold, setThreshold] = useState('')
  const [cost, setCost] = useState('')
  const [category, setCategory] = useState('')
  const createItem = useCreateInventoryItem()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await createItem.mutateAsync({
      name: name.trim(), unit,
      currentStockInBaseUnit: parseFloat(stock) || 0,
      lowStockThreshold: threshold ? parseFloat(threshold) : undefined,
      costPerUnitInPaise: cost ? Math.round(parseFloat(cost) * 100) : undefined,
      category: category.trim() || undefined,
    })
    onClose()
  }

  return (
    <Overlay onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold">Add Inventory Item</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X size={15} /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="space-y-1.5"><Label>Item name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken Breast" autoFocus required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <select value={unit} onChange={(e) => setUnit(e.target.value as InventoryUnit)} className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><Label>Opening stock</Label><Input type="number" step="0.01" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" className="font-mono" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Low-stock threshold</Label><Input type="number" step="0.01" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="0" className="font-mono" /></div>
            <div className="space-y-1.5"><Label>Cost / unit (₹)</Label><Input type="number" step="0.01" min="0" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" className="font-mono" /></div>
          </div>
          <div className="space-y-1.5"><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Protein, Produce" /></div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={createItem.isPending}>{createItem.isPending ? <Spinner size="xs" /> : 'Add Item'}</Button>
        </div>
      </form>
    </Overlay>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      {children}
    </div>
  )
}
