import { getCustomers } from '@/lib/kv'
import { ReservationForm } from './reservation-form'

export default async function NewReservationPage() {
  const customers = await getCustomers()
  const sorted = [...customers].sort((a, b) => a.ruby.localeCompare(b.ruby, 'ja'))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-brand-plum mb-5">予約登録</h1>
      <ReservationForm customers={sorted} />
    </div>
  )
}
