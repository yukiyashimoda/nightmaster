import Link from 'next/link'
import { getReservations, getCustomers } from '@/lib/kv'
import { Button } from '@/components/ui/button'
import { Plus, Users, Clock, Star, Utensils } from 'lucide-react'
import type { Customer, Reservation } from '@/types'

function ReservationCard({ reservation, customerMap }: { reservation: Reservation; customerMap: Map<string, Customer> }) {
  const customer = reservation.customerId ? customerMap.get(reservation.customerId) : null

  return (
    <div className="bg-white rounded-lg border border-brand-beige p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-sm text-brand-plum/60">
            <Clock className="h-3.5 w-3.5" />
            <span>{reservation.date} {reservation.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-plum/50" />
            <span className="text-sm text-brand-plum">{reservation.partySize}名</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {reservation.hasDesignation && (
            <span className="text-xs bg-brand-plum/10 text-brand-plum px-2 py-0.5 rounded-full font-medium">
              <Star className="h-3 w-3 inline mr-0.5" />指名あり
            </span>
          )}
          {reservation.isAccompanied && (
            <span className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full font-medium">
              同伴出勤
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          reservation.customerType === 'existing'
            ? 'bg-brand-coral/10 text-brand-coral'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {reservation.customerType === 'existing' ? '既存顧客' : '初来店'}
        </span>

        {customer && (
          <Link
            href={`/customers/${customer.id}`}
            className="text-sm text-brand-plum font-medium hover:underline"
          >
            {customer.name}
          </Link>
        )}

        {reservation.priceType === 'party' && (
          <span className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full font-medium">
            <Utensils className="h-3 w-3 inline mr-0.5" />パーティー
            {reservation.partyPlanPrice != null && ` ¥${reservation.partyPlanPrice.toLocaleString()}`}
            {reservation.partyPlanMinutes != null && ` ${reservation.partyPlanMinutes}分`}
          </span>
        )}
      </div>

      {reservation.memo && (
        <p className="text-xs text-brand-plum/60 border-t border-brand-beige pt-2">{reservation.memo}</p>
      )}
    </div>
  )
}

export default async function ReservationsPage() {
  const [reservations, customers] = await Promise.all([getReservations(), getCustomers()])
  const customerMap = new Map(customers.map((c) => [c.id, c]))

  // Group by date
  const grouped = reservations.reduce<Record<string, Reservation[]>>((acc, r) => {
    if (!acc[r.date]) acc[r.date] = []
    acc[r.date].push(r)
    return acc
  }, {})

  const dates = Object.keys(grouped).sort()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-brand-plum">予約一覧</h1>
        <Link href="/reservations/new">
          <Button size="sm" className="bg-brand-plum hover:bg-brand-plum/90 text-white">
            <Plus className="h-4 w-4 mr-1" />新規登録
          </Button>
        </Link>
      </div>

      {dates.length === 0 ? (
        <div className="text-center py-16 text-brand-plum/40">
          <p className="text-sm">予約データがありません</p>
          <Link href="/reservations/new" className="mt-3 inline-block text-sm text-brand-plum underline">
            予約を登録する
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-brand-plum/60 mb-2 sticky top-16 bg-brand-beige/80 backdrop-blur px-2 py-1 rounded">
                {date}
              </h2>
              <div className="space-y-2">
                {grouped[date].map((r) => (
                  <ReservationCard key={r.id} reservation={r} customerMap={customerMap} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
