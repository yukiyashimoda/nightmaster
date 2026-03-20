import { getCustomers, getCasts } from '@/lib/kv'
import { ReservationForm } from './reservation-form'

export default async function NewReservationPage() {
  const [customers, casts] = await Promise.all([getCustomers(), getCasts()])
  const sortedCustomers = [...customers].sort((a, b) => a.ruby.localeCompare(b.ruby, 'ja'))
  const sortedCasts = [...casts].sort((a, b) => a.ruby.localeCompare(b.ruby, 'ja'))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-brand-plum mb-5">予約登録</h1>
      <ReservationForm customers={sortedCustomers} casts={sortedCasts} />
    </div>
  )
}
