const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'companies.db');
const db = new Database(dbPath);

console.log('🔧 إنشاء مسؤول تجريبي بصلاحيات محدودة...\n');

// صلاحيات محدودة - يمكنه فقط عرض الشركات والمستخدمين، بدون حذف أو تعديل
const limitedPermissions = {
  companies: {
    view: true,
    create: false,
    update: false,
    delete: false
  },
  users: {
    view: true,
    create: false,
    update: false,
    delete: false
  },
  services: {
    view: true,
    create: false,
    update: false,
    delete: false
  },
  reviews: {
    view: true,
    create: false,
    update: true,  // يمكنه الموافقة/رفض التقييمات
    delete: true   // يمكنه حذف التقييمات المسيئة
  },
  notifications: {
    view: false,
    create: false,
    update: false,
    delete: false
  },
  messages: {
    view: true,
    create: false,
    update: false,
    delete: false
  },
  contracts: {
    view: true,
    create: false,
    update: false,
    delete: false
  },
  cities: {
    view: false,
    create: false,
    update: false,
    delete: false
  },
  sectors: {
    view: false,
    create: false,
    update: false,
    delete: false
  },
  homeContent: {
    view: false,
    create: false,
    update: false,
    delete: false
  },
  faq: {
    view: false,
    create: false,
    update: false,
    delete: false
  },
  terms: {
    view: false,
    create: false,
    update: false,
    delete: false
  },
  support: {
    view: true,
    create: true,  // يمكنه الرد على التذاكر
    update: true,
    delete: false
  },
  admins: {
    view: false,   // لا يمكنه رؤية المسؤولين الآخرين
    create: false,
    update: false,
    delete: false
  },
  memberships: {
    view: false,
    create: false,
    update: false,
    delete: false
  }
};

// بيانات المسؤول التجريبي
const testAdmin = {
  username: 'moderator_test',
  email: 'moderator@test.com',
  password: 'test123',
  firstName: 'محمد',
  lastName: 'المراقب',
  role: 'moderator'
};

try {
  // حذف المسؤول إذا كان موجوداً
  db.prepare('DELETE FROM admins WHERE username = ?').run(testAdmin.username);
  
  // إنشاء المسؤول الجديد
  const hashedPassword = bcrypt.hashSync(testAdmin.password, 10);
  
  const result = db.prepare(`
    INSERT INTO admins (
      username, password, email, firstName, lastName, role, 
      permissions, createdAt, isActive
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 1)
  `).run(
    testAdmin.username,
    hashedPassword,
    testAdmin.email,
    testAdmin.firstName,
    testAdmin.lastName,
    testAdmin.role,
    JSON.stringify(limitedPermissions)
  );

  console.log('✅ تم إنشاء المسؤول التجريبي بنجاح!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📧 معلومات تسجيل الدخول:');
  console.log(`   اسم المستخدم: ${testAdmin.username}`);
  console.log(`   كلمة المرور: ${testAdmin.password}`);
  console.log(`   البريد الإلكتروني: ${testAdmin.email}`);
  console.log(`   الدور: ${testAdmin.role}`);
  console.log(`   معرف الحساب: ${result.lastInsertRowid}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('🔐 الصلاحيات الممنوحة:');
  console.log('   ✅ عرض الشركات (بدون تعديل أو حذف)');
  console.log('   ✅ عرض المستخدمين (بدون تعديل أو حذف)');
  console.log('   ✅ عرض الخدمات (بدون تعديل أو حذف)');
  console.log('   ✅ إدارة التقييمات (موافقة/رفض/حذف)');
  console.log('   ✅ عرض الرسائل (بدون تعديل أو حذف)');
  console.log('   ✅ عرض العقود (بدون تعديل أو حذف)');
  console.log('   ✅ إدارة الدعم الفني (رد على التذاكر)\n');
  
  console.log('🚫 الصلاحيات المرفوضة:');
  console.log('   ❌ إرسال الإشعارات');
  console.log('   ❌ إدارة المدن');
  console.log('   ❌ إدارة المجالات');
  console.log('   ❌ تعديل محتوى الصفحة الرئيسية');
  console.log('   ❌ إدارة الأسئلة الشائعة');
  console.log('   ❌ تعديل الشروط والأحكام');
  console.log('   ❌ إدارة المسؤولين');
  console.log('   ❌ إدارة العضويات\n');
  
  console.log('🧪 اختبار النظام:');
  console.log('   1. سجّل دخول بحساب Super Admin: Mahmoudussama12');
  console.log('   2. ستجد جميع الأزرار في لوحة التحكم');
  console.log('   3. سجّل خروج ثم سجّل دخول بحساب: moderator_test');
  console.log('   4. ستجد فقط الأزرار المسموح بها');
  console.log('   5. حاول الوصول إلى صفحة ممنوعة → ستظهر "ليس لديك صلاحية"\n');
  
  // عرض عدد المسؤولين الحاليين
  const admins = db.prepare('SELECT id, username, role, isActive FROM admins').all();
  console.log('👥 المسؤولون الحاليون:');
  admins.forEach(admin => {
    const status = admin.isActive ? '✅ نشط' : '❌ معطل';
    console.log(`   - ${admin.username} (${admin.role}) - ${status}`);
  });

} catch (error) {
  console.error('❌ خطأ:', error.message);
} finally {
  db.close();
}
