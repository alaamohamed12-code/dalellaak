"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: number;
  username: string;
  email: string;
  accountType: 'user' | 'company';
  firstName?: string;
  lastName?: string;
  image?: string;
  location?: string;
  sector?: string;
}

export default function AdminNotifications() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if admin is logged in
    const adminStr = localStorage.getItem('admin');
    if (!adminStr) {
      router.push('/admin-panel/login');
      return;
    }
  }, []);

  // Search for users
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/search-users?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (res.ok) {
        setSearchResults(data.results || []);
        if (data.results.length === 0) {
          setError("لم يتم العثور على نتائج");
        }
      } else {
        setError(data.error || "فشل البحث");
      }
    } catch (err) {
      console.error('Search error:', err);
      setError("حدث خطأ أثناء البحث");
    } finally {
      setSearching(false);
    }
  };

  // Search on typing (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (target === "custom" && searchQuery.trim()) {
        handleSearch();
      } else if (!searchQuery.trim()) {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, target]);

  // Select user from search results
  const handleSelectUser = (user: SearchResult) => {
    setSelectedUser(user);
    setSearchQuery(user.email);
    setSearchResults([]);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  async function handleSend() {
    if (!message.trim()) {
      setError("يرجى كتابة رسالة الإشعار");
      return;
    }
    
    if (target === "custom" && !selectedUser) {
      setError("يرجى تحديد مستخدم من نتائج البحث");
      return;
    }

    setSending(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          target,
          targetEmail: target === "custom" && selectedUser ? selectedUser.email : undefined,
          createdBy: "admin"
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMessage("");
        setSearchQuery("");
        setSelectedUser(null);
        setSearchResults([]);
        setTarget("all");
        
        // Show assigned count
        if (data.assignedCount !== undefined) {
          alert(`✓ تم إرسال الإشعار بنجاح لـ ${data.assignedCount} مستلم`);
        }
        
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "فشل إرسال الإشعار");
      }
    } catch (err) {
      console.error('Request error:', err);
      setError("حدث خطأ أثناء إرسال الإشعار");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg">
              📢
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                إرسال إشعار جديد
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                أرسل إشعارات للمستخدمين والشركات
              </p>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-6 p-4 bg-green-100 border-2 border-green-500 text-green-800 rounded-2xl flex items-center gap-3 shadow-lg"
            >
              <span className="text-2xl">✓</span>
              <span className="font-bold">تم إرسال الإشعار بنجاح!</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-800 rounded-2xl flex items-center gap-3 shadow-lg"
            >
              <span className="text-2xl">✗</span>
              <span className="font-bold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Panel - Message Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>✍️</span>
              <span>محتوى الإشعار</span>
            </h2>

            {/* Message textarea */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نص الرسالة
              </label>
              <textarea
                className="w-full border-2 border-gray-200 focus:border-cyan-500 rounded-xl p-4 transition-all outline-none resize-none"
                rows={5}
                placeholder="اكتب نص الإشعار هنا... 📝"
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-2">
                عدد الأحرف: {message.length}
              </div>
            </div>

            {/* Target selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                الجهة المستهدفة
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'all', label: '🌍 الجميع', desc: 'أفراد وشركات' },
                  { value: 'users', label: '👤 الأفراد', desc: 'المستخدمين فقط' },
                  { value: 'companies', label: '🏢 الشركات', desc: 'الشركات فقط' },
                  { value: 'custom', label: '🎯 حساب محدد', desc: 'بحث بالاسم' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTarget(option.value);
                      if (option.value !== 'custom') {
                        setSelectedUser(null);
                        setSearchQuery("");
                        setSearchResults([]);
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-right ${
                      target === option.value
                        ? 'border-cyan-500 bg-cyan-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-sm">{option.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Send button */}
            <button
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              onClick={handleSend}
              disabled={!message.trim() || (target === "custom" && !selectedUser) || sending}
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جارٍ الإرسال...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>إرسال الإشعار</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Right Panel - User Search (only for custom target) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🔍</span>
              <span>البحث عن مستخدم</span>
            </h2>

            {target === "custom" ? (
              <>
                {/* Search input */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full border-2 border-gray-200 focus:border-cyan-500 rounded-xl p-4 pr-12 transition-all outline-none"
                      placeholder="ابحث بالبريد الإلكتروني أو اسم المستخدم..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      {searching ? (
                        <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-gray-400">🔍</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    اكتب البريد الإلكتروني أو اسم المستخدم للبحث
                  </p>
                </div>

                {/* Selected user */}
                {selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-green-800">✓ تم التحديد</span>
                      <button
                        onClick={handleClearSelection}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
                      >
                        ✕ إلغاء
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedUser.image ? (
                        <img
                          src={selectedUser.image}
                          alt={selectedUser.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                          {selectedUser.username[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {selectedUser.username}
                          {selectedUser.accountType === 'company' && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                              🏢 شركة
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 truncate">{selectedUser.email}</div>
                        {selectedUser.firstName && (
                          <div className="text-xs text-gray-500">
                            {selectedUser.firstName} {selectedUser.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Search results */}
                <AnimatePresence>
                  {searchResults.length > 0 && !selectedUser && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="max-h-96 overflow-y-auto space-y-2"
                    >
                      {searchResults.map((user, index) => (
                        <motion.button
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSelectUser(user)}
                          className="w-full p-3 border-2 border-gray-200 hover:border-cyan-500 rounded-xl transition-all text-right group"
                        >
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.username}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold">
                                {user.username[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                                {user.username}
                                {user.accountType === 'company' && (
                                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                    🏢
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 truncate">{user.email}</div>
                              {user.firstName && (
                                <div className="text-xs text-gray-500">
                                  {user.firstName} {user.lastName}
                                </div>
                              )}
                              {user.location && (
                                <div className="text-xs text-gray-500">📍 {user.location}</div>
                              )}
                            </div>
                            <span className="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              →
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* No results */}
                {searchQuery && !searching && searchResults.length === 0 && !selectedUser && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="font-semibold">لم يتم العثور على نتائج</p>
                    <p className="text-sm mt-2">جرب البحث بطريقة أخرى</p>
                  </div>
                )}

                {/* Empty state */}
                {!searchQuery && !selectedUser && (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">👤</div>
                    <p className="font-semibold">ابدأ البحث</p>
                    <p className="text-sm mt-2">اكتب في حقل البحث أعلاه</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">
                  {target === 'all' && '🌍'}
                  {target === 'users' && '👥'}
                  {target === 'companies' && '🏢'}
                </div>
                <p className="font-semibold">
                  {target === 'all' && 'إرسال للجميع'}
                  {target === 'users' && 'إرسال لجميع الأفراد'}
                  {target === 'companies' && 'إرسال لجميع الشركات'}
                </p>
                <p className="text-sm mt-2">سيتم إرسال الإشعار تلقائياً</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Back to dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => router.push('/admin-panel/dashboard')}
            className="px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl font-semibold text-gray-700 transition-all"
          >
            ← العودة للوحة التحكم
          </button>
        </motion.div>
      </div>
    </div>
  );
}
