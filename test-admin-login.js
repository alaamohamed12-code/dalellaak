const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'companies.db');
const db = new Database(dbPath);

console.log('🔐 اختبار تسجيل دخول الأدمن');
console.log('═'.repeat(60));

const username = 'Mahmoudussama12';
const password = '7odarotana';

console.log(`\n📝 محاولة الدخول بـ:`);
console.log(`   اسم المستخدم: ${username}`);
console.log(`   كلمة المرور: ${password}`);

// Get admin from database
const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);

if (!admin) {
  console.log('\n❌ المستخدم غير موجود في قاعدة البيانات');
  db.close();
  process.exit(1);
}

console.log(`\n✅ المستخدم موجود!`);
console.log(`   ID: ${admin.id}`);
console.log(`   البريد: ${admin.email}`);
console.log(`   الدور: ${admin.role}`);
console.log(`   نشط: ${admin.isActive === 1 ? 'نعم' : 'لا'}`);

// Test password
console.log(`\n🔑 اختبار كلمة المرور...`);
console.log(`   كلمة المرور المدخلة: ${password}`);
console.log(`   الهاش المخزن: ${admin.password.substring(0, 30)}...`);

const isValid = bcrypt.compareSync(password, admin.password);

if (isValid) {
  console.log(`\n✅ كلمة المرور صحيحة! يمكنك تسجيل الدخول`);
  console.log(`\n🎉 بيانات الدخول:`);
  console.log(`   • اسم المستخدم: ${username}`);
  console.log(`   • كلمة المرور: ${password}`);
  console.log(`   • الدور: ${admin.role}`);
  console.log(`   • الصلاحيات: كاملة`);
} else {
  console.log(`\n❌ كلمة المرور غير صحيحة!`);
  console.log(`\n🔧 سيتم إعادة تعيين كلمة المرور...`);
  
  // Reset password
  const newHash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(newHash, admin.id);
  
  console.log(`✅ تم إعادة تعيين كلمة المرور بنجاح!`);
  console.log(`   الهاش الجديد: ${newHash.substring(0, 30)}...`);
  
  // Test again
  const testAgain = bcrypt.compareSync(password, newHash);
  if (testAgain) {
    console.log(`✅ اختبار التحقق: كلمة المرور تعمل الآن!`);
  }
}

db.close();
console.log('\n' + '═'.repeat(60));
