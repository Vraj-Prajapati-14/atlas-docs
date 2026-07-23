'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  RefreshCw, QrCode, Download, RotateCcw, X, LayoutGrid, ShoppingBag,
  Bike, Plus, Smartphone, ArrowLeftRight, ChevronDown, Check,
  User, Phone, Users, Clock, FileText, Copy,
} from 'lucide-react'
import { useTables, useFloors, useRefreshTableQR, useUpdateTableStatus } from '@/hooks/use-tables'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Floor, Table, TableStatus } from '@/lib/api-types'

// ─── Reservation data (client-side, keyed by tableId) ─────────────────────────

interface ReservationInfo {
  guestName: string
  phone:     string
  partySize: number
  time:      string   // "HH:MM"
  notes:     string
}

// ─── Status visual config ─────────────────────────────────────────────────────

const STATUS_CFG: Record<TableStatus, {
  barClass:    string
  bgClass:     string
  borderClass: string
  textClass:   string
  label:       string
}> = {
  AVAILABLE: {
    barClass:    'bg-muted-foreground/20',
    bgClass:     'bg-background-card',
    borderClass: 'border-border',
    textClass:   'text-foreground',
    label:       'Blank Table',
  },
  OCCUPIED: {
    barClass:    'bg-info',
    bgClass:     'bg-info/8',
    borderClass: 'border-info/50',
    textClass:   'text-info',
    label:       'Running Table',
  },
  RESERVED: {
    barClass:    'bg-primary-500',
    bgClass:     'bg-primary-500/8',
    borderClass: 'border-primary-500/50',
    textClass:   'text-primary-500',
    label:       'Reserved',
  },
  CLEANING: {
    barClass:    'bg-warning',
    bgClass:     'bg-warning/8',
    borderClass: 'border-warning/40',
    textClass:   'text-warning',
    label:       'Cleaning',
  },
  BLOCKED: {
    barClass:    'bg-muted-foreground/20',
    bgClass:     'bg-muted/10',
    borderClass: 'border-border/30',
    textClass:   'text-muted-foreground/40',
    label:       'Blocked',
  },
}

const LEGEND: TableStatus[] = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING']

// ─── Pet Pooja-style table card ────────────────────────────────────────────────

interface TableCardProps {
  table:          Table
  moveMode:       boolean
  isMoveSource:   boolean
  reservation?:  ReservationInfo
  onClick:        () => void
  onQrClick:      (e: React.MouseEvent) => void
  onViewOrder:    (e: React.MouseEvent) => void
}

function TableCard({ table, moveMode, isMoveSource, reservation, onClick, onQrClick, onViewOrder }: TableCardProps) {
  const cfg = STATUS_CFG[table.status]
  const isBlocked = table.status === 'BLOCKED'

  return (
    <button
      type="button"
      onClick={isBlocked ? undefined : onClick}
      disabled={isBlocked}
      className={cn(
        'relative flex flex-col w-[82px] rounded-xl border-2 transition-all duration-150 overflow-hidden',
        cfg.bgClass, cfg.borderClass,
        !isBlocked && 'cursor-pointer hover:shadow-md active:scale-[0.97]',
        isBlocked && 'opacity-40 cursor-not-allowed',
        isMoveSource && 'ring-2 ring-primary-500 ring-offset-2 ring-offset-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60',
      )}
      aria-label={`${table.name} — ${cfg.label}`}
    >
      {/* Coloured top bar */}
      <div className={cn('h-1 w-full', cfg.barClass)} />

      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-1 px-2 py-2 gap-0.5 min-h-[52px]">
        {/* Move-mode checkbox */}
        {moveMode && !isBlocked && (
          <div className={cn(
            'absolute top-2.5 right-2 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center',
            isMoveSource ? 'bg-primary-500 border-primary-500 text-white' : 'border-border',
          )}>
            {isMoveSource && <Check size={8} />}
          </div>
        )}

        {/* Table name */}
        <span className={cn('text-[12px] font-bold leading-tight text-center', cfg.textClass)}>
          {table.name}
        </span>

        {/* Sub-info */}
        {reservation && table.status === 'RESERVED' ? (
          <span className="text-[9px] text-muted-foreground leading-tight truncate max-w-full">
            {reservation.guestName}
          </span>
        ) : table.status === 'AVAILABLE' ? (
          <span className="text-[9px] text-muted-foreground">{table.capacity} seats</span>
        ) : (
          <span className={cn('text-[9px] font-medium', cfg.textClass, 'opacity-70')}>
            {cfg.label}
          </span>
        )}
      </div>

      {/* Action icon row */}
      <div className="flex items-center justify-center gap-1.5 pb-1.5 h-5 shrink-0">
        {table.status === 'OCCUPIED' && (
          <span
            role="button"
            onClick={onViewOrder}
            className="flex items-center justify-center w-4 h-4 rounded text-muted-foreground/70 hover:text-foreground transition-colors"
            title="View order"
          >
            <LayoutGrid size={9} />
          </span>
        )}
        {table.qrCode && (
          <span
            role="button"
            onClick={onQrClick}
            className="flex items-center justify-center w-4 h-4 rounded text-muted-foreground/70 hover:text-foreground transition-colors"
            title="QR code"
          >
            <QrCode size={9} />
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Floor tab ────────────────────────────────────────────────────────────────

function FloorTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors duration-100',
        active
          ? 'border-primary-500 text-primary-500'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FloorPage() {
  const router = useRouter()
  const { data: floors  = [], isLoading: floorsLoading }                    = useFloors()
  const { data: tables  = [], isLoading: tablesLoading, refetch, isFetching } = useTables()
  const updateStatus = useUpdateTableStatus()

  const [activeFloor,     setActiveFloor]     = useState<string | 'all'>('all')
  const [moveMode,        setMoveMode]        = useState(false)
  const [moveSource,      setMoveSource]      = useState<Table | null>(null)
  const [showReservation, setShowReservation] = useState(false)
  const [showContactless, setShowContactless] = useState(false)
  const [qrTable,         setQrTable]         = useState<Table | null>(null)
  const [reservations,    setReservations]    = useState<Record<string, ReservationInfo>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem('atlas-reservations')
      if (saved) setReservations(JSON.parse(saved))
    } catch {}
  }, [])

  function saveReservation(tableId: string, info: ReservationInfo) {
    const next = { ...reservations, [tableId]: info }
    setReservations(next)
    localStorage.setItem('atlas-reservations', JSON.stringify(next))
  }

  function clearReservation(tableId: string) {
    const next = { ...reservations }
    delete next[tableId]
    setReservations(next)
    localStorage.setItem('atlas-reservations', JSON.stringify(next))
  }

  const isLoading = floorsLoading || tablesLoading

  const visibleTables = activeFloor === 'all'
    ? tables
    : tables.filter((t) => t.floorId === activeFloor)

  const totalCounts = tables.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1
    return acc
  }, {})

  const sections: { floor: Floor | null; tables: Table[] }[] =
    activeFloor === 'all'
      ? floors
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((floor) => ({
            floor,
            tables: visibleTables.filter((t) => t.floorId === floor.id),
          }))
          .filter((s) => s.tables.length > 0)
      : [{ floor: floors.find((f) => f.id === activeFloor) ?? null, tables: visibleTables }]

  const unassigned = visibleTables.filter((t) => !t.floorId)
  if (unassigned.length > 0) sections.push({ floor: null, tables: unassigned })

  function handleTableClick(table: Table) {
    if (moveMode) {
      if (!moveSource) {
        if (table.status !== 'OCCUPIED') {
          toast.error('Select an occupied table as the source.')
          return
        }
        setMoveSource(table)
        toast.info(`Source: ${table.name}. Now click the destination table.`)
      } else {
        if (table.id === moveSource.id) { setMoveSource(null); return }
        if (table.status !== 'AVAILABLE') {
          toast.error('Destination must be an available table.')
          return
        }
        toast.info(`Move KOT: ${moveSource.name} → ${table.name} — feature coming soon.`, { duration: 4000 })
        setMoveMode(false)
        setMoveSource(null)
      }
      return
    }
    router.push(`/floor/${table.id}`)
  }

  return (
    <div className="flex flex-col h-full -m-6 bg-background">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background shrink-0 gap-3 flex-wrap">
        {/* Title + counts */}
        <div className="flex items-center gap-3 flex-wrap">
          <LayoutGrid size={16} className="text-primary-500 shrink-0" />
          <span className="text-sm font-bold text-foreground">Table View</span>
          <div className="flex items-center gap-1.5">
            {(totalCounts['AVAILABLE'] ?? 0) > 0 && (
              <span className="text-[10px] font-semibold text-muted-foreground bg-background-hover border border-border px-2 py-0.5 rounded-full">
                {totalCounts['AVAILABLE']} Blank
              </span>
            )}
            {(totalCounts['OCCUPIED'] ?? 0) > 0 && (
              <span className="text-[10px] font-semibold text-info bg-info/10 border border-info/25 px-2 py-0.5 rounded-full">
                {totalCounts['OCCUPIED']} Running
              </span>
            )}
            {(totalCounts['RESERVED'] ?? 0) > 0 && (
              <span className="text-[10px] font-semibold text-primary-500 bg-primary-500/10 border border-primary-500/25 px-2 py-0.5 rounded-full">
                {totalCounts['RESERVED']} Reserved
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs border-info/40 text-info hover:bg-info/10 hover:border-info"
            onClick={() => router.push('/orders?new=delivery')}
          >
            <Bike size={12} /> Delivery
          </Button>
          <Button
            size="sm"
            className="gap-1.5 text-xs bg-primary-500 hover:bg-primary-600 text-white border-0"
            onClick={() => router.push('/orders?new=takeaway')}
          >
            <ShoppingBag size={12} /> Take Away
          </Button>
          <button
            type="button"
            onClick={() => refetch()}
            aria-label="Refresh"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors"
          >
            <RefreshCw size={13} className={cn(isFetching && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-border bg-background-card shrink-0 gap-3 flex-wrap min-h-[44px]">
        {/* Left: feature buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowReservation(true)}
            className="flex items-center gap-1 h-7 px-2.5 rounded-md text-[12px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors"
          >
            <Plus size={11} className="text-primary-500" /> Table Reservation
          </button>
          <button
            type="button"
            onClick={() => setShowContactless(true)}
            className="flex items-center gap-1 h-7 px-2.5 rounded-md text-[12px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors"
          >
            <Smartphone size={11} className="text-info" /> Contactless
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            type="button"
            onClick={() => { setMoveMode(!moveMode); setMoveSource(null) }}
            className={cn(
              'flex items-center gap-1 h-7 px-2.5 rounded-md text-[12px] font-medium transition-all',
              moveMode
                ? 'bg-primary-500 text-white border-0'
                : 'border border-border text-muted-foreground hover:text-foreground hover:bg-background-hover',
            )}
          >
            <ArrowLeftRight size={11} />
            Move KOT/Items
            {moveMode && (
              <span className="ml-1 text-[10px] opacity-80">
                {moveSource ? `→ select dest` : 'select source'}
              </span>
            )}
          </button>
        </div>

        {/* Right: legend + floor plan */}
        <div className="flex items-center gap-4">
          {/* Status legend */}
          <div className="hidden lg:flex items-center gap-3">
            {LEGEND.map((status) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={cn('w-2.5 h-2.5 rounded-sm', STATUS_CFG[status].barClass)} />
                <span className="text-[10px] text-muted-foreground">{STATUS_CFG[status].label}</span>
              </div>
            ))}
          </div>

          {/* Floor Plan dropdown */}
          <div className="flex items-center gap-1.5 text-[11px] border border-border rounded-md px-2.5 h-7 bg-background">
            <span className="text-muted-foreground font-medium hidden sm:inline">Floor Plan:</span>
            <select
              value={activeFloor}
              onChange={(e) => setActiveFloor(e.target.value)}
              className="bg-transparent text-[11px] font-semibold text-foreground outline-none cursor-pointer pr-1"
            >
              <option value="all">All Floors</option>
              {floors.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <ChevronDown size={10} className="text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Floor tabs (only when > 1 floor) ─────────────────────────────────── */}
      {floors.length > 1 && (
        <div className="flex items-center gap-0.5 px-5 border-b border-border bg-background shrink-0 overflow-x-auto">
          <FloorTab active={activeFloor === 'all'} onClick={() => setActiveFloor('all')}>All Floors</FloorTab>
          {floors.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((f) => (
            <FloorTab key={f.id} active={activeFloor === f.id} onClick={() => setActiveFloor(f.id)}>
              {f.name}
            </FloorTab>
          ))}
        </div>
      )}

      {/* ── Table grid ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="xl" className="text-primary-500" />
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <LayoutGrid size={48} className="opacity-10" />
            <p className="text-sm font-semibold">No tables found</p>
            <p className="text-xs opacity-60">Add tables in Outlet Settings → Tables.</p>
          </div>
        ) : (
          <div className="space-y-7">
            {sections.map((section) => (
              <div key={section.floor?.id ?? 'unassigned'}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground shrink-0">
                    {section.floor?.name ?? 'General'}
                  </span>
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-[10px] text-muted-foreground/40 shrink-0">
                    {section.tables.length} tables
                  </span>
                </div>

                {/* Table cards */}
                <div className="flex flex-wrap gap-2.5">
                  {section.tables.map((table) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      moveMode={moveMode}
                      isMoveSource={moveSource?.id === table.id}
                      reservation={reservations[table.id]}
                      onClick={() => handleTableClick(table)}
                      onQrClick={(e) => { e.stopPropagation(); setQrTable(table) }}
                      onViewOrder={(e) => { e.stopPropagation(); router.push(`/floor/${table.id}`) }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {showReservation && (
        <ReservationModal
          availableTables={tables.filter((t) => t.status === 'AVAILABLE')}
          isPending={updateStatus.isPending}
          onClose={() => setShowReservation(false)}
          onConfirm={(tableId, info) => {
            updateStatus.mutate(
              { tableId, status: 'RESERVED' },
              {
                onSuccess: () => {
                  saveReservation(tableId, info)
                  setShowReservation(false)
                  toast.success(`Table reserved for ${info.guestName}`)
                },
              },
            )
          }}
        />
      )}

      {showContactless && (
        <ContactlessModal
          tables={tables.filter((t) => !!t.qrCode)}
          onClose={() => setShowContactless(false)}
        />
      )}

      {qrTable && (
        <QRModal
          table={qrTable}
          onClose={() => setQrTable(null)}
          onTableUpdate={(t) => setQrTable(t)}
        />
      )}
    </div>
  )
}

// ─── Reservation Modal ────────────────────────────────────────────────────────

function ReservationModal({
  availableTables,
  isPending,
  onClose,
  onConfirm,
}: {
  availableTables: Table[]
  isPending: boolean
  onClose: () => void
  onConfirm: (tableId: string, info: ReservationInfo) => void
}) {
  const [guestName, setGuestName] = useState('')
  const [phone,     setPhone]     = useState('')
  const [partySize, setPartySize] = useState(2)
  const [time,      setTime]      = useState(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  })
  const [notes,     setNotes]     = useState('')
  const [tableId,   setTableId]   = useState(availableTables[0]?.id ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tableId) { toast.error('Select a table'); return }
    if (!guestName.trim()) { toast.error('Guest name is required'); return }
    onConfirm(tableId, { guestName: guestName.trim(), phone, partySize, time, notes })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-500/15 flex items-center justify-center">
              <User size={14} className="text-primary-500" />
            </div>
            <p className="text-sm font-bold">Table Reservation</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Guest name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Guest Name *</label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                autoFocus
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter guest name"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/20 transition-colors"
              />
            </div>
          </div>

          {/* Phone + Party size (2 col) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Phone</label>
              <div className="relative">
                <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary-500/60 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Party Size</label>
              <div className="relative">
                <Users size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-[13px] text-foreground outline-none focus:border-primary-500/60 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Time + Table (2 col) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Time</label>
              <div className="relative">
                <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-[13px] text-foreground outline-none focus:border-primary-500/60 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Table</label>
              <select
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-[13px] text-foreground outline-none focus:border-primary-500/60 transition-colors"
              >
                {availableTables.length === 0 && (
                  <option value="">No available tables</option>
                )}
                {availableTables.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.capacity}p)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Notes</label>
            <div className="relative">
              <FileText size={12} className="absolute left-3 top-3 text-muted-foreground pointer-events-none" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special requests, allergies…"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary-500/60 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white border-0 gap-1.5"
              disabled={isPending || !tableId || !guestName.trim()}
            >
              {isPending ? <Spinner size="xs" /> : <Check size={13} />}
              Reserve Table
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Contactless / QR ordering modal ─────────────────────────────────────────

function ContactlessModal({ tables, onClose }: { tables: Table[]; onClose: () => void }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  function getUrl(t: Table) {
    return `${origin}/order?qr=${encodeURIComponent(t.qrCode ?? '')}`
  }

  function getQrImage(t: Table) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(getUrl(t))}&margin=8&bgcolor=ffffff`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-info/15 flex items-center justify-center">
              <Smartphone size={14} className="text-info" />
            </div>
            <div>
              <p className="text-sm font-bold">Contactless Self-Ordering</p>
              <p className="text-[11px] text-muted-foreground">Customers scan QR to order from their phone</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Table list */}
        <div className="flex-1 overflow-y-auto p-5">
          {tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <QrCode size={40} className="opacity-10" />
              <p className="text-sm">No QR codes generated yet.</p>
              <p className="text-xs opacity-60">Go to Outlet Settings → Tables to generate QR codes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tables.map((t) => (
                <div key={t.id} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-background">
                  <img
                    src={getQrImage(t)}
                    alt={`QR for ${t.name}`}
                    className="w-32 h-32 rounded-lg border border-border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <p className="text-[12px] font-semibold text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.capacity} seats</p>
                  <div className="flex gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = getQrImage(t)
                        link.download = `qr-${t.name.replace(/\s+/g, '-')}.png`
                        link.click()
                      }}
                      className="flex-1 flex items-center justify-center gap-1 h-7 rounded-md text-[11px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors"
                    >
                      <Download size={11} /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(getUrl(t))
                        toast.success(`Copied ${t.name} URL`)
                      }}
                      className="flex-1 flex items-center justify-center gap-1 h-7 rounded-md text-[11px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-background-hover transition-colors"
                    >
                      <Copy size={11} /> Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── QR Modal (single table) ─────────────────────────────────────────────────

function QRModal({
  table,
  onClose,
  onTableUpdate,
}: {
  table: Table
  onClose: () => void
  onTableUpdate: (t: Table) => void
}) {
  const refreshQR = useRefreshTableQR()

  const selfOrderUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/order?qr=${encodeURIComponent(table.qrCode ?? '')}`
    : ''

  const qrImageUrl = table.qrCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selfOrderUrl)}&margin=10&bgcolor=ffffff`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background-card border border-border rounded-2xl w-full max-w-xs shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <QrCode size={15} className="text-primary-500" />
            <p className="text-sm font-bold">{table.name} — QR Code</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 flex flex-col items-center gap-4">
          {qrImageUrl ? (
            <img
              src={qrImageUrl}
              alt={`QR for ${table.name}`}
              className="w-48 h-48 rounded-xl border border-border"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-48 h-48 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground text-xs">
              No QR code
            </div>
          )}
          <p className="text-[10px] text-muted-foreground break-all text-center max-w-full px-2">{selfOrderUrl}</p>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              disabled={!qrImageUrl}
              onClick={() => {
                const link = document.createElement('a')
                link.href = qrImageUrl!
                link.download = `qr-${table.name.replace(/\s+/g, '-')}.png`
                link.click()
              }}
            >
              <Download size={13} /> Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-1.5"
              disabled={refreshQR.isPending}
              onClick={async () => {
                const updated = await refreshQR.mutateAsync(table.id)
                onTableUpdate(updated)
              }}
            >
              {refreshQR.isPending ? <Spinner size="xs" /> : <RotateCcw size={13} />} Refresh QR
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
