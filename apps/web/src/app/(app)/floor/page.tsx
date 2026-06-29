'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, QrCode, Download, RotateCcw, X } from 'lucide-react'
import { useTables, useFloors, useRefreshTableQR } from '@/hooks/use-tables'
import { TableChip } from '@/components/pos/table-chip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { Table } from '@/lib/api-types'

const STATUS_COUNT_LABEL: Record<string, { label: string; variant: 'success' | 'default' | 'info' | 'muted' }> = {
  AVAILABLE: { label: 'Free',    variant: 'success' },
  OCCUPIED:  { label: 'Busy',   variant: 'default' },
  RESERVED:  { label: 'Rsvd',   variant: 'info' },
  CLEANING:  { label: 'Clean',  variant: 'muted' },
}

export default function FloorPage() {
  const router = useRouter()
  const { data: floors = [], isLoading: floorsLoading } = useFloors()
  const { data: tables = [], isLoading: tablesLoading, refetch, isFetching } = useTables()

  const [activeFloor, setActiveFloor] = useState<string | null>(null)
  const [qrTable, setQrTable] = useState<Table | null>(null)

  const floorId = activeFloor ?? floors[0]?.id ?? null

  const filtered = floorId
    ? tables.filter((t) => t.floorId === floorId)
    : tables

  // summary counts
  const counts = filtered.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1
    return acc
  }, {})

  const isLoading = floorsLoading || tablesLoading

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(STATUS_COUNT_LABEL).map(([status, { label, variant }]) =>
            counts[status] ? (
              <Badge key={status} variant={variant}>
                {counts[status]} {label}
              </Badge>
            ) : null,
          )}
          <span className="text-xs text-muted-foreground">{filtered.length} tables total</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => refetch()}
          aria-label="Refresh floor plan"
        >
          <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
        </Button>
      </div>

      {/* Floor tabs */}
      {floors.length > 1 && (
        <div className="flex gap-1 mb-5 border-b border-border pb-0">
          <button
            type="button"
            onClick={() => setActiveFloor(null)}
            className={cn(
              'px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors duration-100',
              !activeFloor
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            All
          </button>
          {floors
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((floor) => (
              <button
                key={floor.id}
                type="button"
                onClick={() => setActiveFloor(floor.id)}
                className={cn(
                  'px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors duration-100',
                  activeFloor === floor.id
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {floor.name}
              </button>
            ))}
        </div>
      )}

      {/* Table grid */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" className="text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <p className="text-sm">No tables found. Add tables in Outlet Settings.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 content-start">
          {filtered.map((table) => (
            <div key={table.id} className="relative group">
              <TableChip
                table={table}
                onClick={() => router.push(`/floor/${table.id}`)}
              />
              {table.qrCode && (
                <button
                  type="button"
                  title="View QR code"
                  onClick={(e) => { e.stopPropagation(); setQrTable(table) }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:border-primary-500/60 hover:bg-primary-500/10"
                >
                  <QrCode size={10} className="text-muted-foreground" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-5 mt-6 pt-5 border-t border-border">
        {[
          { color: 'bg-success', label: 'Available' },
          { color: 'bg-primary-500', label: 'Occupied' },
          { color: 'bg-info', label: 'Reserved' },
          { color: 'bg-muted-foreground', label: 'Cleaning' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn('w-2.5 h-2.5 rounded-sm', color)} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* QR code modal */}
      {qrTable && (
        <QRModal
          table={qrTable}
          onClose={() => setQrTable(null)}
          onTableUpdate={(updated) => setQrTable(updated)}
        />
      )}
    </div>
  )
}

// ─── QR Modal ─────────────────────────────────────────────────────────────────

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

  function handleDownload() {
    if (!qrImageUrl) return
    const link = document.createElement('a')
    link.href = qrImageUrl
    link.download = `qr-${table.name.replace(/\s+/g, '-')}.png`
    link.click()
  }

  async function handleRefresh() {
    const updated = await refreshQR.mutateAsync(table.id)
    onTableUpdate(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background-card border border-border rounded-xl w-full max-w-xs shadow-2xl">
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
              className="w-48 h-48 rounded-lg border border-border"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-48 h-48 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground text-xs">
              No QR code
            </div>
          )}
          <p className="text-[10px] text-muted-foreground break-all text-center max-w-full px-2">
            {selfOrderUrl}
          </p>
          <div className="flex gap-2 w-full">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={handleDownload} disabled={!qrImageUrl}>
              <Download size={13} /> Download
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 gap-1.5" disabled={refreshQR.isPending} onClick={handleRefresh}>
              {refreshQR.isPending ? <Spinner size="xs" /> : <RotateCcw size={13} />} Refresh QR
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
