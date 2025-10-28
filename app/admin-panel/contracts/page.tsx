'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

type ContractEvent = {
  id: number
  conversationId: number
  userId: number
  companyId: number
  action: 'completed' | 'cancelled'
  reason?: string | null
  createdByType: 'user' | 'company'
  createdById: number
  createdAt: string
  status: 'pending' | 'reviewed'
  user?: { id: number; username: string; name: string; email?: string }
  company?: { id: number; username: string; name: string; email?: string }
}

export default function AdminContractsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<ContractEvent[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending')
  const [actionFilter, setActionFilter] = useState<'all' | 'completed' | 'cancelled'>('all')
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    const adminStr = localStorage.getItem('admin')
    if (!adminStr) {
      router.push('/admin-panel/login')
      return
    }
    load()
  }, [])

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('status', filter)
    if (actionFilter !== 'all') params.set('action', actionFilter)
    const res = await fetch(`/api/admin/contracts?${params.toString()}`)
    const data = await res.json()
    setEvents(data.events || [])
    setLoading(false)
  }

  async function markReviewed(id: number) {
    setUpdating(id)
    const res = await fetch('/api/admin/contracts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'reviewed' }) })
    if (res.ok) await load()
    setUpdating(null)
  }

  const filtered = events

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl shadow-lg">📄</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">حالات التعاقد</h1>
              <p className="text-gray-600 text-sm">مراجعة طلبات إتمام/إلغاء التعاقد المرسلة من المحادثات</p>
            </div>
          </div>
          <button onClick={() => router.push('/admin-panel/dashboard')} className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-gray-300">← العودة</button>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow p-4 border border-gray-100 mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">الحالة:</span>
            {(['all','pending','reviewed'] as const).map(s => (
              <button key={s} onClick={() => { setFilter(s); setTimeout(load, 0) }} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${filter===s? 'bg-emerald-500 text-white':'bg-gray-100 text-gray-700'}`}>{s==='all'?'الكل':s==='pending'?'قيد المراجعة':'تمت المراجعة'}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">الإجراء:</span>
            {(['all','completed','cancelled'] as const).map(a => (
              <button key={a} onClick={() => { setActionFilter(a); setTimeout(load, 0) }} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${actionFilter===a? 'bg-blue-500 text-white':'bg-gray-100 text-gray-700'}`}>{a==='all'?'الكل':a==='completed'?'إتمام':'إلغاء'}</button>
            ))}
          </div>
          <button onClick={load} className="ml-auto px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300">تحديث</button>
        </div>

        {/* List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600">جاري التحميل...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-600">لا توجد سجلات</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ev) => (
              <div key={ev.id} className={`bg-white rounded-2xl shadow p-5 border ${ev.status==='pending'?'border-emerald-200':'border-gray-100'}`}>
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${ev.action==='completed'?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>{ev.action==='completed'?'إتمام':'إلغاء'}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${ev.status==='pending'?'bg-emerald-100 text-emerald-700':'bg-gray-100 text-gray-700'}`}>{ev.status==='pending'?'قيد المراجعة':'تمت المراجعة'}</span>
                    <span className="text-gray-500 text-sm">#{ev.id}</span>
                    <span className="text-gray-400 text-sm">{new Date(ev.createdAt).toLocaleString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => router.push('/admin-panel/messages')} className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-sm hover:border-gray-300">عرض المحادثة</button>
                    {ev.status==='pending' && (
                      <button disabled={updating===ev.id} onClick={() => markReviewed(ev.id)} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm disabled:opacity-50">{updating===ev.id?'...':'تحديد كمراجع'}</button>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-gray-600 mb-1">المستخدم</div>
                    <div className="font-semibold">{ev.user?.name || '-'} <span className="text-gray-500">@{ev.user?.username}</span></div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-gray-600 mb-1">الشركة</div>
                    <div className="font-semibold">{ev.company?.name || '-'} <span className="text-gray-500">@{ev.company?.username}</span></div>
                  </div>
                </div>
                {ev.action==='cancelled' && ev.reason && (
                  <div className="mt-3 bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="text-red-700 font-bold mb-1">سبب الإلغاء</div>
                    <div className="text-red-800 whitespace-pre-wrap text-sm">{ev.reason}</div>
                    <div className="text-xs text-red-600 mt-2">المُرسل: {ev.createdByType === 'company' ? 'شركة' : 'مستخدم'} (ID: {ev.createdById})</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
