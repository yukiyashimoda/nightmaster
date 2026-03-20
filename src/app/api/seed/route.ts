import { neon } from '@neondatabase/serverless'
import { mockCustomers, mockBottles, mockCasts, mockVisitRecords } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.DATABASE_URL) {
    return Response.json({ error: 'No DATABASE_URL' }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Casts
    for (const c of mockCasts) {
      await sql`
        INSERT INTO casts (id, name, ruby, memo, updated_at, updated_by)
        VALUES (${c.id}, ${c.name}, ${c.ruby}, ${c.memo}, ${c.updatedAt}, ${c.updatedBy})
        ON CONFLICT (id) DO NOTHING
      `
    }

    // Customers
    for (const c of mockCustomers) {
      await sql`
        INSERT INTO customers (id, name, ruby, nickname, designated_cast_ids, is_alert, alert_reason, memo, linked_customer_ids, is_favorite, has_glass, glass_memo, receipt_names, phone, email, last_visit_date, updated_at, updated_by)
        VALUES (${c.id}, ${c.name}, ${c.ruby}, ${c.nickname}, ${c.designatedCastIds}, ${c.isAlert}, ${c.alertReason}, ${c.memo}, ${c.linkedCustomerIds}, ${c.isFavorite}, ${c.hasGlass}, ${c.glassMemo}, ${c.receiptNames}, ${c.phone}, ${c.email}, ${c.lastVisitDate}, ${c.updatedAt}, ${c.updatedBy})
        ON CONFLICT (id) DO NOTHING
      `
    }

    // Bottles
    for (const b of mockBottles) {
      await sql`
        INSERT INTO bottles (id, customer_id, name, remaining, opened_date)
        VALUES (${b.id}, ${b.customerId}, ${b.name}, ${b.remaining}, ${b.openedDate})
        ON CONFLICT (id) DO NOTHING
      `
    }

    // Visit records
    for (const v of mockVisitRecords) {
      await sql`
        INSERT INTO visit_records (id, customer_id, visit_date, designated_cast_ids, in_store_cast_ids, bottles_opened, bottles_used, memo, is_alert, alert_reason, bottle_snapshots)
        VALUES (${v.id}, ${v.customerId}, ${v.visitDate}, ${v.designatedCastIds}, ${v.inStoreCastIds}, ${v.bottlesOpened}, ${v.bottlesUsed}, ${v.memo}, ${v.isAlert ?? false}, ${v.alertReason ?? ''}, '[]'::jsonb)
        ON CONFLICT (id) DO NOTHING
      `
    }

    return Response.json({
      success: true,
      inserted: {
        casts: mockCasts.length,
        customers: mockCustomers.length,
        bottles: mockBottles.length,
        visitRecords: mockVisitRecords.length,
      },
    })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
