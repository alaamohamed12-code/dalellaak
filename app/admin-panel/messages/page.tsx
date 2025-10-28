"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

interface Message {
  id: number;
  conversationId: number;
  senderType: string;
  senderId: number;
  body: string;
  createdAt: string;
  readAt: string | null;
  senderName: string;
  senderUsername: string;
  senderImage: string | null;
}

interface User {
  id: number;
  username: string;
  name: string;
  type: 'user' | 'company';
  image: string | null;
}

interface ConversationData {
  user1: User;
  user2: User;
  messages: Message[];
  conversationId: number | null;
  conversationCreatedAt?: string;
  conversationUpdatedAt?: string;
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const [username1, setUsername1] = useState("");
  const [username2, setUsername2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("admin")) {
      router.replace("/admin-panel/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setConversationData(null);

    if (!username1.trim() || !username2.trim()) {
      setError("يرجى إدخال اسمي المستخدمين");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username1: username1.trim(), username2: username2.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "حدث خطأ أثناء جلب المحادثة");
        return;
      }

      setConversationData(data);
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-primary hover:text-primary/80 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة
          </button>
          <h1 className="text-4xl font-bold text-gray-800">مراجعة الرسائل</h1>
          <p className="text-gray-600 mt-2">عرض المحادثات بين المستخدمين والشركات</p>
        </div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username1" className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستخدم الأول
                </label>
                <input
                  type="text"
                  id="username1"
                  value={username1}
                  onChange={(e) => setUsername1(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="أدخل اسم المستخدم"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="username2" className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستخدم الثاني
                </label>
                <input
                  type="text"
                  id="username2"
                  value={username2}
                  onChange={(e) => setUsername2(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="أدخل اسم المستخدم"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "جاري البحث..." : "عرض المحادثة"}
            </button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Conversation Display */}
        {conversationData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            {/* Users Info */}
            <div className="mb-6 pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">معلومات المحادثة</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* User 1 */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    {conversationData.user1.image ? (
                      <Image
                        src={conversationData.user1.image}
                        alt={conversationData.user1.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                        👤
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{conversationData.user1.name}</p>
                    <p className="text-sm text-gray-600">@{conversationData.user1.username}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      conversationData.user1.type === 'company' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {conversationData.user1.type === 'company' ? 'شركة' : 'مستخدم'}
                    </span>
                  </div>
                </div>

                {/* User 2 */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    {conversationData.user2.image ? (
                      <Image
                        src={conversationData.user2.image}
                        alt={conversationData.user2.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                        👤
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{conversationData.user2.name}</p>
                    <p className="text-sm text-gray-600">@{conversationData.user2.username}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      conversationData.user2.type === 'company' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {conversationData.user2.type === 'company' ? 'شركة' : 'مستخدم'}
                    </span>
                  </div>
                </div>
              </div>

              {conversationData.conversationCreatedAt && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>تاريخ بدء المحادثة: {formatDate(conversationData.conversationCreatedAt)}</p>
                  {conversationData.conversationUpdatedAt && (
                    <p>آخر تحديث: {formatDate(conversationData.conversationUpdatedAt)}</p>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                الرسائل ({conversationData.messages.length})
              </h2>

              {conversationData.messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg">لا توجد رسائل في هذه المحادثة</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {conversationData.messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {message.senderImage ? (
                          <Image
                            src={message.senderImage}
                            alt={message.senderName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg text-gray-400">
                            👤
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">{message.senderName}</span>
                          <span className="text-xs text-gray-500">@{message.senderUsername}</span>
                          {message.readAt && (
                            <span className="text-xs text-green-600">✓ مقروءة</span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2 whitespace-pre-wrap">{message.body}</p>
                        <p className="text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
