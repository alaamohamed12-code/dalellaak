const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'site-settings.db');
const db = new Database(dbPath);

console.log('📦 إنشاء جدول محتوى الصفحة الرئيسية...');

try {
  // Create home_content table
  db.exec(`
    CREATE TABLE IF NOT EXISTS home_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ تم إنشاء جدول home_content بنجاح!');

  // Add default content
  const defaultContent = [
    {
      section: 'hero',
      content: JSON.stringify({
        title: 'دليلك للأفضل في التصميم والبناء',
        subtitle: 'أكبر منصة تربطك بأفضل الشركات الهندسية والموردين في الخليج',
        description: 'نشاركك رحلة التصميم والبناء ونساعدك في اختيار الأفضل',
        cashback: 'استمتع بكاش باك 2% فور إتمام التعاقد 💰',
        ctaText: 'استكشف الخدمات',
        backgroundImage: '/hero-bg.jpg'
      })
    },
    {
      section: 'features',
      content: JSON.stringify({
        title: 'لماذا تختارنا؟',
        items: [
          {
            icon: 'shield',
            title: 'موثوقية عالية',
            description: 'جميع الشركات معتمدة ومراجعة بعناية'
          },
          {
            icon: 'wallet',
            title: 'كاش باك مضمون',
            description: 'احصل على 2% كاش باك عند كل تعاقد'
          },
          {
            icon: 'users',
            title: 'فريق محترف',
            description: 'دعم فني متاح على مدار الساعة'
          }
        ]
      })
    },
    {
      section: 'statistics',
      content: JSON.stringify({
        companies: { count: '500+', label: 'شركة معتمدة' },
        projects: { count: '2000+', label: 'مشروع منجز' },
        users: { count: '10000+', label: 'عميل راضٍ' },
        cashback: { count: '2%', label: 'كاش باك' }
      })
    },
    {
      section: 'howItWorks',
      content: JSON.stringify({
        title: 'كيف يعمل الموقع؟',
        steps: [
          {
            number: 1,
            title: 'اختر الخدمة',
            description: 'تصفح الخدمات واختر ما يناسبك'
          },
          {
            number: 2,
            title: 'تواصل مع الشركة',
            description: 'راسل الشركة المناسبة مباشرة'
          },
          {
            number: 3,
            title: 'احصل على كاش باك',
            description: 'استلم 2% كاش باك عند التعاقد'
          }
        ]
      })
    }
  ];

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO home_content (section, content)
    VALUES (?, ?)
  `);

  for (const item of defaultContent) {
    insertStmt.run(item.section, item.content);
  }

  console.log('✅ تم إضافة المحتوى الافتراضي!');
  console.log('📊 عدد الأقسام المضافة:', defaultContent.length);

  // Show the created content
  const content = db.prepare('SELECT * FROM home_content').all();
  console.log('\n📋 الأقسام المضافة:');
  content.forEach(item => {
    console.log(`  - ${item.section}`);
  });

} catch (error) {
  console.error('❌ خطأ:', error.message);
  process.exit(1);
} finally {
  db.close();
}
