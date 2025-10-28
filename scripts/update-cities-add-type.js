const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.db');
const db = new Database(dbPath);

console.log('🔄 بدء تحديث جدول المدن...');

try {
  // إضافة عمود cityType إلى جدول cities
  db.exec(`
    ALTER TABLE cities ADD COLUMN cityType TEXT DEFAULT 'both';
  `);
  
  console.log('✅ تم إضافة عمود cityType بنجاح!');
  
  // تحديث البيانات الموجودة - المدن الأولى 10 للتسجيل والباقي للفلتر
  const cities = db.prepare('SELECT id FROM cities ORDER BY id').all();
  
  if (cities.length > 0) {
    // أول 10 مدن للتسجيل
    const signupCityIds = cities.slice(0, 10).map(c => c.id);
    if (signupCityIds.length > 0) {
      const placeholders = signupCityIds.map(() => '?').join(',');
      db.prepare(`UPDATE cities SET cityType = 'signup' WHERE id IN (${placeholders})`).run(...signupCityIds);
      console.log(`✅ تم تعيين ${signupCityIds.length} مدينة للتسجيل`);
    }
    
    // باقي المدن للفلتر
    const filterCityIds = cities.slice(10).map(c => c.id);
    if (filterCityIds.length > 0) {
      const placeholders = filterCityIds.map(() => '?').join(',');
      db.prepare(`UPDATE cities SET cityType = 'filter' WHERE id IN (${placeholders})`).run(...filterCityIds);
      console.log(`✅ تم تعيين ${filterCityIds.length} مدينة للفلتر`);
    }
  }
  
  console.log('✅ تم تحديث جدول المدن بنجاح!');
  console.log('📊 الآن يمكنك التحكم في المدن حسب النوع:');
  console.log('   - signup: تظهر في صفحة التسجيل');
  console.log('   - filter: تظهر في فلاتر البحث');
  console.log('   - both: تظهر في كليهما');
  
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('ℹ️ العمود cityType موجود بالفعل');
  } else {
    console.error('❌ خطأ في تحديث قاعدة البيانات:', error.message);
  }
}

db.close();
console.log('✅ تم إغلاق الاتصال بقاعدة البيانات');
