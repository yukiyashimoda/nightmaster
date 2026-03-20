'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, X } from 'lucide-react'
import { createReservationAction } from './actions'
import type { Customer } from '@/types'

interface ReservationFormProps {
  customers: Customer[]
}

export function ReservationForm({ customers }: ReservationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [time, setTime] = useState('20:00')
  const [partySize, setPartySize] = useState(2)
  const [hasDesignation, setHasDesignation] = useState(false)
  const [isAccompanied, setIsAccompanied] = useState(false)
  const [customerType, setCustomerType] = useState<'existing' | 'new'>('new')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [customerQuery, setCustomerQuery] = useState('')
  const [priceType, setPriceType] = useState<'normal' | 'party'>('normal')
  const [partyPlanPrice, setPartyPlanPrice] = useState<string>('')
  const [partyPlanMinutes, setPartyPlanMinutes] = useState<string>('90')
  const [memo, setMemo] = useState('')

  const filteredCustomers = customerQuery.trim()
    ? customers.filter(
        (c) =>
          c.name.includes(customerQuery) ||
          c.ruby.includes(customerQuery) ||
          c.nickname.includes(customerQuery)
      )
    : customers

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  const Toggle = ({
    value, onChange, label, activeLabel, activeColor = 'bg-brand-plum',
  }: {
    value: boolean; onChange: (v: boolean) => void; label: string; activeLabel?: string; activeColor?: string
  }) => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${value ? activeColor : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      <span className="text-sm text-brand-plum">
        {value && activeLabel ? activeLabel : label}
      </span>
    </div>
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await createReservationAction({
      date,
      time,
      partySize,
      hasDesignation,
      isAccompanied,
      customerType,
      customerId: customerType === 'existing' ? selectedCustomerId : null,
      priceType,
      partyPlanPrice: priceType === 'party' && partyPlanPrice ? Number(partyPlanPrice) : null,
      partyPlanMinutes: priceType === 'party' && partyPlanMinutes ? Number(partyPlanMinutes) : null,
      memo,
    })
    setLoading(false)
    if (result.success) {
      router.push('/reservations')
    } else {
      setError(result.error ?? '登録に失敗しました')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-24">
      {error && (
        <div className="p-3 rounded-lg bg-brand-coral/10 border border-brand-coral/40 text-brand-coral text-sm">
          {error}
        </div>
      )}

      {/* 日付 */}
      <div className="space-y-1.5">
        <Label className="text-brand-plum">日付<span className="text-brand-coral ml-0.5">*</span></Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      {/* 時間 */}
      <div className="space-y-1.5">
        <Label className="text-brand-plum">時間<span className="text-brand-coral ml-0.5">*</span></Label>
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
      </div>

      {/* 人数 */}
      <div className="space-y-1.5">
        <Label className="text-brand-plum">人数<span className="text-brand-coral ml-0.5">*</span></Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPartySize((n) => Math.max(1, n - 1))}
            className="w-9 h-9 rounded-lg border border-brand-beige bg-white text-brand-plum text-lg font-bold hover:bg-brand-beige/50 transition-colors"
          >−</button>
          <span className="text-xl font-bold text-brand-plum w-12 text-center tabular-nums">{partySize}</span>
          <button
            type="button"
            onClick={() => setPartySize((n) => n + 1)}
            className="w-9 h-9 rounded-lg border border-brand-beige bg-white text-brand-plum text-lg font-bold hover:bg-brand-beige/50 transition-colors"
          >＋</button>
          <span className="text-sm text-brand-plum/60">名</span>
        </div>
      </div>

      {/* 指名の有無 */}
      <div className="rounded-lg border border-brand-beige bg-white p-3">
        <Toggle value={hasDesignation} onChange={setHasDesignation} label="指名なし" activeLabel="指名あり" />
      </div>

      {/* 同伴出勤 */}
      <div className="rounded-lg border border-brand-beige bg-white p-3">
        <Toggle value={isAccompanied} onChange={setIsAccompanied} label="通常来店" activeLabel="同伴出勤" activeColor="bg-brand-gold" />
      </div>

      {/* 顧客か初来店か */}
      <div className="space-y-1.5">
        <Label className="text-brand-plum">来店区分</Label>
        <div className="flex rounded-lg border border-brand-beige overflow-hidden text-sm font-medium">
          <button
            type="button"
            onClick={() => setCustomerType('new')}
            className={`flex-1 py-2.5 transition-colors ${customerType === 'new' ? 'bg-brand-plum text-white' : 'text-brand-plum/60 hover:bg-brand-beige/50'}`}
          >
            初来店
          </button>
          <button
            type="button"
            onClick={() => setCustomerType('existing')}
            className={`flex-1 py-2.5 transition-colors ${customerType === 'existing' ? 'bg-brand-plum text-white' : 'text-brand-plum/60 hover:bg-brand-beige/50'}`}
          >
            既存顧客
          </button>
        </div>

        {/* 既存顧客選択 */}
        {customerType === 'existing' && (
          <div className="rounded-lg border border-brand-beige bg-white overflow-hidden mt-2">
            {selectedCustomer ? (
              <div className="flex items-center justify-between px-3 py-2 border-b border-brand-beige">
                <span className="text-sm text-brand-plum font-medium">{selectedCustomer.name}</span>
                <button type="button" onClick={() => setSelectedCustomerId(null)} className="text-brand-plum/50 hover:text-brand-coral">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-plum/50" />
              <input
                type="text"
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
                placeholder="名前・ふりがな・ニックネームで検索"
                className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border-0 outline-none text-brand-plum placeholder:text-brand-plum/50"
              />
            </div>
            <div className="max-h-40 overflow-y-auto border-t border-brand-beige">
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setSelectedCustomerId(c.id); setCustomerQuery('') }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-brand-beige/50 transition-colors ${selectedCustomerId === c.id ? 'bg-brand-beige/50' : ''}`}
                >
                  <span className="text-sm text-brand-plum">{c.name}</span>
                  <span className="text-xs text-brand-plum/50">({c.ruby})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 料金プラン */}
      <div className="space-y-1.5">
        <Label className="text-brand-plum">料金プラン</Label>
        <div className="flex rounded-lg border border-brand-beige overflow-hidden text-sm font-medium">
          <button
            type="button"
            onClick={() => setPriceType('normal')}
            className={`flex-1 py-2.5 transition-colors ${priceType === 'normal' ? 'bg-brand-plum text-white' : 'text-brand-plum/60 hover:bg-brand-beige/50'}`}
          >
            通常料金
          </button>
          <button
            type="button"
            onClick={() => setPriceType('party')}
            className={`flex-1 py-2.5 transition-colors ${priceType === 'party' ? 'bg-brand-plum text-white' : 'text-brand-plum/60 hover:bg-brand-beige/50'}`}
          >
            パーティープラン
          </button>
        </div>

        {/* パーティープラン詳細 */}
        {priceType === 'party' && (
          <div className="rounded-lg border border-brand-beige bg-white p-3 space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-brand-plum text-sm">金額（円）</Label>
              <Input
                type="number"
                value={partyPlanPrice}
                onChange={(e) => setPartyPlanPrice(e.target.value)}
                placeholder="例：30000"
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-brand-plum text-sm">セット時間（分）</Label>
              <Input
                type="number"
                value={partyPlanMinutes}
                onChange={(e) => setPartyPlanMinutes(e.target.value)}
                placeholder="例：90"
                min={0}
              />
            </div>
          </div>
        )}
      </div>

      {/* 特記事項・メモ */}
      <div className="space-y-1.5">
        <Label className="text-brand-plum">特記事項・メモ</Label>
        <Textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="アレルギー、リクエスト、注意事項など"
          rows={3}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-brand-beige px-4 py-3 sm:left-60">
        <Button
          type="submit"
          disabled={loading}
          className="w-full max-w-2xl mx-auto block bg-brand-plum hover:bg-brand-plum/90 text-white font-bold h-11"
        >
          {loading ? '登録中...' : '予約を登録する'}
        </Button>
      </div>
    </form>
  )
}
