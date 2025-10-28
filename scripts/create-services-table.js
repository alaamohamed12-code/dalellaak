const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'companies.db');
const db = new Database(dbPath);

try {
  // Create services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      icon TEXT,
      description_ar TEXT,
      description_en TEXT,
      gradient TEXT DEFAULT 'from-blue-500 to-purple-500',
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subservices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_key TEXT NOT NULL,
      key TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      icon TEXT,
      description_ar TEXT,
      description_en TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (service_key) REFERENCES services(key) ON DELETE CASCADE,
      UNIQUE(service_key, key)
    );

    CREATE INDEX IF NOT EXISTS idx_services_key ON services(key);
    CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
    CREATE INDEX IF NOT EXISTS idx_subservices_service_key ON subservices(service_key);
    CREATE INDEX IF NOT EXISTS idx_subservices_active ON subservices(is_active);
  `);

  console.log('✅ Services tables created successfully!');

  // Insert default services data
  const defaultServices = [
    {
      key: 'engineering-consulting',
      title_ar: 'استشارات هندسية',
      title_en: 'Engineering Consulting',
      icon: '🏛️',
      description_ar: 'خدمات الاستشارات الهندسية المتخصصة',
      description_en: 'Specialized engineering consulting services',
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      display_order: 1
    },
    {
      key: 'contracting',
      title_ar: 'مقاولات',
      title_en: 'Contracting',
      icon: '🏗️',
      description_ar: 'خدمات المقاولات العامة والتنفيذ',
      description_en: 'General contracting and execution services',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      display_order: 2
    },
    {
      key: 'building-materials',
      title_ar: 'مواد البناء',
      title_en: 'Building Materials',
      icon: '🧱',
      description_ar: 'توريد وتوزيع مواد البناء',
      description_en: 'Building materials supply and distribution',
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      display_order: 3
    },
    {
      key: 'decoration-furnishing',
      title_ar: 'الديكور والتأثيث',
      title_en: 'Decoration & Furnishing',
      icon: '✨',
      description_ar: 'خدمات الديكور والتأثيث الداخلي',
      description_en: 'Interior decoration and furnishing services',
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      display_order: 4
    },
    {
      key: 'finishing',
      title_ar: 'تشطيبات',
      title_en: 'Finishing',
      icon: '🎨',
      description_ar: 'أعمال التشطيبات النهائية',
      description_en: 'Final finishing works',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      display_order: 5
    },
    {
      key: 'electrical',
      title_ar: 'أعمال كهرباء',
      title_en: 'Electrical Works',
      icon: '⚡',
      description_ar: 'الأعمال والتركيبات الكهربائية',
      description_en: 'Electrical works and installations',
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      display_order: 6
    },
    {
      key: 'plumbing',
      title_ar: 'أعمال سباكة',
      title_en: 'Plumbing Works',
      icon: '🚰',
      description_ar: 'أعمال السباكة والصرف الصحي',
      description_en: 'Plumbing and sanitary works',
      gradient: 'from-blue-600 via-cyan-600 to-teal-600',
      display_order: 7
    },
    {
      key: 'carpentry',
      title_ar: 'نجارة',
      title_en: 'Carpentry',
      icon: '🪚',
      description_ar: 'أعمال النجارة والخشب',
      description_en: 'Carpentry and woodwork',
      gradient: 'from-amber-600 via-orange-600 to-red-600',
      display_order: 8
    },
    {
      key: 'blacksmithing',
      title_ar: 'حدادة',
      title_en: 'Blacksmithing',
      icon: '🔨',
      description_ar: 'أعمال الحدادة والمعادن',
      description_en: 'Blacksmithing and metalwork',
      gradient: 'from-gray-700 via-gray-800 to-gray-900',
      display_order: 9
    },
    {
      key: 'painting',
      title_ar: 'دهانات',
      title_en: 'Painting',
      icon: '🖌️',
      description_ar: 'أعمال الدهانات والطلاء',
      description_en: 'Painting and coating works',
      gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
      display_order: 10
    },
    {
      key: 'other',
      title_ar: 'أخرى',
      title_en: 'Other',
      icon: '📋',
      description_ar: 'خدمات أخرى متنوعة',
      description_en: 'Other various services',
      gradient: 'from-gray-500 via-gray-600 to-gray-700',
      display_order: 11
    }
  ];

  const insertService = db.prepare(`
    INSERT INTO services (key, title_ar, title_en, icon, description_ar, description_en, gradient, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const service of defaultServices) {
    try {
      insertService.run(
        service.key,
        service.title_ar,
        service.title_en,
        service.icon,
        service.description_ar,
        service.description_en,
        service.gradient,
        service.display_order
      );
    } catch (err) {
      // Service already exists, skip
    }
  }

  console.log('✅ Default services inserted!');

  // Insert default subservices
  const defaultSubservices = [
    // Engineering Consulting
    { service_key: 'engineering-consulting', key: 'architectural-design', title_ar: 'تصميم معماري', title_en: 'Architectural Design', icon: '🏛️', description_ar: 'تصميم المباني والمنشآت المعمارية', description_en: 'Building and architectural structure design', display_order: 1 },
    { service_key: 'engineering-consulting', key: 'structural-design', title_ar: 'تصميم إنشائي', title_en: 'Structural Design', icon: '🏗️', description_ar: 'التصميم الإنشائي والهيكلي للمباني', description_en: 'Structural and framework design for buildings', display_order: 2 },
    { service_key: 'engineering-consulting', key: 'electrical', title_ar: 'كهرباء', title_en: 'Electrical', icon: '⚡', description_ar: 'التصميمات الكهربائية والأنظمة الكهربائية', description_en: 'Electrical designs and electrical systems', display_order: 3 },
    { service_key: 'engineering-consulting', key: 'mechanical', title_ar: 'ميكانيكا', title_en: 'Mechanical', icon: '⚙️', description_ar: 'الأنظمة الميكانيكية والتكييف', description_en: 'Mechanical systems and HVAC', display_order: 4 },
    { service_key: 'engineering-consulting', key: 'project-management', title_ar: 'إدارة مشاريع', title_en: 'Project Management', icon: '📊', description_ar: 'إدارة وتنسيق المشاريع الهندسية', description_en: 'Engineering project management and coordination', display_order: 5 },
    { service_key: 'engineering-consulting', key: 'valuation', title_ar: 'تقييم', title_en: 'Valuation', icon: '💰', description_ar: 'تقييم العقارات والمشاريع', description_en: 'Real estate and project valuation', display_order: 6 },
    
    // Contracting
    { service_key: 'contracting', key: 'building-construction', title_ar: 'بناء مباني', title_en: 'Building Construction', icon: '🏢', description_ar: 'إنشاء وبناء المباني السكنية والتجارية', description_en: 'Residential and commercial building construction', display_order: 1 },
    { service_key: 'contracting', key: 'structures', title_ar: 'هياكل', title_en: 'Structures', icon: '🌉', description_ar: 'بناء الهياكل والمنشآت الضخمة', description_en: 'Large structures and infrastructure construction', display_order: 2 },
    { service_key: 'contracting', key: 'restoration', title_ar: 'أعمال ترميم', title_en: 'Restoration', icon: '🔨', description_ar: 'ترميم وصيانة المباني القديمة', description_en: 'Old building restoration and maintenance', display_order: 3 },
    { service_key: 'contracting', key: 'site-management', title_ar: 'إدارة موقع', title_en: 'Site Management', icon: '👷', description_ar: 'إدارة المواقع والإشراف على التنفيذ', description_en: 'Site management and execution supervision', display_order: 4 },
    { service_key: 'contracting', key: 'finishing', title_ar: 'تشطيب', title_en: 'Finishing', icon: '✨', description_ar: 'أعمال التشطيب النهائية للمباني', description_en: 'Final building finishing works', display_order: 5 },
    { service_key: 'contracting', key: 'maintenance-services', title_ar: 'خدمات الصيانة', title_en: 'Maintenance Services', icon: '🔧', description_ar: 'خدمات الصيانة الدورية والطارئة', description_en: 'Regular and emergency maintenance services', display_order: 6 },
    
    // Building Materials
    { service_key: 'building-materials', key: 'cement', title_ar: 'أسمنت', title_en: 'Cement', icon: '🏗️', description_ar: 'توريد الأسمنت ومواد البناء الأساسية', description_en: 'Cement and basic building materials supply', display_order: 1 },
    { service_key: 'building-materials', key: 'steel', title_ar: 'حديد', title_en: 'Steel', icon: '🔩', description_ar: 'حديد التسليح ومواد البناء المعدنية', description_en: 'Reinforcement steel and metal building materials', display_order: 2 },
    { service_key: 'building-materials', key: 'insulation', title_ar: 'عزل', title_en: 'Insulation', icon: '🛡️', description_ar: 'مواد العزل الحراري والمائي', description_en: 'Thermal and water insulation materials', display_order: 3 },
    { service_key: 'building-materials', key: 'marble', title_ar: 'رخام', title_en: 'Marble', icon: '💎', description_ar: 'الرخام والجرانيت والأحجار الطبيعية', description_en: 'Marble, granite, and natural stones', display_order: 4 },
    { service_key: 'building-materials', key: 'paints', title_ar: 'دهانات', title_en: 'Paints', icon: '🎨', description_ar: 'الدهانات ومواد التشطيب', description_en: 'Paints and finishing materials', display_order: 5 },
    { service_key: 'building-materials', key: 'timber', title_ar: 'خشب', title_en: 'Timber', icon: '🪵', description_ar: 'الأخشاب والمواد الخشبية', description_en: 'Timber and wooden materials', display_order: 6 },
    
    // Decoration & Furnishing
    { service_key: 'decoration-furnishing', key: 'interior-design', title_ar: 'تصميم داخلي', title_en: 'Interior Design', icon: '🎨', description_ar: 'تصميم الديكور الداخلي والتنسيق', description_en: 'Interior decoration design and coordination', display_order: 1 },
    { service_key: 'decoration-furnishing', key: 'furniture', title_ar: 'أثاث', title_en: 'Furniture', icon: '🛋️', description_ar: 'الأثاث المنزلي والمكتبي', description_en: 'Home and office furniture', display_order: 2 },
    { service_key: 'decoration-furnishing', key: 'lighting', title_ar: 'إضاءة', title_en: 'Lighting', icon: '💡', description_ar: 'أنظمة الإضاءة والإنارة الحديثة', description_en: 'Modern lighting and illumination systems', display_order: 3 },
    { service_key: 'decoration-furnishing', key: 'windows', title_ar: 'نوافذ', title_en: 'Windows', icon: '🪟', description_ar: 'النوافذ والأبواب الحديثة', description_en: 'Modern windows and doors', display_order: 4 },
    { service_key: 'decoration-furnishing', key: 'fabrics', title_ar: 'أقمشة', title_en: 'Fabrics', icon: '🧵', description_ar: 'الستائر والأقمشة المنزلية', description_en: 'Curtains and home fabrics', display_order: 5 },
    { service_key: 'decoration-furnishing', key: 'details', title_ar: 'تفاصيل', title_en: 'Details', icon: '✨', description_ar: 'التفاصيل الديكورية والإكسسوارات', description_en: 'Decorative details and accessories', display_order: 6 }
  ];

  const insertSubservice = db.prepare(`
    INSERT INTO subservices (service_key, key, title_ar, title_en, icon, description_ar, description_en, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const sub of defaultSubservices) {
    try {
      insertSubservice.run(
        sub.service_key,
        sub.key,
        sub.title_ar,
        sub.title_en,
        sub.icon,
        sub.description_ar,
        sub.description_en,
        sub.display_order
      );
    } catch (err) {
      // Subservice already exists, skip
    }
  }

  console.log('✅ Default subservices inserted!');
  console.log('✅ Services database setup complete!');

} catch (error) {
  console.error('❌ Error creating services tables:', error);
  process.exit(1);
} finally {
  db.close();
}
