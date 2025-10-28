/**
 * سكريبت لإعادة تعيين حسابات المسؤولين
 * 
 * الوظائف:
 * 1. حذف جميع حسابات المسؤولين الحالية
 * 2. إنشاء حساب Super Admin جديد
 * 3. حذف سجل النشاطات القديم
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'companies.db');
const db = new Database(dbPath);

console.log('🔄 بدء إعادة تعيين حسابات المسؤولين...\n');

try {
  // 1. حذف جميع حسابات المسؤولين الحالية
  console.log('🗑️  حذف جميع حسابات المسؤولين الحالية...');
  
  const currentAdmins = db.prepare('SELECT id, username FROM admins').all();
  console.log(`   عدد الحسابات الحالية: ${currentAdmins.length}`);
  
  if (currentAdmins.length > 0) {
    currentAdmins.forEach(admin => {
      console.log(`   - حذف: ${admin.username} (ID: ${admin.id})`);
    });
    
    db.prepare('DELETE FROM admins').run();
    console.log('✅ تم حذف جميع الحسابات القديمة\n');
  } else {
    console.log('   لا توجد حسابات قديمة\n');
  }

  // 2. حذف سجل النشاطات القديم
  console.log('🗑️  حذف سجل النشاطات القديم...');
  try {
    db.prepare('DELETE FROM admin_activity_log').run();
    console.log('✅ تم حذف سجل النشاطات\n');
  } catch (error) {
    console.log('   سجل النشاطات غير موجود أو تم حذفه بالفعل\n');
  }

  // 3. إنشاء حساب Super Admin الجديد
  console.log('👤 إنشاء حساب Super Admin الجديد...\n');
  
  const newAdminData = {
    email: 'Mahmoudussama12@gmail.com',
    password: '7odarotana',
    username: 'Mahmoudussama12',
    firstName: 'Mahmoud',
    lastName: 'Ussama',
    role: 'super_admin'
  };
  
  // تشفير كلمة المرور
  const hashedPassword = bcrypt.hashSync(newAdminData.password, 10);
  
  // صلاحيات Super Admin (كل الصلاحيات)
  const superAdminPermissions = {
    users: { view: true, edit: true, delete: true, export: true },
    companies: { view: true, edit: true, delete: true, verify: true, export: true },
    memberships: { view: true, manage: true, approve: true, cancel: true },
    reviews: { view: true, manage: true, delete: true },
    support: { view: true, manage: true, reply: true, close: true },
    contracts: { view: true, manage: true, approve: true, export: true },
    admins: { view: true, manage: true, create: true, edit: true, delete: true },
    settings: { view: true, edit: true },
    reports: { view: true, export: true },
    notifications: { send: true, manage: true }
  };
  
  // إدراج الحساب الجديد
  const result = db.prepare(`
    INSERT INTO admins (
      username, password, email, firstName, lastName, 
      role, permissions, isActive, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    newAdminData.username,
    hashedPassword,
    newAdminData.email,
    newAdminData.firstName,
    newAdminData.lastName,
    newAdminData.role,
    JSON.stringify(superAdminPermissions),
    1 // isActive
  );
  
  console.log('✅ تم إنشاء حساب Super Admin بنجاح!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📧 معلومات تسجيل الدخول الجديدة:');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   البريد الإلكتروني: ${newAdminData.email}`);
  console.log(`   اسم المستخدم: ${newAdminData.username}`);
  console.log(`   كلمة المرور: ${newAdminData.password}`);
  console.log(`   الدور: Super Admin (المؤسس الرئيسي)`);
  console.log(`   معرف الحساب: ${result.lastInsertRowid}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // 4. التحقق من النتيجة
  console.log('🔍 التحقق من النتيجة...');
  const admins = db.prepare('SELECT id, username, email, role, isActive FROM admins').all();
  
  console.log(`   إجمالي الحسابات الحالية: ${admins.length}`);
  admins.forEach(admin => {
    console.log(`   ✓ ${admin.username} (${admin.email}) - ${admin.role} - ${admin.isActive ? 'نشط' : 'معطل'}`);
  });

  console.log('\n✅ تم إعادة تعيين حسابات المسؤولين بنجاح!\n');
  
  console.log('📝 الخطوات التالية:');
  console.log('1. اذهب إلى: http://localhost:3000/admin-panel/login');
  console.log('2. استخدم البيانات أعلاه لتسجيل الدخول');
  console.log('3. يمكنك الآن إضافة مسؤولين آخرين من صفحة "إدارة المسؤولين"');
  console.log('4. حسابك محمي ولا يمكن لأي مسؤول آخر حذفه\n');
  
  console.log('⚠️  ملاحظات أمنية:');
  console.log('- احفظ كلمة المرور في مكان آمن');
  console.log('- لا تشارك بيانات الدخول مع أحد');
  console.log('- يمكنك تغيير كلمة المرور من لوحة التحكم\n');

} catch (error) {
  console.error('❌ خطأ:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  db.close();
}
