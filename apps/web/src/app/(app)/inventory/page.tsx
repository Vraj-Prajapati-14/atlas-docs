'use client'

import { useState } from 'react'
import { Search, AlertTriangle, Plus, X, Package } from 'lucide-react'
import { useInventoryItems, useAdjustStock, useCreateInventoryItem } from '@/hooks/use-inventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { InventoryItem, InventoryUnit, StockAdjustmentType } from '@/lib/api-types'

// ─── Constants ────────────────────────────────────────────────────────────────

const UNITS: InventoryUnit[] = ['KG', 'GRAM', 'LITRE', 'ML', 'PIECE', 'DOZEN', 'BOX']

const UNIT_ABBR: Record<InventoryUnit, string> = {
  KG: 'kg', GRAM: 'g', LITRE: 'L', ML: 'mL', PIECE: 'pc', DOZEN: 'doz', BOX: 'box',
}

const ADJ_TYPES: { value: StockAdjustmentType; label: string; description: string }[] = [
  { value: 'ADD',    label: 'Add stock',    description: 'Restock / purchase received' },
  { value: 'REMOVE', label: 'Remove stock', description: 'Usage / waste / transfer out' },
  { value: 'SET',    label: 'Set exact',    description: 'Physical count override' },
]

function formatStock(qty: number, unit: InventoryUnit) {
  return `${qty.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${UNIT_ABBR[unit]}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)

  const { data: items = [], isLoading } = useInventoryItems({ search: search || undefined, lowStockOnly })

  const lowStockCount = items.filter((i) => i.isLowStock).length

  return (
    <div className="space-y-5">
      {/* Header + actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search inventory…"
              className="pl-8 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setLowStockOnly((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 h-9 rounded-lg border text-xs font-semibold whitespace-nowrap transition-colors',
              lowStockOnly
                ? 'border-warning bg-warning/10 text-warning'
                : 'border-border text-muted-foreground hover:border-warning/40',
            )}
          >
            <AlertTriangle size={12} />
            Low stock
            {lowStockCount > 0 && (
              <span className={cn('ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold', lowStockOnly ? 'bg-warning/20' : 'bg-white/10')}>
                {lowStockCount}
              </span>
            )}
          </button>
        </div>
        <Button size="sm" onClick={() => setShowAddItem(true)}>
          <Plus size={13} /> Add Item
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="xl" className="text-primary-500" /></div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Package size={40} className="opacity-15" />
          <p className="text-sm">{lowStockOnly ? 'No low-stock items' : 'No inventory items yet'}</p>
          {!lowStockOnly && <Button variant="ghost" size="sm" onClick={() => setShowAddItem(true)}><Plus size={13} /> Add first item</Button>}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <Th>Item</Th>
                <Th className="text-right">Current Stock</Th>
                <Th className="text-right">Threshold</Th>
                <Th className="text-right">Cost / unit</Th>
                <Th className="text-right">Status</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={cn('transition-colors hover:bg-white/2', item.isLowStock && 'bg-warning/3')}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    {item.sku && <p className="text-[11px] text-muted-foreground">{item.sku}</p>}
                    {item.category && <p className="text-[11px] text-muted-foreground">{item.category}</p>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-mono font-semibold">
                    <span className={cn(item.isLowStock && 'text-warning')}>
                      {formatStock(item.currentStockInBaseUnit, item.unit)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {item.lowStockThreshold !== null
                      ? formatStock(item.lowStockThreshold, item.unit)
                      : <span className="opacity-30">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground font-mono">
                    {item.costPerUnitInPaise !== null
                      ? `₹ ${(item.costPerUnitInPaise / 100).toFixed(2)}`
                      : <span className="opacity-30">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.isLowStock ? (
                      <Badge variant="warning"><AlertTriangle size={9} /> Low</Badge>
                    ) : (
                      <Badge variant="success">OK</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAdjustingItem(item)}
                    >
                      Adjust
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust stock modal */}
      {adjustingItem && (
        <AdjustModal item={adjustingItem} onClose={() => setAdjustingItem(null)} />
      )}

      {/* Add item modal */}
      {showAddItem && (
        <AddItemModal onClose={() => setShowAddItem(false)} />
      )}
    </div>
  )
}

// ─── Adjust Modal ─────────────────────────────────────────────────────────────

function AdjustModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const [adjType, setAdjType] = useState<StockAdjustmentType>('ADD')
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const adjust = useAdjustStock()

  const handleSubmit = async (e: React.FormEvent) => {
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
            <p className="text-xs text-muted-foreground mt-0.5">{item.name} · currently {formatStock(item.currentStockInBaseUnit, item.unit)}</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X size={15} /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Adjustment type */}
          <div className="space-y-1.5">
            <Label>Adjustment type</Label>
            <div className="grid grid-cols-3 gap-2">
              {ADJ_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setAdjType(t.value)}
                  className={cn(
                    'flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-lg border text-left transition-all',
                    adjType === t.value ? 'border-primary-500 bg-primary-500/10' : 'border-border hover:border-primary-500/40',
                  )}
                >
                  <span className={cn('text-xs font-bold', adjType === t.value ? 'text-primary-500' : 'text-foreground')}>{t.label}</span>
                  <span className="text-[10px] text-muted-foreground">{t.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label>Quantity ({UNIT_ABBR[item.unit]})</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              className="font-mono text-base"
              autoFocus
            />
            {preview !== null && (
              <p className="text-xs text-muted-foreground">
                New stock: <span className={cn('font-semibold', preview <= (item.lowStockThreshold ?? Infinity) ? 'text-warning' : 'text-success')}>{formatStock(preview, item.unit)}</span>
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label>Note <span className="text-[11px] text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Morning delivery, waste log…"
            />
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={adjust.isPending}>
            {adjust.isPending ? <Spinner size="xs" /> : 'Confirm Adjustment'}
          </Button>
        </div>
      </form>
    </Overlay>
  )
}

// ─── Add Item Modal ───────────────────────────────────────────────────────────

function AddItemModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState<InventoryUnit>('KG')
  const [stock, setStock] = useState('')
  const [threshold, setThreshold] = useState('')
  const [cost, setCost] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const createItem = useCreateInventoryItem()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await createItem.mutateAsync({
      name: name.trim(),
      unit,
      currentStockInBaseUnit: parseFloat(stock) || 0,
      lowStockThreshold: threshold ? parseFloat(threshold) : undefined,
      costPerUnitInPaise: cost ? Math.round(parseFloat(cost) * 100) : undefined,
      sku: sku.trim() || undefined,
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
          <div className="space-y-1.5">
            <Label>Item name <span className="text-danger">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken Breast" autoFocus required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as InventoryUnit)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Opening stock ({unit.toLowerCase()})</Label>
              <Input type="number" step="0.01" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" className="font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Low-stock threshold</Label>
              <Input type="number" step="0.01" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="0" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>Cost / {unit.toLowerCase()} (₹)</Label>
              <Input type="number" step="0.01" min="0" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" className="font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>SKU / Code</Label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Protein, Produce" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={createItem.isPending}>
            {createItem.isPending ? <Spinner size="xs" /> : 'Add Item'}
          </Button>
        </div>
      </form>
    </Overlay>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-left', className)}>
      {children}
    </th>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>
  )
}
