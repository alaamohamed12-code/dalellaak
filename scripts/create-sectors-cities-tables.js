const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

// Create sectors table
db.exec(`
  CREATE TABLE IF NOT EXISTS sectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nameAr TEXT NOT NULL UNIQUE,
    nameEn TEXT NOT NULL UNIQUE,
    isVisible INTEGER DEFAULT 1,
    sortOrder INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  )
`);

// Create cities table
db.exec(`
  CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nameAr TEXT NOT NULL UNIQUE,
    nameEn TEXT NOT NULL UNIQUE,
    isVisible INTEGER DEFAULT 1,
    sortOrder INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  )
`);

console.log('✅ Tables created successfully!');

// Insert initial sectors data
const sectors = [
  { ar: 'استشارات هندسية', en: 'Engineering Consulting' },
  { ar: 'مقاولات', en: 'Contracting' },
  { ar: 'مواد بناء', en: 'Building Materials' },
  { ar: 'تشطيبات', en: 'Finishing' },
  { ar: 'أعمال كهرباء', en: 'Electrical Works' },
  { ar: 'أعمال سباكة', en: 'Plumbing Works' },
  { ar: 'نجارة', en: 'Carpentry' },
  { ar: 'حدادة', en: 'Blacksmithing' },
  { ar: 'دهانات', en: 'Painting' },
  { ar: 'أخرى', en: 'Other' }
];

const insertSector = db.prepare(`
  INSERT OR IGNORE INTO sectors (nameAr, nameEn, sortOrder)
  VALUES (?, ?, ?)
`);

sectors.forEach((sector, index) => {
  insertSector.run(sector.ar, sector.en, index + 1);
});

console.log('✅ Initial sectors inserted!');

// Insert initial cities data
const cities = [
  { ar: 'الرياض', en: 'Riyadh' },
  { ar: 'جدة', en: 'Jeddah' },
  { ar: 'مكة المكرمة', en: 'Mecca' },
  { ar: 'المدينة المنورة', en: 'Medina' },
  { ar: 'الدمام', en: 'Dammam' },
  { ar: 'الخبر', en: 'Khobar' },
  { ar: 'الطائف', en: 'Taif' },
  { ar: 'بريدة', en: 'Buraidah' },
  { ar: 'تبوك', en: 'Tabuk' },
  { ar: 'حائل', en: 'Hail' },
  { ar: 'أبها', en: 'Abha' },
  { ar: 'خميس مشيط', en: 'Khamis Mushait' },
  { ar: 'جازان', en: 'Jazan' },
  { ar: 'نجران', en: 'Najran' },
  { ar: 'الجبيل', en: 'Jubail' },
  { ar: 'ينبع', en: 'Yanbu' },
  { ar: 'القطيف', en: 'Qatif' },
  { ar: 'الظهران', en: 'Dhahran' },
  { ar: 'الخرج', en: 'Al Kharj' },
  { ar: 'الباحة', en: 'Al Bahah' }
];

const insertCity = db.prepare(`
  INSERT OR IGNORE INTO cities (nameAr, nameEn, sortOrder)
  VALUES (?, ?, ?)
`);

cities.forEach((city, index) => {
  insertCity.run(city.ar, city.en, index + 1);
});

console.log('✅ Initial cities inserted!');
console.log('✅ Setup complete!');

db.close();
