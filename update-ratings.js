const db = require('better-sqlite3')('companies.db');

const companies = db.prepare('SELECT id, firstName, lastName FROM companies').all();

companies.forEach(company => {
  // Generate random rating between 3.5 and 5.0
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
  // Generate random review count between 5 and 55
  const reviewCount = Math.floor(Math.random() * 50 + 5);
  
  db.prepare('UPDATE companies SET rating = ?, reviewCount = ? WHERE id = ?')
    .run(rating, reviewCount, company.id);
  
  console.log(`شركة ${company.firstName} ${company.lastName} (ID: ${company.id}) - تقييم: ${rating} (${reviewCount} مراجعة)`);
});

console.log('\nتم تحديث تقييمات جميع الشركات بنجاح!');
db.close();
