import { cn } from '@/lib/utils'

export function BillingMockup() {
  const items = [
    { name: 'Butter Chicken ×2', price: '₹640' },
    { name: 'Garlic Naan ×4', price: '₹240' },
    { name: 'Dal Makhani ×1', price: '₹280' },
  ]
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-panel">
      <p className="mb-3 text-xs font-semibold text-ink-400">Table 12 · 4 Covers</p>
      <div className="space-y-2 border-b border-ink-100 pb-3">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <span className="text-ink-600">{item.name}</span>
            <span className="price font-semibold text-ink">{item.price}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between py-3 text-base font-bold text-ink">
        <span>Total</span>
        <span className="price">₹1,180</span>
      </div>
      <div className="grid grid-cols-2 gap-2" aria-hidden="true">
        <div className="rounded-lg border border-ink-200 py-2.5 text-center text-sm font-semibold text-ink">
          Split Bill
        </div>
        <div className="rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-white">
          Pay Now
        </div>
      </div>
    </div>
  )
}

export function InventoryMockup() {
  const stock = [
    { name: 'Tomato', pct: 12, tone: 'bg-danger' },
    { name: 'Paneer', pct: 68, tone: 'bg-success' },
    { name: 'Basmati Rice', pct: 84, tone: 'bg-success' },
    { name: 'Chicken', pct: 34, tone: 'bg-warning' },
  ]
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-panel">
      <p className="mb-3 text-xs font-semibold text-ink-400">Live Stock Levels</p>
      <div className="space-y-3.5">
        {stock.map((item) => (
          <div key={item.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-ink-600">{item.name}</span>
              <span className="text-xs font-semibold text-ink-400">{item.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-ink-100">
              <div className={cn('h-1.5 rounded-full', item.tone)} style={{ width: `${item.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">
        ⚠ Tomato below threshold — WhatsApp alert sent
      </div>
    </div>
  )
}

export function ReportsMockup() {
  const bars = [40, 62, 48, 75, 58, 88, 70]
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-panel">
      <p className="mb-3 text-xs font-semibold text-ink-400">Sales — Last 7 Days</p>
      <div className="flex h-24 items-end gap-2">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-primary-100">
            <div className="w-full rounded-t bg-primary" style={{ height: `${h}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-100 pt-3">
        {[
          { l: 'Total Sales', v: '₹1.9L' },
          { l: 'GST Collected', v: '₹9,480' },
          { l: 'Top Item', v: 'Biryani' },
        ].map((s) => (
          <div key={s.l}>
            <p className="truncate text-[10px] font-medium text-ink-400">{s.l}</p>
            <p className="text-sm font-bold text-ink">{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OrderingMockup() {
  const orders = [
    { source: 'Zomato', tone: 'text-danger bg-danger/10', status: 'New', id: '#4521' },
    { source: 'Swiggy', tone: 'text-warning bg-warning/10', status: 'Preparing', id: '#4519' },
    { source: 'Dine-in', tone: 'text-success bg-success/10', status: 'Ready', id: '#4522' },
  ]
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-panel">
      <p className="mb-3 text-xs font-semibold text-ink-400">Unified Order Queue</p>
      <div className="space-y-2.5">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-semibold text-ink">{order.id}</p>
              <p className="text-xs text-ink-400">{order.source}</p>
            </div>
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', order.tone)}>
              {order.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MenuMockup() {
  const items = [
    { name: 'Paneer Tikka', cat: 'Starters', price: '₹280' },
    { name: 'Butter Chicken', cat: 'Mains', price: '₹320' },
    { name: 'Garlic Naan', cat: 'Breads', price: '₹60' },
  ]
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-panel">
      <p className="mb-3 text-xs font-semibold text-ink-400">Menu Editor</p>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-semibold text-ink">{item.name}</p>
              <p className="text-xs text-ink-400">{item.cat}</p>
            </div>
            <span className="price text-sm font-semibold text-ink">{item.price}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-dashed border-ink-200 py-2.5 text-center text-xs font-semibold text-ink-400">
        + Add Item
      </div>
    </div>
  )
}

export function CrmMockup() {
  const customers = [
    { name: 'Ravi Kumar', visits: 14, spend: '₹8,420' },
    { name: 'Anjali Shah', visits: 9, spend: '₹5,180' },
    { name: 'Deepak Mehta', visits: 22, spend: '₹12,900' },
  ]
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-panel">
      <p className="mb-3 text-xs font-semibold text-ink-400">Customer Profiles</p>
      <div className="space-y-2.5">
        {customers.map((c) => (
          <div
            key={c.name}
            className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-50 text-xs font-bold text-primary">
                {c.name[0]}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{c.name}</p>
                <p className="text-xs text-ink-400">{c.visits} visits</p>
              </div>
            </div>
            <span className="price text-sm font-semibold text-ink">{c.spend}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
