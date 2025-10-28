const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'companies.db');
console.log('📂 Database path:', dbPath);

const db = new Database(dbPath);

// Check all admins
const admins = db.prepare('SELECT id, username, email, role, isActive, createdAt FROM admins ORDER BY id').all();

console.log('\n📊 إجمالي الحسابات:', admins.length);
console.log('═'.repeat(80));

if (admins.length === 0) {
  console.log('⚠️ لا توجد حسابات في قاعدة البيانات!');
} else {
  admins.forEach(admin => {
    console.log(`
ID: ${admin.id}
اسم المستخدم: ${admin.username}
البريد الإلكتروني: ${admin.email}
الدور: ${admin.role}
نشط: ${admin.isActive === 1 ? '✅ نعم' : '❌ لا'}
تاريخ الإنشاء: ${admin.createdAt}
${'─'.repeat(80)}`);
  });
}

db.close();
console.log('\n✅ تم الفحص بنجاح');
