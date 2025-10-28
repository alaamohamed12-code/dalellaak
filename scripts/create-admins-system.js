// إنشاء نظام إدارة المسؤولين المتعدد
// Multi-Admin Management System Setup

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'companies.db');
const db = new Database(dbPath);

console.log('🚀 Starting Multi-Admin System Setup...\n');

try {
  // 1. إنشاء جدول المسؤولين
  console.log('📋 Creating admins table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      permissions TEXT NOT NULL DEFAULT '{}',
      createdBy INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      lastLogin TEXT,
      isActive INTEGER DEFAULT 1,
      FOREIGN KEY (createdBy) REFERENCES admins(id)
    )
  `);
  console.log('✅ Admins table created\n');

  // 2. إنشاء جدول سجل النشاطات
  console.log('📋 Creating admin activity log table...');
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
  console.log('✅ Activity log table created\n');

  // 3. التحقق من وجود Super Admin
  const existingSuperAdmin = db.prepare('SELECT * FROM admins WHERE role = ?').get('super_admin');
  
  if (!existingSuperAdmin) {
    console.log('👑 Creating Super Admin account...');
    
    // تشفير كلمة المرور
    const hashedPassword = bcrypt.hashSync('Admin@12345', 10);
    
    // الصلاحيات الكاملة للسوبر أدمن
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
    
    const insertAdmin = db.prepare(`
      INSERT INTO admins (username, password, email, firstName, lastName, role, permissions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertAdmin.run(
      'superadmin',
      hashedPassword,
      'admin@platform.com',
      'Super',
      'Administrator',
      'super_admin',
      JSON.stringify(superAdminPermissions)
    );
    
    console.log('✅ Super Admin created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Super Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Username: superadmin');
    console.log('   Password: Admin@12345');
    console.log('   Email:    admin@platform.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANT: Change this password after first login!\n');
  } else {
    console.log('ℹ️  Super Admin already exists\n');
  }

  // 4. إنشاء أمثلة للأدوار
  console.log('📋 Creating sample admin accounts...');
  
  const superAdmin = db.prepare('SELECT id FROM admins WHERE role = ?').get('super_admin');
  
  // مسؤول عادي (Admin)
  const adminExists = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin_user');
  if (!adminExists && superAdmin) {
    const adminPermissions = {
      users: { view: true, edit: true, delete: false, export: true },
      companies: { view: true, edit: true, delete: false, verify: true, export: true },
      memberships: { view: true, manage: true, approve: true, cancel: false },
      reviews: { view: true, manage: true, delete: true },
      support: { view: true, manage: true, reply: true, close: true },
      contracts: { view: true, manage: false, approve: false, export: true },
      admins: { view: true, manage: false, create: false, edit: false, delete: false },
      settings: { view: true, edit: false },
      reports: { view: true, export: true },
      notifications: { send: true, manage: false }
    };
    
    db.prepare(`
      INSERT INTO admins (username, password, email, firstName, lastName, role, permissions, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'admin_user',
      bcrypt.hashSync('Admin@123', 10),
      'admin@example.com',
      'Admin',
      'User',
      'admin',
      JSON.stringify(adminPermissions),
      superAdmin.id
    );
    console.log('✅ Sample Admin created (username: admin_user, password: Admin@123)');
  }
  
  // مشرف (Moderator)
  const modExists = db.prepare('SELECT * FROM admins WHERE username = ?').get('moderator');
  if (!modExists && superAdmin) {
    const modPermissions = {
      users: { view: true, edit: false, delete: false, export: false },
      companies: { view: true, edit: false, delete: false, verify: false, export: false },
      memberships: { view: true, manage: false, approve: false, cancel: false },
      reviews: { view: true, manage: true, delete: true },
      support: { view: true, manage: true, reply: true, close: false },
      contracts: { view: true, manage: false, approve: false, export: false },
      admins: { view: false, manage: false, create: false, edit: false, delete: false },
      settings: { view: true, edit: false },
      reports: { view: true, export: false },
      notifications: { send: false, manage: false }
    };
    
    db.prepare(`
      INSERT INTO admins (username, password, email, firstName, lastName, role, permissions, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'moderator',
      bcrypt.hashSync('Mod@123', 10),
      'moderator@example.com',
      'Content',
      'Moderator',
      'moderator',
      JSON.stringify(modPermissions),
      superAdmin.id
    );
    console.log('✅ Sample Moderator created (username: moderator, password: Mod@123)');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Multi-Admin System Setup Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // عرض ملخص
  const totalAdmins = db.prepare('SELECT COUNT(*) as count FROM admins').get();
  const activeAdmins = db.prepare('SELECT COUNT(*) as count FROM admins WHERE isActive = 1').get();
  
  console.log('📊 Summary:');
  console.log(`   Total Admins: ${totalAdmins.count}`);
  console.log(`   Active Admins: ${activeAdmins.count}`);
  console.log(`   Roles: Super Admin, Admin, Moderator\n`);
  
  console.log('🔗 Next Steps:');
  console.log('   1. Access admin panel: /admin-panel/settings/admins');
  console.log('   2. Login with Super Admin credentials');
  console.log('   3. Create additional admin accounts');
  console.log('   4. Customize permissions as needed\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  db.close();
}
