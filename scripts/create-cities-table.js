const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'companies.db');
const db = new Database(dbPath);

try {
  // Create cities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(name_ar),
      UNIQUE(name_en)
    );

    CREATE INDEX IF NOT EXISTS idx_cities_active ON cities(is_active);
    CREATE INDEX IF NOT EXISTS idx_cities_order ON cities(display_order);
  `);

  console.log('✅ Cities table created successfully!');

  // Insert default Saudi cities
  const defaultCities = [
    { name_ar: 'الرياض', name_en: 'Riyadh', display_order: 1 },
    { name_ar: 'جدة', name_en: 'Jeddah', display_order: 2 },
    { name_ar: 'مكة المكرمة', name_en: 'Mecca', display_order: 3 },
    { name_ar: 'المدينة المنورة', name_en: 'Medina', display_order: 4 },
    { name_ar: 'الدمام', name_en: 'Dammam', display_order: 5 },
    { name_ar: 'الخبر', name_en: 'Khobar', display_order: 6 },
    { name_ar: 'الطائف', name_en: 'Taif', display_order: 7 },
    { name_ar: 'بريدة', name_en: 'Buraidah', display_order: 8 },
    { name_ar: 'تبوك', name_en: 'Tabuk', display_order: 9 },
    { name_ar: 'حائل', name_en: 'Hail', display_order: 10 },
    { name_ar: 'أبها', name_en: 'Abha', display_order: 11 },
    { name_ar: 'نجران', name_en: 'Najran', display_order: 12 },
    { name_ar: 'جازان', name_en: 'Jazan', display_order: 13 },
    { name_ar: 'الباحة', name_en: 'Al Bahah', display_order: 14 },
  ];

  const insertCity = db.prepare(`
    INSERT OR IGNORE INTO cities (name_ar, name_en, display_order)
    VALUES (?, ?, ?)
  `);

  for (const city of defaultCities) {
    insertCity.run(city.name_ar, city.name_en, city.display_order);
  }

  console.log('✅ Default cities inserted!');
  console.log('✅ Cities database setup complete!');

} catch (error) {
  console.error('❌ Error creating cities table:', error);
  process.exit(1);
} finally {
  db.close();
}
