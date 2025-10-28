const Database = require('better-sqlite3');
const path = require('path');

const adminDbPath = path.join(process.cwd(), 'admin-users.db');

console.log('📋 فحص بيانات الأدمن...\n');

try {
  const db = new Database(adminDbPath);
  
  const admins = db.prepare('SELECT id, username, email, createdAt FROM admins').all();
  
  console.log('👥 عدد الأدمن:', admins.length);
  console.log('\n📝 قائمة الأدمن:\n');
  
  admins.forEach((admin, index) => {
    console.log(`${index + 1}. اليوزر: ${admin.username}`);
    console.log(`   الإيميل: ${admin.email || 'غير محدد'}`);
    console.log(`   تاريخ الإنشاء: ${admin.createdAt || 'غير محدد'}`);
    console.log('');
  });
  
  db.close();
  
  console.log('ℹ️  ملاحظة: كلمات المرور مشفرة بـ bcrypt ولا يمكن عرضها');
  console.log('ℹ️  إذا نسيت كلمة المرور، يجب إنشاء أدمن جديد أو تحديث كلمة المرور يدوياً');
  
} catch (error) {
  console.error('❌ خطأ:', error.message);
}
