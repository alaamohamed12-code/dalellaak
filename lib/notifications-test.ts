/**
 * Test file for notifications system
 * This file demonstrates the new notification features
 */

// Test data for notifications
export const testNotifications = [
  {
    id: 1,
    notificationId: 1,
    isRead: 0,
    notification: {
      id: 1,
      message: "مرحباً! لديك رسالة جديدة من أحد العملاء",
      target: "user",
      createdAt: new Date().toISOString(),
      createdBy: "النظام"
    }
  },
  {
    id: 2,
    notificationId: 2,
    isRead: 0,
    notification: {
      id: 2,
      message: "تم قبول طلب التسجيل الخاص بك بنجاح",
      target: "company",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      createdBy: "الإدارة"
    }
  },
  {
    id: 3,
    notificationId: 3,
    isRead: 1,
    readAt: new Date(Date.now() - 7200000).toISOString(),
    notification: {
      id: 3,
      message: "تذكير: يرجى تحديث معلومات الملف الشخصي",
      target: "all",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      createdBy: "النظام"
    }
  },
  {
    id: 4,
    notificationId: 4,
    isRead: 1,
    readAt: new Date(Date.now() - 172800000).toISOString(),
    notification: {
      id: 4,
      message: "تم تفعيل حسابك بنجاح، يمكنك الآن الوصول إلى جميع الخدمات",
      target: "user",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      createdBy: "الإدارة"
    }
  },
  {
    id: 5,
    notificationId: 5,
    isRead: 0,
    notification: {
      id: 5,
      message: "عرض خاص: خصم 20% على جميع الخدمات لفترة محدودة!",
      target: "all",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      createdBy: "التسويق"
    }
  }
];

// Test API calls
export async function testNotificationAPIs() {
  console.log("🧪 Testing Notification APIs...\n");

  // Test 1: Get all notifications
  console.log("1️⃣ Testing GET /api/notifications");
  try {
    const res = await fetch("/api/notifications?userId=1&accountType=user");
    const data = await res.json();
    console.log("✅ Success:", data);
  } catch (error) {
    console.error("❌ Error:", error);
  }

  // Test 2: Mark single as read
  console.log("\n2️⃣ Testing POST /api/notifications/mark-read");
  try {
    const res = await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userNotificationId: 1 })
    });
    const data = await res.json();
    console.log("✅ Success:", data);
  } catch (error) {
    console.error("❌ Error:", error);
  }

  // Test 3: Mark all as read
  console.log("\n3️⃣ Testing POST /api/notifications/mark-all-read");
  try {
    const res = await fetch("/api/notifications/mark-all-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: 1, accountType: "user" })
    });
    const data = await res.json();
    console.log("✅ Success:", data);
  } catch (error) {
    console.error("❌ Error:", error);
  }

  // Test 4: Delete multiple
  console.log("\n4️⃣ Testing POST /api/notifications/delete");
  try {
    const res = await fetch("/api/notifications/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userNotificationIds: [1, 2, 3] })
    });
    const data = await res.json();
    console.log("✅ Success:", data);
  } catch (error) {
    console.error("❌ Error:", error);
  }

  console.log("\n✨ All tests completed!");
}

// Animation test helpers
export const animationVariants = {
  // Slide in from right
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  // Fade scale
  fadeScale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 }
  },

  // Bounce
  bounce: {
    animate: {
      y: [0, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Pulse
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Shake (for notification bell)
  shake: {
    animate: {
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 3
      }
    }
  }
};

// Helper to format dates
export function formatNotificationDate(date: string, lang: string = 'ar') {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return lang === 'ar' ? 'الآن' : 'Now';
  } else if (diffMins < 60) {
    return lang === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins} min ago`;
  } else if (diffHours < 24) {
    return lang === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays} days ago`;
  } else {
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

// Helper to get notification icon
export function getNotificationIcon(type: string, isRead: boolean) {
  if (!isRead) {
    return '🔔';
  }
  
  switch (type) {
    case 'message':
      return '💬';
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '✓';
  }
}

export default {
  testNotifications,
  testNotificationAPIs,
  animationVariants,
  formatNotificationDate,
  getNotificationIcon
};
