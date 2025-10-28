"use client";
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import { useLang } from '../../components/layout/Providers';

type Ticket = { 
  id: number; 
  userId: number | null; 
  companyId: number | null; 
  subject: string;
  message: string; 
  status: string;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
};

type Message = { 
  id: number; 
  ticketId: number; 
  senderType: 'user' | 'company' | 'admin'; 
  senderId: number | null; 
  message: string; 
  createdAt: string 
};

export default function SupportPage() {
  const { lang } = useLang();
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const u = localStorage.getItem('user');
    if (!u) return;
    const parsed = JSON.parse(u);
    setUser(parsed);
  }, []);

  // Load tickets
  useEffect(() => {
    if (!user) return;
    const loadTickets = async () => {
      try {
        const qp = user.accountType === 'company' ? `companyId=${user.id}` : `userId=${user.id}`;
        const res = await fetch(`/api/support?${qp}`);
        const data = await res.json();
        
        if (Array.isArray(data.tickets)) {
          setTickets(data.tickets);
          if (data.tickets.length > 0 && !activeTicket) {
            setActiveTicket(data.tickets[0]);
          }
        }
      } catch (error) {
        console.error('Error loading tickets:', error);
      }
    };

    loadTickets();
    const interval = setInterval(loadTickets, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Load messages for active ticket
  useEffect(() => {
    if (!activeTicket || !user) return;
    
    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/support/${activeTicket.id}`);
        const data = await res.json();
        
        if (data.messages) {
          setMessages(data.messages);
        }

        // Mark as read
        await fetch(`/api/support/${activeTicket.id}/mark-read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });

        // Refresh tickets list to update unread counts
        const qp = user.accountType === 'company' ? `companyId=${user.id}` : `userId=${user.id}`;
        const ticketsRes = await fetch(`/api/support?${qp}`);
        const ticketsData = await ticketsRes.json();
        if (Array.isArray(ticketsData.tickets)) {
          setTickets(ticketsData.tickets);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [activeTicket, user]);

  async function send() {
    if (!user || !activeTicket || text.trim().length === 0) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/support/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: activeTicket.id,
          senderId: user.id,
          senderType: user.accountType === 'company' ? 'company' : 'user',
          message: text
        })
      });

      if (res.ok) {
        setText('');
        // Reload messages
        const messagesRes = await fetch(`/api/support/${activeTicket.id}`);
        const messagesData = await messagesRes.json();
        if (messagesData.messages) {
          setMessages(messagesData.messages);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <>
        <Header navOnlyHome />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-200/50 max-w-md"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-200 flex items-center justify-center text-5xl">
              🛠️
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'ar' ? 'يجب تسجيل الدخول' : 'Please Login'}
            </h2>
            <p className="text-gray-600 mb-6">
              {lang === 'ar' ? 'قم بتسجيل الدخول للوصول إلى الدعم الفني' : 'Login to access technical support'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </motion.button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header navOnlyHome />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-20 pb-24 md:pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg">
                🛠️
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {lang === 'ar' ? 'الدعم الفني' : 'Technical Support'}
                </h1>
                <p className="text-sm text-gray-600">
                  {lang === 'ar' ? 'تذاكر الدعم والمساعدة' : 'Support Tickets & Help'}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
            {/* Sidebar - Tickets List */}
            <motion.aside 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${activeTicket && !showSidebar ? 'hidden' : 'block'} md:block bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden flex flex-col`}
            >
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    {lang === 'ar' ? 'تذاكر الدعم' : 'Support Tickets'}
                  </h2>
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow">
                    {tickets.length}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {tickets.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 px-4"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-200 flex items-center justify-center text-4xl">
                      🛠️
                    </div>
                    <div className="font-semibold text-gray-900 mb-2">
                      {lang === 'ar' ? 'لا توجد تذاكر بعد' : 'No tickets yet'}
                    </div>
                    <p className="text-sm text-gray-600">
                      {lang === 'ar' ? 'قم بإنشاء تذكرة جديدة من صفحة الاتصال' : 'Create a new ticket from contact page'}
                    </p>
                  </motion.div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {tickets.map((ticket, idx) => (
                      <motion.li
                        key={ticket.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 4 }}
                        className={`p-3 cursor-pointer transition-all ${
                          activeTicket?.id === ticket.id 
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500' 
                            : 'hover:bg-gray-50'
                        } ${ticket.unreadCount && ticket.unreadCount > 0 ? 'bg-purple-50/50 border-l-4 border-purple-300' : ''}`}
                        onClick={() => { setActiveTicket(ticket); setShowSidebar(false); }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                            🛠️
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="font-semibold text-sm text-purple-900 truncate">
                                {lang === 'ar' ? 'تذكرة' : 'Ticket'} #{ticket.id}
                              </div>
                              <div className="flex items-center gap-1">
                                {ticket.unreadCount && ticket.unreadCount > 0 && (
                                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                    {ticket.unreadCount}
                                  </span>
                                )}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                  ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                                  ticket.status === 'answered' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {ticket.status === 'open' ? '🟡' : ticket.status === 'answered' ? '🟢' : '⚫'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="font-medium text-xs text-gray-800 mb-1 truncate">
                              {ticket.subject}
                            </div>
                            
                            <div className="text-xs text-gray-600 truncate">
                              {ticket.message}
                            </div>
                            
                            <div className="text-[10px] text-gray-400 mt-1">
                              {new Date(ticket.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.aside>

            {/* Chat Area */}
            {activeTicket ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="md:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 flex flex-col overflow-hidden"
              >
                {/* Chat Header */}
                <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-between">
                  <button
                    className="md:hidden mr-3 p-2 rounded-lg hover:bg-white/50 transition-colors"
                    onClick={() => setShowSidebar(true)}
                  >
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl shadow-md">
                      🛠️
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-purple-900 flex items-center gap-2">
                        {lang === 'ar' ? 'تذكرة' : 'Ticket'} #{activeTicket.id}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activeTicket.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                          activeTicket.status === 'answered' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {activeTicket.status === 'open' ? (lang === 'ar' ? 'مفتوح' : 'Open') :
                           activeTicket.status === 'answered' ? (lang === 'ar' ? 'تم الرد' : 'Answered') :
                           (lang === 'ar' ? 'مغلق' : 'Closed')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 truncate">{activeTicket.subject}</div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <div className="text-6xl mb-4">💬</div>
                      <p className="text-sm">{lang === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isUser = msg.senderType === (user.accountType === 'company' ? 'company' : 'user');
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                            isUser 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none' 
                              : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                          }`}>
                            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.message}
                            </div>
                            <div className={`text-[10px] mt-1 ${isUser ? 'text-purple-100' : 'text-gray-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading || !text.trim()}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="md:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 flex items-center justify-center"
              >
                <div className="text-center p-12">
                  <div className="text-6xl mb-4">🛠️</div>
                  <p className="text-gray-500 text-lg">
                    {lang === 'ar' ? 'اختر تذكرة لعرض المحادثة' : 'Select a ticket to view conversation'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
