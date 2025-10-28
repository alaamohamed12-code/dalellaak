const Database = require('better-sqlite3');
const path = require('path');

const companiesDbPath = path.join(process.cwd(), 'companies.db');

console.log('🔍 فحص حالة العضويات...\n');

try {
  const db = new Database(companiesDbPath);
  
  const companies = db.prepare(`
    SELECT id, firstName, membershipStatus, membershipExpiry, createdAt
    FROM companies
  `).all();
  
  console.log('📊 إجمالي الشركات:', companies.length);
  console.log('');
  
  companies.forEach((company) => {
    const now = new Date();
    const expiry = company.membershipExpiry ? new Date(company.membershipExpiry) : null;
    const daysLeft = expiry ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)) : null;
    
    console.log(`🏢 الشركة: ${company.firstName} (ID: ${company.id})`);
    console.log(`   ├─ الحالة: ${company.membershipStatus || 'غير محدد'}`);
    console.log(`   ├─ تاريخ الانتهاء: ${company.membershipExpiry || 'غير محدد'}`);
    console.log(`   ├─ الأيام المتبقية: ${daysLeft !== null ? daysLeft + ' يوم' : 'غير محدد'}`);
    console.log(`   └─ تاريخ التسجيل: ${company.createdAt || 'غير محدد'}`);
    console.log('');
  });
  
  db.close();
  
} catch (error) {
  console.error('❌ خطأ:', error.message);
}
