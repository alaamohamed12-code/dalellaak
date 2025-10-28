/**
 * سكريبت لإصلاح جدول المسؤولين (admins) في قاعدة البيانات
 * 
 * المشكلة:
 * - API يبحث عن جدول admins في companies.db
 * - الجدول إما غير موجود أو يفتقد إلى أعمدة مطلوبة
 * 
 * الحل:
 * - إنشاء/تحديث جدول admins في companies.db
 * - إضافة جميع الأعمدة المطلوبة
 * - إنشاء حساب super admin افتراضي
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'companies.db');
const db = new Database(dbPath);

console.log('🔧 بدء إصلاح جدول المسؤولين...\n');

try {
  // 1. إنشاء جدول admins إذا لم يكن موجودًا
  console.log('📋 إنشاء/تحديث جدول admins...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT UNIQUE,
      firstName TEXT,
      lastName TEXT,
      role TEXT DEFAULT 'admin',
      permissions TEXT DEFAULT '{}',
      createdBy INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      lastLogin TEXT,
      isActive INTEGER DEFAULT 1
    )
  `);
  
  console.log('✅ تم إنشاء جدول admins بنجاح\n');

  // 2. التحقق من الأعمدة الموجودة وإضافة الناقصة
  console.log('🔍 التحقق من الأعمدة...');
  
  const tableInfo = db.prepare("PRAGMA table_info(admins)").all();
  const existingColumns = tableInfo.map(col => col.name);
  
  const requiredColumns = {
    firstName: { type: 'TEXT', default: null },
    lastName: { type: 'TEXT', default: null },
    role: { type: 'TEXT', default: "'admin'" },
    permissions: { type: 'TEXT', default: "'{}'" },
    createdBy: { type: 'INTEGER', default: null },
    updatedAt: { type: 'TEXT', default: 'CURRENT_TIMESTAMP' },
    lastLogin: { type: 'TEXT', default: null },
    isActive: { type: 'INTEGER', default: 1 }
  };

  for (const [colName, colDef] of Object.entries(requiredColumns)) {
    if (!existingColumns.includes(colName)) {
      const defaultClause = colDef.default ? `DEFAULT ${colDef.default}` : '';
      const alterQuery = `ALTER TABLE admins ADD COLUMN ${colName} ${colDef.type} ${defaultClause}`;
      
      try {
        db.exec(alterQuery);
        console.log(`  ✅ تمت إضافة عمود: ${colName}`);
      } catch (error) {
        console.log(`  ⚠️ لم يتم إضافة ${colName} (قد يكون موجودًا بالفعل)`);
      }
    } else {
      console.log(`  ℹ️ العمود ${colName} موجود بالفعل`);
    }
  }

  console.log('\n');

  // 3. التحقق من وجود حساب super admin
  console.log('👤 التحقق من حساب Super Admin...');
  
  const superAdmin = db.prepare("SELECT * FROM admins WHERE role = 'super_admin'").get();
  
  if (superAdmin) {
    console.log('✅ حساب Super Admin موجود بالفعل');
    console.log(`   المستخدم: ${superAdmin.username}`);
    console.log(`   البريد: ${superAdmin.email || 'غير محدد'}`);
  } else {
    console.log('⚠️ لا يوجد حساب Super Admin');
    console.log('📝 إنشاء حساب Super Admin افتراضي...\n');
    
    const defaultPassword = 'Admin@123';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    
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
    
    db.prepare(`
      INSERT INTO admins (
        username, password, email, firstName, lastName, 
        role, permissions, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'superadmin',
      hashedPassword,
      'admin@platform.com',
      'Super',
      'Admin',
      'super_admin',
      JSON.stringify(superAdminPermissions),
      1
    );
    
    console.log('✅ تم إنشاء حساب Super Admin بنجاح!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 معلومات تسجيل الدخول:');
    console.log('   اسم المستخدم: superadmin');
    console.log('   كلمة المرور: Admin@123');
    console.log('   البريد: admin@platform.com');
    console.log('═══════════════════════════════════════');
    console.log('⚠️ يُرجى تغيير كلمة المرور بعد أول تسجيل دخول!');
  }

  console.log('\n');

  // 4. إنشاء جدول سجل النشاطات إذا لم يكن موجودًا
  console.log('📊 إنشاء جدول سجل النشاطات...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      adminId INTEGER NOT NULL,
      action TEXT NOT NULL,
      targetType TEXT,
      targetId INTEGER,
      details TEXT,
      ipAddress TEXT,
      userAgent TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (adminId) REFERENCES admins(id)
    )
  `);
  
  console.log('✅ تم إنشاء جدول admin_activity_log بنجاح\n');

  // 5. عرض إحصائيات
  console.log('📊 الإحصائيات:');
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM admins").get();
  const superAdminCount = db.prepare("SELECT COUNT(*) as count FROM admins WHERE role = 'super_admin'").get();
  const activeCount = db.prepare("SELECT COUNT(*) as count FROM admins WHERE isActive = 1").get();
  
  console.log(`   إجمالي المسؤولين: ${adminCount.count}`);
  console.log(`   Super Admins: ${superAdminCount.count}`);
  console.log(`   النشطون: ${activeCount.count}`);

  console.log('\n✅ تم إصلاح جدول المسؤولين بنجاح!\n');
  console.log('🎉 يمكنك الآن الوصول إلى صفحة إدارة المسؤولين\n');

} catch (error) {
  console.error('❌ خطأ:', error.message);
  console.error(error);
} finally {
  db.close();
}
