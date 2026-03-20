import { getReservations, getCustomers, getCasts } from '@/lib/kv'
import { CalendarView } from './calendar-view'

export default async function ReservationsPage() {
  const [reservations, customers, casts] = await Promise.all([getReservations(), getCustomers(), getCasts()])
  const customerMap = new Map(customers.map((c) => [c.id, c]))
  const castMap = new Map(casts.map((c) => [c.id, c]))

  return <CalendarView reservations={reservations} customerMap={customerMap} castMap={castMap} />
}
