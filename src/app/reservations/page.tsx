import { getReservations, getCustomers, getCasts } from '@/lib/kv'
import { isAuthenticated } from '@/lib/auth'
import { CalendarView } from './calendar-view'

export default async function ReservationsPage() {
  const [reservations, customers, casts, loggedIn] = await Promise.all([
    getReservations(), getCustomers(), getCasts(), isAuthenticated(),
  ])
  const customerMap = new Map(customers.map((c) => [c.id, c]))
  const castMap = new Map(casts.map((c) => [c.id, c]))

  return (
    <CalendarView
      reservations={reservations}
      customers={customers}
      customerMap={customerMap}
      casts={casts}
      castMap={castMap}
      loggedIn={loggedIn}
    />
  )
}
