'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react'
import type { Customer, Reservation } from '@/types'

interface CalendarViewProps {
  reservations: Reservation[]
  customerMap: Map<string, Customer>
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d)
  result.setDate(result.getDate() + n)
  return result
}

function getWeekStart(d: Date): Date {
  const result = new Date(d)
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - result.getDay())
  return result
}

function ReservationCard({
  reservation,
  customerMap,
}: {
  reservation: Reservation
  customerMap: Map<string, Customer>
}) {
  const customer = reservation.customerId ? customerMap.get(reservation.customerId) : null
  return (
    <div className="bg-white rounded-lg border border-brand-beige p-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-brand-plum/50 shrink-0" />
          <span className="text-sm font-semibold text-brand-plum">{reservation.time}</span>
          <span className="text-sm text-brand-plum">{reservation.partySize}名</span>
        </div>
        <div className="flex gap-1">
          {reservation.hasDesignation && (
            <span className="text-[10px] bg-brand-plum/10 text-brand-plum px-1.5 py-0.5 rounded-full font-medium">指名</span>
          )}
          {reservation.isAccompanied && (
            <span className="text-[10px] bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded-full font-medium">同伴</span>
          )}
          {reservation.priceType === 'party' && (
            <span className="text-[10px] bg-brand-coral/10 text-brand-coral px-1.5 py-0.5 rounded-full font-medium">パーティー</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
          reservation.customerType === 'existing'
            ? 'bg-brand-beige text-brand-plum/70'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {reservation.customerType === 'existing' ? '既存' : '初来店'}
        </span>
        {customer && (
          <Link href={`/customers/${customer.id}`} className="text-xs text-brand-plum font-medium hover:underline">
            {customer.name}
          </Link>
        )}
        {reservation.customerType === 'new' && reservation.guestName && (
          <span className="text-xs text-brand-plum/70">{reservation.guestName}</span>
        )}
      </div>
      {reservation.memo && (
        <p className="text-[11px] text-brand-plum/50 border-t border-brand-beige pt-1.5 line-clamp-1">{reservation.memo}</p>
      )}
    </div>
  )
}

export function CalendarView({ reservations, customerMap }: CalendarViewProps) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const todayStr = formatDate(today)

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [currentDate, setCurrentDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)

  // Build date → reservations map
  const reservationsByDate = useMemo(() => {
    const map = new Map<string, Reservation[]>()
    for (const r of reservations) {
      if (!map.has(r.date)) map.set(r.date, [])
      map.get(r.date)!.push(r)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.time.localeCompare(b.time))
    }
    return map
  }, [reservations])

  // Month grid cells
  const monthDays = useMemo(() => {
    if (viewMode !== 'month') return []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDow = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (Date | null)[] = Array(firstDow).fill(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [currentDate, viewMode])

  // Week days
  const weekDays = useMemo(() => {
    if (viewMode !== 'week') return []
    return Array.from({ length: 7 }, (_, i) => addDays(currentDate, i))
  }, [currentDate, viewMode])

  // Navigation
  function prev() {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else {
      setCurrentDate(addDays(currentDate, -7))
    }
  }
  function next() {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else {
      setCurrentDate(addDays(currentDate, 7))
    }
  }

  function switchView(mode: 'month' | 'week') {
    if (mode === viewMode) return
    if (mode === 'week') {
      // Show the week containing selectedDate
      const anchor = selectedDate ? new Date(selectedDate) : today
      setCurrentDate(getWeekStart(anchor))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
    }
    setViewMode(mode)
  }

  // Header label
  const headerLabel = useMemo(() => {
    if (viewMode === 'month') {
      return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`
    }
    const start = weekDays[0]
    const end = weekDays[6]
    if (!start || !end) return ''
    if (start.getMonth() === end.getMonth()) {
      return `${start.getFullYear()}年${start.getMonth() + 1}月 ${start.getDate()}〜${end.getDate()}日`
    }
    return `${start.getMonth() + 1}/${start.getDate()} 〜 ${end.getMonth() + 1}/${end.getDate()}`
  }, [viewMode, currentDate, weekDays])

  const selectedReservations = reservationsByDate.get(selectedDate) ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-28">
      {/* Title + date picker + toggle */}
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-xl font-bold text-brand-plum shrink-0">予約</h1>

        {/* Date picker — center */}
        <div className="flex-1 flex justify-center">
          {viewMode === 'month' ? (
            <input
              type="month"
              value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number)
                if (y && m) setCurrentDate(new Date(y, m - 1, 1))
              }}
              className="w-full max-w-[160px] text-sm text-brand-plum border border-brand-beige rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-brand-plum/20"
            />
          ) : (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const val = e.target.value
                if (val) {
                  setSelectedDate(val)
                  setCurrentDate(getWeekStart(new Date(val)))
                }
              }}
              className="w-full max-w-[160px] text-sm text-brand-plum border border-brand-beige rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-brand-plum/20"
            />
          )}
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-brand-beige overflow-hidden text-sm font-medium shrink-0">
          <button
            onClick={() => switchView('month')}
            className={`px-3 py-1.5 transition-colors ${viewMode === 'month' ? 'bg-brand-plum text-white' : 'text-brand-plum/60 hover:bg-brand-beige/50'}`}
          >
            月
          </button>
          <button
            onClick={() => switchView('week')}
            className={`px-3 py-1.5 transition-colors ${viewMode === 'week' ? 'bg-brand-plum text-white' : 'text-brand-plum/60 hover:bg-brand-beige/50'}`}
          >
            週
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prev}
          className="p-2 rounded-lg hover:bg-brand-beige/50 text-brand-plum transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-brand-plum">{headerLabel}</span>
        <button
          onClick={next}
          className="p-2 rounded-lg hover:bg-brand-beige/50 text-brand-plum transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ── Month view ── */}
      {viewMode === 'month' && (
        <>
          <div className="bg-white rounded-xl border border-brand-beige overflow-hidden">
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 border-b border-brand-beige">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  className={`text-center py-2 text-xs font-semibold ${
                    i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-brand-plum/50'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
            {/* Calendar cells */}
            <div className="grid grid-cols-7">
              {monthDays.map((day, idx) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[52px] border-b border-r border-brand-beige/40 last:border-r-0"
                    />
                  )
                }
                const dateStr = formatDate(day)
                const count = reservationsByDate.get(dateStr)?.length ?? 0
                const isToday = dateStr === todayStr
                const isSelected = dateStr === selectedDate
                const dow = day.getDay()
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[52px] border-b border-r border-brand-beige/40 p-1 flex flex-col items-center gap-0.5 transition-colors ${
                      isSelected ? 'bg-brand-plum/10' : 'hover:bg-brand-beige/30'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                        isToday
                          ? 'bg-brand-plum text-white'
                          : dow === 0
                          ? 'text-red-400'
                          : dow === 6
                          ? 'text-blue-400'
                          : 'text-brand-plum'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {count > 0 && (
                      <span className="text-[10px] font-bold text-brand-coral bg-brand-coral/10 rounded-full px-1.5 leading-4">
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected day reservations */}
          <div className="mt-4 space-y-2">
            <h2 className="text-sm font-semibold text-brand-plum/60">
              {selectedDate.replace(/-/g, '/')}
            </h2>
            {selectedReservations.length === 0 ? (
              <p className="text-sm text-brand-plum/30 py-2">予約なし</p>
            ) : (
              selectedReservations.map((r) => (
                <ReservationCard key={r.id} reservation={r} customerMap={customerMap} />
              ))
            )}
          </div>
        </>
      )}

      {/* ── Week view ── */}
      {viewMode === 'week' && (
        <>
          {/* Horizontal day strip */}
          <div className="bg-white rounded-xl border border-brand-beige mb-4 overflow-x-auto">
            <div className="flex min-w-max sm:min-w-0 sm:grid sm:grid-cols-7">
              {weekDays.map((day) => {
                const dateStr = formatDate(day)
                const count = reservationsByDate.get(dateStr)?.length ?? 0
                const isToday = dateStr === todayStr
                const isSelected = dateStr === selectedDate
                const dow = day.getDay()
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex flex-col items-center justify-center gap-0.5 py-2 px-4 sm:px-1 min-w-[52px] sm:min-w-0 transition-colors ${
                      isSelected ? 'bg-brand-plum/10' : 'hover:bg-brand-beige/30'
                    }`}
                  >
                    <span
                      className={`text-[11px] font-semibold ${
                        dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-brand-plum/50'
                      }`}
                    >
                      {DAY_LABELS[dow]}
                    </span>
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                        isToday
                          ? 'bg-brand-plum text-white'
                          : isSelected
                          ? 'bg-brand-plum/20 text-brand-plum'
                          : dow === 0
                          ? 'text-red-400'
                          : dow === 6
                          ? 'text-blue-400'
                          : 'text-brand-plum'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {count > 0 ? (
                      <span className="text-[10px] font-bold text-brand-coral bg-brand-coral/10 rounded-full px-1.5 leading-4">
                        {count}
                      </span>
                    ) : (
                      <span className="h-4" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected day reservations */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-brand-plum/60">
              {selectedDate.replace(/-/g, '/')}
            </h2>
            {selectedReservations.length === 0 ? (
              <p className="text-sm text-brand-plum/30 py-2">予約なし</p>
            ) : (
              selectedReservations.map((r) => (
                <ReservationCard key={r.id} reservation={r} customerMap={customerMap} />
              ))
            )}
          </div>
        </>
      )}

      {/* FAB */}
      <Link
        href="/reservations/new"
        className="fixed bottom-20 right-4 sm:bottom-6 z-40 w-14 h-14 bg-brand-plum hover:bg-brand-plum/90 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="予約を追加"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  )
}
