'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface Ticket {
  id: number
  userId: number | null
  companyId: number | null
  subject: string
  message: string
  status: string
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessageAt: string | null
}

interface Message {
  id: number
  ticketId: number
  senderId: number | null
  senderType: string
  message: string
  createdAt: string
}

export default function AdminSupport() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const admin = localStorage.getItem('admin')
      if (!admin) {
        router.push('/admin-panel/login')
        return
      }
    }
    loadTickets()
  }, [router, filter])

  useEffect(() => {
    if (selectedTicket) {
      loadTicketMessages(selectedTicket.id)
      const interval = setInterval(() => loadTicketMessages(selectedTicket.id), 5000)
      return () => clearInterval(interval)
    }
  }, [selectedTicket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadTickets = async () => {
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : ''
      const response = await fetch(`/api/support?admin=true${statusParam}`)
      const data = await response.json()
      
      if (response.ok) {
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTicketMessages = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/support/${ticketId}`)
      const data = await response.json()
      
      if (response.ok) {
        setMessages(data.messages || [])
        setSelectedTicket(data.ticket)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedTicket) return

    setSending(true)

    try {
      console.log('Sending reply to ticket:', selectedTicket.id);
      
      const response = await fetch(`/api/support/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          senderId: null,
          senderType: 'admin',
          status: 'answered',
        }),
      })

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        setNewMessage('')
        loadTicketMessages(selectedTicket.id)
        loadTickets()
      } else {
        console.error('Failed to send reply:', data);
        alert(`فشل في إرسال الرد: ${data.error || 'خطأ غير معروف'}`)
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      alert(`حدث خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
    } finally {
      setSending(false)
    }
  }

  const handleChangeStatus = async (ticketId: number, status: string) => {
    try {
      const response = await fetch(`/api/support/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        loadTickets()
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status })
        }
      }
    } catch (error) {
      console.error('Error changing status:', error)
    }
  }

  const handleDeleteTicket = async (ticketId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه التذكرة؟')) return

    try {
      const response = await fetch(`/api/support/${ticketId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadTickets()
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">جاري تحميل التذاكر...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">الدعم الفني</h1>
                <p className="text-gray-600">إدارة تذاكر الدعم والرد على الاستفسارات</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin-panel/dashboard')}
              className="px-6 py-3 bg-white hover:bg-gray-50 rounded-xl font-bold text-gray-700 shadow-md transition-colors"
            >
              ← لوحة التحكم
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-4 mb-6"
        >
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'الكل', color: 'gray' },
              { value: 'open', label: 'مفتوحة', color: 'yellow' },
              { value: 'answered', label: 'تم الرد', color: 'green' },
              { value: 'closed', label: 'مغلقة', color: 'gray' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-5 py-2.5 rounded-lg font-bold transition-all ${
                  filter === f.value
                    ? `bg-${f.color}-600 text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
                <span className="mr-2 text-sm">
                  ({tickets.filter(t => f.value === 'all' || t.status === f.value).length})
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto"
          >
            {tickets.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-md">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600 font-semibold">لا توجد تذاكر</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`bg-white rounded-xl p-4 shadow-md cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'ring-4 ring-purple-500 bg-purple-50'
                      : 'hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{ticket.subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      ticket.status === 'open'
                        ? 'bg-yellow-100 text-yellow-800'
                        : ticket.status === 'closed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status === 'open' && '🟡 مفتوحة'}
                      {ticket.status === 'closed' && '⚫ مغلقة'}
                      {ticket.status === 'answered' && '🟢 تم الرد'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ticket.message}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {ticket.userId ? `👤 مستخدم #${ticket.userId}` : `🏢 شركة #${ticket.companyId}`}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {ticket.messageCount}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(ticket.createdAt).toLocaleString('ar-EG', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Ticket Details & Chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {selectedTicket ? (
              <div className="flex flex-col h-[calc(100vh-300px)]">
                {/* Ticket Header */}
                <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{selectedTicket.subject}</h2>
                      <p className="text-purple-100 text-sm">تذكرة رقم #{selectedTicket.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleChangeStatus(selectedTicket.id, e.target.value)}
                        className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white font-bold border-2 border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                      >
                        <option value="open">مفتوحة</option>
                        <option value="answered">تم الرد</option>
                        <option value="closed">مغلقة</option>
                      </select>
                      <button
                        onClick={() => handleDeleteTicket(selectedTicket.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-bold transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((msg, index) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] ${msg.senderType === 'admin' ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-2xl px-5 py-3 shadow-md ${
                              msg.senderType === 'admin'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                : 'bg-white text-gray-900'
                            }`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            </div>
                            <div className={`flex items-center gap-2 mt-1 px-2 ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                              {msg.senderType === 'admin' && (
                                <span className="text-xs font-bold text-purple-600">🛠️ أنت</span>
                              )}
                              {msg.senderType !== 'admin' && (
                                <span className="text-xs font-bold text-cyan-600">
                                  {msg.senderType === 'user' ? '👤 مستخدم' : '🏢 شركة'}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {new Date(msg.createdAt).toLocaleString('ar-EG', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Reply Form */}
                {selectedTicket.status !== 'closed' && (
                  <form onSubmit={handleSendReply} className="p-6 bg-white border-t-2 border-gray-100">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب ردك..."
                        className="flex-1 px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-800"
                        disabled={sending}
                      />
                      <motion.button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        whileHover={{ scale: sending ? 1 : 1.05 }}
                        whileTap={{ scale: sending ? 1 : 0.95 }}
                        className={`px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-lg transition-all ${
                          sending || !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
                        }`}
                      >
                        {sending ? '...' : 'إرسال'}
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-12 text-center">
                <div>
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">اختر تذكرة</h3>
                  <p className="text-gray-600">اختر تذكرة من القائمة لعرض التفاصيل والرد</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
