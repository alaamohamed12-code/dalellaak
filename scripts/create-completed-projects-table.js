const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'companies.db');
const db = new Database(dbPath);

console.log('📦 إنشاء جدول الأعمال المنتهية...');

try {
  // Create completed_projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS completed_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      companyId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT,
      completedDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ تم إنشاء جدول completed_projects بنجاح!');

  // Check for existing companies
  const companies = db.prepare('SELECT id FROM companies LIMIT 1').all();
  
  if (companies.length === 0) {
    console.log('⚠️  لا توجد شركات في قاعدة البيانات. لن يتم إضافة بيانات تجريبية.');
    db.close();
    process.exit(0);
  }

  const firstCompanyId = companies[0].id;
  console.log('📌 استخدام شركة ID:', firstCompanyId);

  // Add some sample data for testing
  const sampleProjects = [
    {
      companyId: firstCompanyId,
      title: 'مشروع فيلا سكنية فاخرة',
      description: 'تصميم وتنفيذ فيلا سكنية بمساحة 500 متر مربع بجميع التشطيبات الفاخرة والحدائق والمسابح',
      image: null,
      completedDate: '2024-12-15'
    },
    {
      companyId: firstCompanyId,
      title: 'مجمع تجاري',
      description: 'بناء مجمع تجاري متعدد الطوابق في وسط المدينة بمساحة 2000 متر مربع',
      image: null,
      completedDate: '2024-11-20'
    },
    {
      companyId: firstCompanyId,
      title: 'ترميم مبنى تاريخي',
      description: 'ترميم وإعادة تأهيل مبنى تاريخي عمره 100 عام مع الحفاظ على الطابع المعماري الأصلي',
      image: null,
      completedDate: '2024-10-05'
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO completed_projects (companyId, title, description, image, completedDate)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const project of sampleProjects) {
    insertStmt.run(
      project.companyId,
      project.title,
      project.description,
      project.image,
      project.completedDate
    );
  }

  console.log('✅ تم إضافة بيانات تجريبية للأعمال المنتهية!');
  console.log('📊 عدد المشاريع المضافة:', sampleProjects.length);

  // Show the created projects
  const projects = db.prepare('SELECT * FROM completed_projects').all();
  console.log('\n📋 الأعمال المنتهية المضافة:');
  console.table(projects);

} catch (error) {
  console.error('❌ خطأ:', error.message);
  process.exit(1);
} finally {
  db.close();
}
