const Database = require('better-sqlite3');
const path = require('path');

const companiesDbPath = path.join(process.cwd(), 'companies.db');
const companiesDb = new Database(companiesDbPath);

console.log('📦 إنشاء جدول التقييمات...');

try {
  // Drop existing table to recreate with new structure
  companiesDb.exec(`DROP TABLE IF EXISTS company_reviews`);
  console.log('🗑️  تم حذف الجدول القديم');

  // Create company_reviews table
  companiesDb.exec(`
    CREATE TABLE IF NOT EXISTS company_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      companyId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      userFirstName TEXT,
      userLastName TEXT,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
      UNIQUE(companyId, userId)
    )
  `);

  console.log('✅ تم إنشاء جدول company_reviews بنجاح!');

  // Add rating and reviewCount columns to companies table if they don't exist
  try {
    companiesDb.exec(`ALTER TABLE companies ADD COLUMN rating REAL DEFAULT 0`);
    console.log('✅ تم إضافة حقل rating لجدول companies');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('ℹ️  حقل rating موجود بالفعل');
    } else {
      throw e;
    }
  }

  try {
    companiesDb.exec(`ALTER TABLE companies ADD COLUMN reviewCount INTEGER DEFAULT 0`);
    console.log('✅ تم إضافة حقل reviewCount لجدول companies');
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('ℹ️  حقل reviewCount موجود بالفعل');
    } else {
      throw e;
    }
  }

  // Add some sample reviews for testing
  const companies = companiesDb.prepare('SELECT id FROM companies WHERE status = ? LIMIT 1').all('approved');

  if (companies.length > 0) {
    const sampleReviews = [
      {
        companyId: companies[0].id,
        userId: 1,
        userFirstName: 'أحمد',
        userLastName: 'محمد',
        rating: 5,
        comment: 'خدمة ممتازة جداً! التعامل كان احترافي والنتيجة فاقت التوقعات. أنصح بالتعامل معهم بشدة.'
      },
      {
        companyId: companies[0].id,
        userId: 2,
        userFirstName: 'فاطمة',
        userLastName: 'علي',
        rating: 4,
        comment: 'شركة جيدة وملتزمة بالمواعيد. الجودة عالية والأسعار مناسبة.'
      },
      {
        companyId: companies[0].id,
        userId: 3,
        userFirstName: 'محمد',
        userLastName: 'حسن',
        rating: 5,
        comment: 'تجربة رائعة! فريق محترف ومتعاون. سأتعامل معهم مرة أخرى بكل تأكيد.'
      }
    ];

    const insertStmt = companiesDb.prepare(`
      INSERT OR IGNORE INTO company_reviews (companyId, userId, userFirstName, userLastName, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let addedCount = 0;
    for (const review of sampleReviews) {
      const result = insertStmt.run(
        review.companyId,
        review.userId,
        review.userFirstName,
        review.userLastName,
        review.rating,
        review.comment
      );
      if (result.changes > 0) addedCount++;
    }

    if (addedCount > 0) {
      // Calculate and update company rating
      const stats = companiesDb.prepare(`
        SELECT 
          AVG(rating) as avgRating,
          COUNT(*) as count
        FROM company_reviews
        WHERE companyId = ?
      `).get(companies[0].id);

      companiesDb.prepare(`
        UPDATE companies 
        SET rating = ?, reviewCount = ?
        WHERE id = ?
      `).run(stats.avgRating, stats.count, companies[0].id);

      console.log(`✅ تم إضافة ${addedCount} تقييمات تجريبية!`);
      console.log(`📊 التقييم الإجمالي: ${stats.avgRating.toFixed(1)}/5.0 (${stats.count} تقييم)`);
    }
  }

  // Show all reviews
  const reviews = companiesDb.prepare(`
    SELECT r.*, c.firstName as companyName
    FROM company_reviews r
    LEFT JOIN companies c ON r.companyId = c.id
    ORDER BY r.createdAt DESC
  `).all();

  if (reviews.length > 0) {
    console.log('\n📋 التقييمات المضافة:');
    console.table(reviews.map(r => ({
      id: r.id,
      company: r.companyName,
      user: `${r.userFirstName} ${r.userLastName}`,
      rating: '⭐'.repeat(r.rating),
      comment: r.comment?.substring(0, 50) + '...'
    })));
  }

  console.log('\n✨ تم إعداد نظام التقييمات بنجاح!');

} catch (error) {
  console.error('❌ خطأ:', error.message);
  process.exit(1);
} finally {
  companiesDb.close();
}
