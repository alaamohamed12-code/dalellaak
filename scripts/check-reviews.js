const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'companies.db');
const db = new Database(dbPath);

console.log('🔍 فحص قاعدة البيانات للتقييمات...\n');

try {
  // Check if company_reviews table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='company_reviews'").all();
  console.log('✅ جدول company_reviews:', tables.length > 0 ? 'موجود' : '❌ غير موجود');

  if (tables.length > 0) {
    // Get table schema
    const schema = db.prepare("PRAGMA table_info(company_reviews)").all();
    console.log('\n📋 هيكل الجدول:');
    console.table(schema.map(col => ({
      name: col.name,
      type: col.type,
      notNull: col.notnull ? 'نعم' : 'لا',
      defaultValue: col.dflt_value || '-'
    })));

    // Count reviews
    const count = db.prepare('SELECT COUNT(*) as count FROM company_reviews').get();
    console.log(`\n📊 عدد التقييمات: ${count.count}`);

    // Get all reviews with company info
    const reviews = db.prepare(`
      SELECT 
        r.*,
        c.firstName as companyName,
        c.rating as companyRating,
        c.reviewCount as companyReviewCount
      FROM company_reviews r
      LEFT JOIN companies c ON r.companyId = c.id
      ORDER BY r.createdAt DESC
      LIMIT 10
    `).all();

    if (reviews.length > 0) {
      console.log('\n📝 التقييمات الموجودة:');
      console.table(reviews.map(r => ({
        id: r.id,
        شركة: r.companyName,
        مستخدم: `${r.userFirstName} ${r.userLastName}`,
        تقييم: '⭐'.repeat(r.rating),
        'تقييم_الشركة': r.companyRating ? r.companyRating.toFixed(1) : 'N/A',
        'عدد_تقييمات': r.companyReviewCount || 0,
        تاريخ: new Date(r.createdAt).toLocaleDateString('ar-EG')
      })));

      console.log('\n💬 التعليقات:');
      reviews.forEach(r => {
        console.log(`- ${r.userFirstName}: ${r.comment?.substring(0, 80)}...`);
      });
    } else {
      console.log('\n⚠️  لا توجد تقييمات في قاعدة البيانات');
    }

    // Check companies with ratings
    const companiesWithRatings = db.prepare(`
      SELECT id, firstName, rating, reviewCount 
      FROM companies 
      WHERE reviewCount > 0
      ORDER BY rating DESC
    `).all();

    console.log(`\n🏢 الشركات المقيّمة: ${companiesWithRatings.length}`);
    if (companiesWithRatings.length > 0) {
      console.table(companiesWithRatings.map(c => ({
        id: c.id,
        اسم_الشركة: c.firstName,
        التقييم: c.rating ? `${c.rating.toFixed(1)} ⭐` : 'N/A',
        عدد_التقييمات: c.reviewCount
      })));
    }
  }

  // Check if rating columns exist in companies table
  const companySchema = db.prepare("PRAGMA table_info(companies)").all();
  const hasRating = companySchema.some(col => col.name === 'rating');
  const hasReviewCount = companySchema.some(col => col.name === 'reviewCount');
  
  console.log('\n🏢 حقول جدول الشركات:');
  console.log('  - حقل rating:', hasRating ? '✅ موجود' : '❌ غير موجود');
  console.log('  - حقل reviewCount:', hasReviewCount ? '✅ موجود' : '❌ غير موجود');

} catch (error) {
  console.error('❌ خطأ:', error.message);
} finally {
  db.close();
}

console.log('\n✨ انتهى الفحص!');
