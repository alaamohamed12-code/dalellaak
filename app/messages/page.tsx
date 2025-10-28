"use client";
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import { useLang } from '../../components/layout/Providers';
import { getProfileImageUrl } from '../../lib/image-utils';

type Conversation = { 
  id: number | string; 
  userId: number; 
  companyId: number; 
  lastBody?: string; 
  lastAt?: string; 
  unreadCount?: number;
  type?: 'conversation' | 'support';
  supportTicketId?: number;
  subject?: string;
  status?: string;
};
type Message = { id: number; conversationId: number; senderType: 'user'|'company'; senderId: number; body: string; createdAt: string };
type ConversationWithDetails = Conversation & { 
  otherParty?: { 
    id: number; 
    firstName: string; 
    lastName: string; 
    username: string; 
    image?: string; 
    type: 'user' | 'company' | 'support'
  } 
};

export default function MessagesPage() {
  const { lang } = useLang();
  const searchParams = useSearchParams();
  const filterType = searchParams?.get('filter'); // 'support' or null
  const targetConvId = searchParams?.get('conv'); // conversation ID from URL
  const refreshParam = searchParams?.get('refresh'); // force refresh param
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [active, setActive] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [showSidebar, setShowSidebar] = useState(true); // For mobile toggle
  const [showBanner, setShowBanner] = useState(true); // Cashback banner visibility
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState<'none'|'complete'|'cancel'>('none');

  // Filter conversations based on URL parameter
  const filteredConversations = useMemo(() => {
    if (filterType === 'support') {
      return conversations.filter(c => c.type === 'support');
    }
    return conversations;
  }, [conversations, filterType]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const u = localStorage.getItem('user');
    if (!u) return;
    const parsed = JSON.parse(u);
    setUser(parsed);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    console.log('🔄 Loading conversations for user:', user.id, 'accountType:', user.accountType);
    console.log('📍 URL params - targetConvId:', targetConvId, 'refreshParam:', refreshParam);
    
    const qp = user.accountType === 'company' ? `companyId=${user.id}` : `userId=${user.id}`;
    fetch(`/api/conversations?${qp}`).then(r => r.json()).then(async data => {
      console.log('📥 Received conversations from API:', data.conversations?.length || 0);
      
      if (Array.isArray(data.conversations)) {
        console.log('📋 Raw conversations:', data.conversations);
        
        // Fetch details for regular conversations only
        const conversationsWithDetails = await Promise.all(
          data.conversations.map(async (conv: any) => {
            // Handle support tickets - they already have complete info
            if (conv.type === 'support') {
              return {
                ...conv,
                otherParty: {
                  id: 0,
                  firstName: lang === 'ar' ? 'دعم فني' : 'Tech Support',
                  lastName: `#${conv.supportTicketId}`,
                  username: 'support',
                  image: null,
                  type: 'support'
                }
              };
            }
            
            // Handle regular conversations - fetch user/company details
            try {
              const otherId = user.accountType === 'company' ? conv.userId : conv.companyId;
              const otherType = user.accountType === 'company' ? 'userId' : 'companyId';
              console.log(`  🔍 Fetching details for conversation #${conv.id} - ${otherType}=${otherId}`);
              const detailsRes = await fetch(`/api/user-details?${otherType}=${otherId}`);
              const detailsData = await detailsRes.json();
              
              if (detailsData.user || detailsData.company) {
                const otherParty = detailsData.user || detailsData.company;
                console.log(`    ✅ Got details for conversation #${conv.id}:`, otherParty.username);
                return {
                  ...conv,
                  otherParty: {
                    ...otherParty,
                    type: detailsData.user ? 'user' : 'company'
                  }
                };
              }
            } catch (e) {
              console.log('❌ Failed to fetch details for conversation', conv.id, e);
            }
            return conv;
          })
        );
        
        console.log('✅ Processed conversations with details:', conversationsWithDetails.length);
        setConversations(conversationsWithDetails);
        
        // If there's a target conversation ID from URL, select it
        if (targetConvId) {
          console.log('🎯 Looking for target conversation:', targetConvId);
          const targetConv = conversationsWithDetails.find(c => String(c.id) === String(targetConvId));
          if (targetConv) {
            setActive(targetConv);
            console.log('✅ Selected conversation from URL:', targetConvId, targetConv);
          } else {
            console.log('⚠️  Target conversation not found! Available IDs:', conversationsWithDetails.map(c => c.id));
            if (conversationsWithDetails.length > 0) {
              setActive(conversationsWithDetails[0]);
              console.log('📌 Selected first conversation as fallback');
            }
          }
        } else if (conversationsWithDetails.length > 0) {
          setActive(conversationsWithDetails[0]);
          console.log('📌 No target specified, selected first conversation');
        } else {
          console.log('⚠️  No conversations available');
        }
      }
    }).catch(error => {
      console.error('❌ Error loading conversations:', error);
    });
  }, [user, lang, targetConvId, refreshParam]); // Added refreshParam to force reload

  useEffect(() => {
    if (!active || !user) return;
    
    // Determine if this is a support conversation or regular conversation
    const isSupportConv = active.type === 'support';
    const queryParam = isSupportConv 
      ? `supportTicketId=${(active as any).supportTicketId}` 
      : `conversationId=${active.id}`;
    
    fetch(`/api/messages?${queryParam}`).then(r => r.json()).then(data => {
      if (isSupportConv) {
        // Transform support messages to match regular message format
        const transformedMessages = (data.messages || []).map((msg: any) => ({
          id: msg.id,
          conversationId: active.id,
          senderType: msg.senderType === 'admin' ? 'company' : msg.senderType,
          senderId: msg.senderId,
          body: msg.message,
          createdAt: msg.createdAt
        }));
        setMessages(transformedMessages);
      } else {
        setMessages(data.messages || []);
      }
    });
    
    // Mark messages as read when opening a conversation
    const userType = user.accountType === 'company' ? 'company' : 'user';
    const readPayload = isSupportConv
      ? { supportTicketId: (active as any).supportTicketId, userId: user.id }
      : { conversationId: active.id, userType };
      
    fetch('/api/messages/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(readPayload)
    }).then(() => {
      // Refresh conversations list to update unread counts
      const qp = user.accountType === 'company' ? `companyId=${user.id}` : `userId=${user.id}`;
      fetch(`/api/conversations?${qp}`).then(r => r.json()).then(async data => {
        if (Array.isArray(data.conversations)) {
          // Re-fetch details for updated conversations
          const conversationsWithDetails = await Promise.all(
            data.conversations.map(async (conv: any) => {
              if (conv.type === 'support') {
                return {
                  ...conv,
                  otherParty: {
                    id: 0,
                    firstName: lang === 'ar' ? 'دعم فني' : 'Tech Support',
                    lastName: `#${conv.supportTicketId}`,
                    username: 'support',
                    image: null,
                    type: 'support'
                  }
                };
              }
              
              try {
                const otherId = user.accountType === 'company' ? conv.userId : conv.companyId;
                const otherType = user.accountType === 'company' ? 'userId' : 'companyId';
                const detailsRes = await fetch(`/api/user-details?${otherType}=${otherId}`);
                const detailsData = await detailsRes.json();
                
                if (detailsData.user || detailsData.company) {
                  const otherParty = detailsData.user || detailsData.company;
                  return {
                    ...conv,
                    otherParty: {
                      ...otherParty,
                      type: detailsData.user ? 'user' : 'company'
                    }
                  };
                }
              } catch (e) {
                console.log('Failed to fetch details for conversation', conv.id);
              }
              return conv;
            })
          );
          setConversations(conversationsWithDetails);
        }
      });
    });
  }, [active, user, lang]);

  async function send() {
    if (!user || !active || text.trim().length === 0) return;
    const senderType = user.accountType === 'company' ? 'company' : 'user';
    
    // Check if this is a support conversation
    const isSupportConv = active.type === 'support';
    
    const payload = isSupportConv
      ? {
          supportTicketId: (active as any).supportTicketId,
          senderType: user.accountType === 'company' ? 'company' : 'user',
          senderId: Number(user.id),
          text: text.trim(),
        }
      : {
          userId: Number(active.userId),
          companyId: Number(active.companyId),
          senderType,
          senderId: Number(user.id),
          text: text.trim(),
        };
    
    const res = await fetch('/api/messages', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
    
    const data = await res.json();
    if (res.ok) {
      setText('');
      // reload messages
      const queryParam = isSupportConv 
        ? `supportTicketId=${(active as any).supportTicketId}` 
        : `conversationId=${active.id}`;
      const r = await fetch(`/api/messages?${queryParam}`);
      const d = await r.json();
      
      if (isSupportConv) {
        const transformedMessages = (d.messages || []).map((msg: any) => ({
          id: msg.id,
          conversationId: active.id,
          senderType: msg.senderType === 'admin' ? 'company' : msg.senderType,
          senderId: msg.senderId,
          body: msg.message,
          createdAt: msg.createdAt
        }));
        setMessages(transformedMessages);
      } else {
        setMessages(d.messages || []);
      }
    }
  }

  async function reportContract(action: 'completed'|'cancelled') {
    if (!user || !active) return;
    if (action === 'cancelled' && !cancelReason.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال سبب الإلغاء' : 'Please provide a cancellation reason');
      return;
    }
    setSubmittingAction(action === 'completed' ? 'complete' : 'cancel');
    try {
      const payload = {
        conversationId: Number(active.id),
        userId: Number(active.userId),
        companyId: Number(active.companyId),
        action,
        reason: action === 'cancelled' ? cancelReason.trim() : undefined,
        createdByType: user.accountType === 'company' ? 'company' : 'user',
        createdById: Number(user.id)
      }
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        if (action === 'cancelled') {
          setShowCancelModal(false);
          setCancelReason('');
        }
        alert(lang === 'ar' 
          ? (action === 'completed' ? 'تم إرسال طلب إتمام التعاقد للمراجعة.' : 'تم إرسال طلب إلغاء التعاقد للمراجعة.')
          : (action === 'completed' ? 'Completion request sent for review.' : 'Cancellation request sent for review.')
        );
      } else {
        const data = await res.json().catch(() => ({}));
        alert((lang === 'ar' ? 'فشل الإرسال: ' : 'Failed to send: ') + (data?.error || res.status));
      }
    } catch (e) {
      alert(lang === 'ar' ? 'حدث خطأ غير متوقع' : 'Unexpected error');
    } finally {
      setSubmittingAction('none');
    }
  }

  return (
    <>
      <Header navOnlyHome />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col py-4 sm:py-6 px-2 sm:px-4">
          {/* Page Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4 px-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
                💬
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
                  {lang === 'ar' ? 'الرسائل' : 'Messages'}
                </h1>
                <p className="text-sm text-gray-600">
                  {conversations.length > 0 ? `${conversations.length} ${lang === 'ar' ? 'محادثة' : 'conversations'}` : lang === 'ar' ? 'لا توجد محادثات' : 'No conversations'}
                </p>
              </div>
            </div>
            {active && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden p-2.5 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 transition-all shadow-sm"
                onClick={() => { setShowSidebar(true); setActive(null); }}
                aria-label="Back to conversations"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            )}
          </motion.div>

          {/* Cashback Banner - Modern Design */}
          <AnimatePresence>
            {showBanner && (
              <motion.div
                initial={{ y: -12, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -12, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mb-4 mx-2 sm:mx-0"
              >
                <div className="relative overflow-hidden rounded-2xl border border-cyan-200/50 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-xl">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <div className="relative flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
                    <motion.div 
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-md text-white shadow-lg"
                    >
                      <span className="text-2xl sm:text-3xl">💸</span>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-bold text-white">
                        {lang === 'ar' ? 'لا تنسَ: لديك كاش باك' : "Don't forget: You have"}
                        <span className="mx-2 inline-block px-3 py-1 rounded-full bg-white/30 backdrop-blur-md text-white text-xs sm:text-sm align-middle font-extrabold shadow-lg">2%</span>
                        {lang === 'ar' ? 'على كل عملية مكتملة عبر الموقع.' : 'cashback on every completed transaction!'}
                      </div>
                      <div className="text-xs text-white/90 mt-1">
                        {lang === 'ar' ? 'ينطبق على العمليات المكتملة فقط.' : 'Applies to completed transactions only.'}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={lang === 'ar' ? 'إغلاق التنبيه' : 'Dismiss banner'}
                      className="shrink-0 p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/20 focus:outline-none transition-all"
                      onClick={() => setShowBanner(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!user ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-4xl shadow-lg">
                  🔒
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{lang === 'ar' ? 'يجب تسجيل الدخول' : 'Login Required'}</h2>
                <p className="text-gray-600 mb-6">{lang === 'ar' ? 'يجب تسجيل الدخول لعرض الرسائل.' : 'Please log in to view your messages.'}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/login'}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
              {/* Sidebar - Conversations List */}
              <motion.aside 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${active && !showSidebar ? 'hidden' : 'block'} md:block bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden flex flex-col`}
              >
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-base text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      {filterType === 'support' 
                        ? (lang === 'ar' ? 'التذاكر الفنية' : 'Support Tickets')
                        : (lang === 'ar' ? 'المحادثات' : 'Conversations')
                      }
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full ${
                        filterType === 'support' 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600'
                      } text-white text-xs font-bold shadow`}>
                        {filteredConversations.length}
                      </div>
                      {filterType === 'support' && (
                        <button
                          onClick={() => window.location.href = '/messages'}
                          className="px-2 py-1 rounded-lg bg-white/50 hover:bg-white text-xs font-semibold text-gray-700 transition-colors"
                          title={lang === 'ar' ? 'عرض الكل' : 'Show All'}
                        >
                          {lang === 'ar' ? 'الكل' : 'All'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12 px-4"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl">
                        {filterType === 'support' ? '�️' : '�💬'}
                      </div>
                      <div className="font-semibold text-gray-900 mb-2">
                        {filterType === 'support' 
                          ? (lang === 'ar' ? 'لا توجد تذاكر فنية' : 'No support tickets') 
                          : (lang === 'ar' ? 'لا توجد محادثات بعد' : 'No conversations yet')
                        }
                      </div>
                      <p className="text-sm text-gray-600">
                        {filterType === 'support'
                          ? (lang === 'ar' ? 'لم تقم بفتح أي تذكرة دعم فني بعد' : 'You have not opened any support tickets yet')
                          : (lang === 'ar' ? 'ابدأ محادثة مع شركة من صفحتها' : 'Start a conversation from a company page')
                        }
                      </p>
                    </motion.div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {filteredConversations.map((c, idx) => (
                        <motion.li
                          key={c.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ x: 4 }}
                          className={`p-3 cursor-pointer transition-all ${
                            active?.id === c.id 
                              ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500' 
                              : 'hover:bg-gray-50'
                          } ${c.unreadCount && c.unreadCount > 0 ? 'bg-blue-50/50' : ''} ${
                            c.type === 'support' ? 'border-l-4 border-purple-400' : ''
                          }`}
                          onClick={() => { setActive(c); setShowSidebar(false); }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              {c.otherParty?.image ? (
                                <img 
                                  src={getProfileImageUrl(c.otherParty.image)} 
                                  alt={`${c.otherParty.firstName} ${c.otherParty.lastName}`}
                                  className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/profile-images/default-avatar.svg';
                                  }}
                                />
                              ) : (
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-md ${
                                  c.type === 'support'
                                    ? 'bg-gradient-to-br from-purple-400 to-pink-500'
                                    : 'bg-gradient-to-br from-cyan-400 to-blue-500'
                                }`}>
                                  {c.type === 'support' ? '🛠️' : c.otherParty ? 
                                    (c.otherParty.firstName?.charAt(0) || c.otherParty.username?.charAt(0) || '?').toUpperCase() 
                                    : '?'
                                  }
                                </div>
                              )}
                              {c.otherParty?.type && c.type !== 'support' && (
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg ${
                                  c.otherParty.type === 'company' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-green-400 to-emerald-500'
                                }`}>
                                  {c.otherParty.type === 'company' ? '🏢' : '👤'}
                                </div>
                              )}
                              {c.type === 'support' && (c as any).status && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-lg bg-white">
                                  {(c as any).status === 'open' ? '🟡' : (c as any).status === 'answered' ? '🟢' : '⚫'}
                                </div>
                              )}
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className={`font-semibold text-sm truncate ${
                                  c.unreadCount && c.unreadCount > 0 ? 'text-cyan-900' : 'text-gray-900'
                                }`}>
                                  {c.otherParty ? 
                                    `${c.otherParty.firstName || ''} ${c.otherParty.lastName || ''}`.trim() || c.otherParty.username
                                    : (lang === 'ar' ? 'محادثة' : 'Conversation') + ` #${c.id}`
                                  }
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {c.unreadCount && c.unreadCount > 0 && (
                                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 shadow-md">
                                      {c.unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className={`text-xs truncate ${
                                c.unreadCount && c.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-600'
                              }`}>
                                {c.type === 'support' && (c as any).subject ? (c as any).subject + ': ' : ''}{c.lastBody || (lang === 'ar' ? 'بدون رسائل' : 'No messages')}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                                {c.otherParty && c.type !== 'support' && (
                                  <div className="text-[10px] text-gray-400">
                                    @{c.otherParty.username}
                                  </div>
                                )}
                                {c.type === 'support' && (
                                  <div className="text-[10px] font-bold text-purple-600">
                                    {lang === 'ar' ? 'دعم فني' : 'Tech Support'}
                                  </div>
                                )}
                                {c.lastAt && (
                                  <div className="text-[10px] text-gray-400">
                                    • {new Date(c.lastAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.aside>

              {/* Active Conversation - Chat Window */}
              {active && active.otherParty ? (
                <motion.section 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="md:col-span-2 flex flex-col bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden"
                >
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {active.otherParty.image ? (
                          <img 
                            src={getProfileImageUrl(active.otherParty.image)} 
                            alt={`${active.otherParty.firstName} ${active.otherParty.lastName}`}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/profile-images/default-avatar.svg';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-lg">
                            {(active.otherParty.firstName?.charAt(0) || active.otherParty.username?.charAt(0) || '?').toUpperCase()}
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg ${
                          active.otherParty.type === 'company' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-green-400 to-emerald-500'
                        }`}>
                          {active.otherParty.type === 'company' ? '🏢' : '👤'}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-base text-gray-900 truncate">
                          {`${active.otherParty.firstName || ''} ${active.otherParty.lastName || ''}`.trim() || active.otherParty.username}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          <span>@{active.otherParty.username}</span>
                          <span>•</span>
                          <span>{active.otherParty.type === 'company' ? (lang === 'ar' ? 'شركة' : 'Company') : (lang === 'ar' ? 'فرد' : 'Individual')}</span>
                        </div>
                      </div>
                      {/* Actions: Complete / Cancel - Only for regular conversations */}
                      {active.type !== 'support' && (
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            onClick={() => reportContract('completed')}
                            disabled={submittingAction !== 'none'}
                            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow disabled:opacity-50"
                          >
                            {submittingAction === 'complete' ? (lang === 'ar' ? 'جارٍ الإرسال...' : 'Sending...') : (lang === 'ar' ? 'إتمام التعاقد' : 'Complete')}
                          </button>
                          <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={submittingAction !== 'none'}
                            className="px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-bold shadow disabled:opacity-50"
                          >
                            {lang === 'ar' ? 'إلغاء التعاقد' : 'Cancel'}
                          </button>
                          <Link
                            href="/terms"
                            className="px-3 py-2 rounded-xl border-2 border-gray-200 text-gray-700 hover:border-gray-300 text-xs sm:text-sm font-semibold bg-white"
                          >
                            {lang === 'ar' ? 'الشروط والأحكام' : 'Terms'}
                          </Link>
                        </div>
                      )}
                      {/* Status badge for support conversations */}
                      {active.type === 'support' && (active as any).status && (
                        <div className="ml-auto">
                          <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold ${
                            (active as any).status === 'open' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : (active as any).status === 'closed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {(active as any).status === 'open' && (lang === 'ar' ? '🟡 مفتوحة' : '🟡 Open')}
                            {(active as any).status === 'closed' && (lang === 'ar' ? '⚫ مغلقة' : '⚫ Closed')}
                            {(active as any).status === 'answered' && (lang === 'ar' ? '🟢 تم الرد' : '🟢 Answered')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-gray-50/50 to-blue-50/20">
                    {!active ? (
                      <div className="flex items-center justify-center h-full text-gray-500 text-center">
                        {lang === 'ar' ? 'اختر محادثة' : 'Select a conversation'}
                      </div>
                    ) : messages.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center h-full"
                      >
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-5xl">
                            💭
                          </div>
                          <div className="font-semibold text-gray-900 mb-2">{lang === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}</div>
                          <p className="text-sm text-gray-600">{lang === 'ar' ? 'ابدأ المحادثة بإرسال رسالة' : 'Start the conversation by sending a message'}</p>
                        </div>
                      </motion.div>
                    ) : (
                      messages.map((m, idx) => {
                        const isMe = m.senderType === (user.accountType === 'company' ? 'company' : 'user');
                        const isAdmin = m.senderType === 'company' && active.type === 'support';
                        return (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] sm:max-w-[70%] p-3 sm:p-4 rounded-2xl shadow-md ${
                              isMe 
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' 
                                : isAdmin
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-white text-gray-800 border border-gray-200'
                            }`}>
                              {isAdmin && (
                                <div className="text-[10px] font-bold mb-1 opacity-90">
                                  🛠️ {lang === 'ar' ? 'الدعم الفني' : 'Tech Support'}
                                </div>
                              )}
                              <div className="whitespace-pre-wrap break-words text-sm sm:text-base">{m.body}</div>
                              <div className={`text-[10px] mt-2 flex items-center gap-1 ${isMe || isAdmin ? 'text-white/80' : 'text-gray-400'}`}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(m.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
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
                  <div className="p-4 border-t border-gray-200 bg-white">
                    {active.type === 'support' && (active as any).status === 'closed' ? (
                      <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-4 text-center">
                        <p className="text-gray-600 font-semibold">
                          {lang === 'ar' ? '🔒 هذه التذكرة مغلقة' : '🔒 This ticket is closed'}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input 
                          type="text" 
                          className="flex-1 border-2 border-gray-300 focus:border-cyan-500 rounded-2xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-200 transition-all shadow-sm" 
                          placeholder={lang === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                          value={text}
                          onChange={e => setText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                        />
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white p-3 sm:px-6 sm:py-3 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2" 
                          onClick={send}
                        >
                          <span className="hidden sm:inline">{lang === 'ar' ? 'إرسال' : 'Send'}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.section>
              ) : !showSidebar ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="md:col-span-2 flex items-center justify-center bg-white/50 backdrop-blur-xl rounded-2xl border-2 border-dashed border-gray-300"
                >
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl">
                      💬
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{lang === 'ar' ? 'اختر محادثة' : 'Select a Conversation'}</h3>
                    <p className="text-gray-600">{lang === 'ar' ? 'اختر محادثة من القائمة لبدء المراسلة' : 'Choose a conversation from the list to start messaging'}</p>
                  </div>
                </motion.div>
              ) : null}
            </div>
          )}
        </div>
      </main>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => submittingAction==='none' && setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xl">✖</div>
                <div className="font-bold text-lg text-gray-900">{lang === 'ar' ? 'إلغاء التعاقد' : 'Cancel Contract'}</div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{lang === 'ar' ? 'يرجى توضيح سبب الإلغاء. سيتم إرسال هذا السبب للمراجعة في لوحة التحكم.' : 'Please provide a reason for cancellation. This will be sent for admin review.'}</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="w-full border-2 border-gray-200 focus:border-red-400 rounded-xl p-3 outline-none"
                placeholder={lang === 'ar' ? 'اكتب السبب هنا...' : 'Type your reason...'}
              />
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={submittingAction !== 'none'}
                  className="px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 hover:border-gray-300"
                >
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
                <button
                  onClick={() => reportContract('cancelled')}
                  disabled={submittingAction !== 'none'}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold disabled:opacity-50"
                >
                  {submittingAction === 'cancel' ? (lang === 'ar' ? 'جارٍ الإرسال...' : 'Sending...') : (lang === 'ar' ? 'إرسال السبب' : 'Send Reason')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
