'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLang } from '@/components/layout/Providers'
import { motion, AnimatePresence } from 'framer-motion'
import { Header, Footer } from '@/components/layout'

interface Message {
  id: number
  ticketId: number
  senderId: number | null
  senderType: string
  message: string
  createdAt: string
}

interface Ticket {
  id: number
  userId: number | null
  companyId: number | null
  subject: string
  message: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function SupportChatPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { lang } = useLang()
  const [user, setUser] = useState<any>(null)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('user')
      if (!u) {
        router.push('/login')
        return
      }
      setUser(JSON.parse(u))
    }
  }, [router])

  useEffect(() => {
    if (user && id) {
      loadTicket()
      const interval = setInterval(loadTicket, 5000) // Poll every 5 seconds
      return () => clearInterval(interval)
    }
  }, [user, id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadTicket = async () => {
    try {
      const response = await fetch(`/api/support/${id}`)
      const data = await response.json()
      
      if (response.ok) {
        setTicket(data.ticket)
        setMessages(data.messages || [])
        
        // Mark as read when user opens the chat
        if (!loading) {
          await fetch(`/api/support/${id}/mark-read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id })
          })
        }
      } else {
        console.error('Failed to load ticket')
      }
    } catch (error) {
      console.error('Error loading ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user) return

    setSending(true)

    try {
      const response = await fetch(`/api/support/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          senderId: user.id,
          senderType: user.accountType === 'company' ? 'company' : 'user',
        }),
      })

      if (response.ok) {
        setNewMessage('')
        loadTicket()
      } else {
        alert(lang === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert(lang === 'ar' ? 'حدث خطأ' : 'An error occurred')
    } finally {
      setSending(false)
    }
  }

  const isMyMessage = (message: Message) => {
    if (!user) return false
    if (message.senderType === 'admin') return false
    return message.senderId === user.id
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header navOnlyHome />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">
              {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header navOnlyHome />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {lang === 'ar' ? 'التذكرة غير موجودة' : 'Ticket Not Found'}
            </h2>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors"
            >
              {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header navOnlyHome />
      
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Ticket Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                  <p className="text-sm text-gray-500">
                    {lang === 'ar' ? 'تذكرة رقم' : 'Ticket'} #{ticket.id}
                  </p>
                </div>
              </div>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                ticket.status === 'open' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : ticket.status === 'closed'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {ticket.status === 'open' && (lang === 'ar' ? '🟡 مفتوحة' : '🟡 Open')}
                {ticket.status === 'closed' && (lang === 'ar' ? '⚫ مغلقة' : '⚫ Closed')}
                {ticket.status === 'answered' && (lang === 'ar' ? '🟢 تم الرد' : '🟢 Answered')}
              </span>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
            >
              {lang === 'ar' ? '← العودة' : 'Back →'}
            </button>
          </div>
        </motion.div>

        {/* Messages Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {lang === 'ar' ? 'المحادثة' : 'Conversation'}
            </h2>
          </div>

          {/* Messages List */}
          <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isMyMessage(msg) ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${isMyMessage(msg) ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-2xl px-5 py-3 shadow-md ${
                      isMyMessage(msg)
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : msg.senderType === 'admin'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <div className={`flex items-center gap-2 mt-1 px-2 ${isMyMessage(msg) ? 'justify-end' : 'justify-start'}`}>
                      {msg.senderType === 'admin' && (
                        <span className="text-xs font-bold text-purple-600">
                          {lang === 'ar' ? '🛠️ الدعم الفني' : '🛠️ Tech Support'}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
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

          {/* Send Message Form */}
          {ticket.status !== 'closed' && (
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                className="flex-1 px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all text-gray-800 placeholder-gray-400"
                disabled={sending}
              />
              <motion.button
                type="submit"
                disabled={sending || !newMessage.trim()}
                whileHover={{ scale: sending ? 1 : 1.05 }}
                whileTap={{ scale: sending ? 1 : 0.95 }}
                className={`px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg transition-all ${
                  sending || !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
                }`}
              >
                {sending ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className={`w-6 h-6 ${lang === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </motion.button>
            </form>
          )}

          {ticket.status === 'closed' && (
            <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-4 text-center">
              <p className="text-gray-600 font-semibold">
                {lang === 'ar' ? '🔒 هذه التذكرة مغلقة' : '🔒 This ticket is closed'}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
