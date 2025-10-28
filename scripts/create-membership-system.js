const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'companies.db');
const db = new Database(dbPath);

console.log('📦 إنشاء نظام العضوية...\n');

try {
  // Step 1: Add membership columns to companies table
  console.log('1️⃣ إضافة حقول العضوية لجدول الشركات...');
  
  // Check if columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(companies)").all();
  const hasStatus = tableInfo.some(col => col.name === 'membershipStatus');
  const hasExpiry = tableInfo.some(col => col.name === 'membershipExpiry');
  
  if (!hasStatus) {
    db.exec(`ALTER TABLE companies ADD COLUMN membershipStatus TEXT DEFAULT 'inactive'`);
    console.log('   ✅ تمت إضافة حقل membershipStatus');
  } else {
    console.log('   ⚠️  حقل membershipStatus موجود بالفعل');
  }
  
  if (!hasExpiry) {
    db.exec(`ALTER TABLE companies ADD COLUMN membershipExpiry TEXT`);
    console.log('   ✅ تمت إضافة حقل membershipExpiry');
  } else {
    console.log('   ⚠️  حقل membershipExpiry موجود بالفعل');
  }

  // Step 2: Create membership history table
  console.log('\n2️⃣ إنشاء جدول سجل العضوية...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_memberships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      companyId INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      paymentDate TEXT NOT NULL,
      paymentAmount REAL DEFAULT 0,
      notificationSent INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);
  console.log('   ✅ تم إنشاء جدول company_memberships');

  // Step 3: Initialize existing companies with trial membership
  console.log('\n3️⃣ تفعيل عضوية تجريبية للشركات الموجودة...');
  
  const companies = db.prepare(`
    SELECT id FROM companies 
    WHERE status = 'approved' 
    AND (membershipStatus IS NULL OR membershipStatus = 'inactive')
  `).all();

  if (companies.length > 0) {
    const now = new Date();
    const expiry = new Date(now);
    expiry.setDate(expiry.getDate() + 30); // 30 days trial

    const updateStmt = db.prepare(`
      UPDATE companies 
      SET membershipStatus = 'active', 
          membershipExpiry = ? 
      WHERE id = ?
    `);

    const insertStmt = db.prepare(`
      INSERT INTO company_memberships (companyId, status, startDate, endDate, paymentDate, paymentAmount)
      VALUES (?, 'active', ?, ?, ?, 0)
    `);

    for (const company of companies) {
      updateStmt.run(expiry.toISOString(), company.id);
      insertStmt.run(
        company.id,
        now.toISOString(),
        expiry.toISOString(),
        now.toISOString()
      );
    }

    console.log(`   ✅ تم تفعيل ${companies.length} شركة بعضوية تجريبية لمدة 30 يوماً`);
  } else {
    console.log('   ℹ️  لا توجد شركات تحتاج تفعيل');
  }

  // Step 4: Show current memberships
  console.log('\n4️⃣ عرض حالة العضويات الحالية:');
  const memberships = db.prepare(`
    SELECT 
      c.id,
      c.firstName as companyName,
      c.membershipStatus,
      c.membershipExpiry,
      CAST((julianday(c.membershipExpiry) - julianday('now')) AS INTEGER) as daysLeft
    FROM companies c
    WHERE c.status = 'approved'
    ORDER BY c.membershipExpiry ASC
    LIMIT 10
  `).all();

  if (memberships.length > 0) {
    console.log('\n┌─────────────────────────────────────────────────────────────────┐');
    memberships.forEach(m => {
      const status = m.membershipStatus === 'active' ? '🟢 نشط' : '🔴 غير نشط';
      const expiry = m.membershipExpiry ? new Date(m.membershipExpiry).toLocaleDateString('ar-EG') : 'غير محدد';
      const days = m.daysLeft >= 0 ? `${m.daysLeft} يوم متبقي` : `منتهي منذ ${Math.abs(m.daysLeft)} يوم`;
      console.log(`│ ID: ${m.id} | ${m.companyName.padEnd(20)} | ${status.padEnd(8)} | ${expiry.padEnd(15)} | ${days.padEnd(20)} │`);
    });
    console.log('└─────────────────────────────────────────────────────────────────┘\n');
  }

  // Step 5: Create indexes for performance
  console.log('5️⃣ إنشاء فهارس للأداء...');
  db.exec(`CREATE INDEX IF NOT EXISTS idx_companies_membership ON companies(membershipStatus, membershipExpiry)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_memberships_company ON company_memberships(companyId, status)`);
  console.log('   ✅ تم إنشاء الفهارس');

  console.log('\n✅ تم إنشاء نظام العضوية بنجاح!\n');
  console.log('📊 الإحصائيات:');
  
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN membershipStatus = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN membershipStatus = 'inactive' THEN 1 ELSE 0 END) as inactive
    FROM companies 
    WHERE status = 'approved'
  `).get();
  
  console.log(`   - إجمالي الشركات: ${stats.total}`);
  console.log(`   - عضوية نشطة: ${stats.active}`);
  console.log(`   - عضوية غير نشطة: ${stats.inactive}`);

} catch (error) {
  console.error('\n❌ خطأ:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  db.close();
}
