const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// إنشاء قاعدة البيانات
const db = new Database('companies.db');

console.log('🔧 إعداد قاعدة البيانات...');

// إنشاء جدول الشركات
db.exec(`
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  accountType TEXT DEFAULT 'company',
  image TEXT,
  taxDocs TEXT,
  sector TEXT,
  status TEXT DEFAULT 'pending',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// إنشاء جدول أعمال الشركات
db.exec(`
CREATE TABLE IF NOT EXISTS company_works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  companyId INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  media TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies (id)
);
`);

// إدخال بيانات تجريبية للشركة
const hashedPassword = bcrypt.hashSync('123456', 10);

// حذف البيانات القديمة أولاً
db.exec('DELETE FROM company_works WHERE 1=1');
db.exec('DELETE FROM companies WHERE 1=1');

// إعادة تعيين auto increment لتبدأ من 1
db.exec('DELETE FROM sqlite_sequence WHERE name="companies"');
db.exec('DELETE FROM sqlite_sequence WHERE name="company_works"');

const insertCompany = db.prepare(`
  INSERT INTO companies (firstName, lastName, email, phone, username, password, accountType, status, sector)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// إدخال 3 شركات وهمية أولاً للوصول للـ ID 4
for (let i = 1; i <= 3; i++) {
  insertCompany.run(
    `شركة${i}`,
    'تجريبية',
    `company${i}@test.com`,
    `+20123456789${i}`,
    `testcompany${i}`,
    hashedPassword,
    'company',
    'pending',
    'أخرى'
  );
}

try {
  // إدخال الشركة الرئيسية بـ ID=4
  const result = insertCompany.run(
    'علاء',
    'محمد',
    'alaa@company.com',
    '+201234567890',
    '3laamohamed12',
    hashedPassword,
    'company',
    'approved',
    'استشارات هندسية'
  );
  
  console.log('✅ تم إنشاء شركة تجريبية بنجاح، ID:', result.lastInsertRowid);
  
  // إدخال بعض الأعمال التجريبية
  const insertWork = db.prepare(`
    INSERT INTO company_works (companyId, title, description, media)
    VALUES (?, ?, ?, ?)
  `);
  
  insertWork.run(
    result.lastInsertRowid,
    'مشروع تصميم مبنى سكني',
    'تصميم مبنى سكني مكون من 5 طوابق بمساحة 200 متر مربع لكل طابق',
    '[]'
  );
  
  insertWork.run(
    result.lastInsertRowid,
    'استشارة هندسية لمصنع',
    'تقديم استشارة هندسية شاملة لتطوير وتحسين خطوط الإنتاج',
    '[]'
  );
  
  console.log('✅ تم إضافة أعمال تجريبية بنجاح');
  
} catch (error) {
  console.error('❌ خطأ:', error.message);
}

db.close();
console.log('🎉 تم إعداد قاعدة البيانات بنجاح!');
console.log('📋 بيانات تسجيل الدخول:');
console.log('   اسم المستخدم: 3laamohamed12');
console.log('   كلمة المرور: 123456');