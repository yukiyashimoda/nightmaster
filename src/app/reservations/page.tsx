import { getReservations, getCustomers } from '@/lib/kv'
import { CalendarView } from './calendar-view'

export default async function ReservationsPage() {
  const [reservations, customers] = await Promise.all([getReservations(), getCustomers()])
  const customerMap = new Map(customers.map((c) => [c.id, c]))

  return <CalendarView reservations={reservations} customerMap={customerMap} />
}
