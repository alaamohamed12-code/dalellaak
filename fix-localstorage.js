const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('companies.db');

console.log('🔧 تحديث localStorage لتتطابق مع قاعدة البيانات...');

// البحث عن المستخدم الموجود
const user = db.prepare('SELECT * FROM companies WHERE username = ?').get('3laamohamed12');

if (user) {
  console.log('✅ تم العثور على المستخدم:', user);
  console.log('');
  console.log('🔄 نسخ هذا الكود في console المتصفح:');
  console.log('');
  console.log(`localStorage.setItem('user', JSON.stringify({
    id: ${user.id},
    username: "${user.username}",
    accountType: "${user.accountType}",
    firstName: "${user.firstName}",
    lastName: "${user.lastName}",
    email: "${user.email}"
  }));`);
  console.log('');
  console.log('ثم أعد تحميل الصفحة');
} else {
  console.log('❌ لم يتم العثور على المستخدم');
}

db.close();