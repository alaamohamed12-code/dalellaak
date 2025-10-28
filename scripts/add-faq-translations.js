const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'site-settings.db');
const db = new Database(dbPath);

console.log('📦 Adding English translations to FAQ table...');

// Add new columns for English translations
try {
  db.exec(`
    ALTER TABLE faq ADD COLUMN questionEn TEXT;
  `);
  console.log('✅ Added questionEn column');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('⚠️ questionEn column already exists');
  } else {
    throw error;
  }
}

try {
  db.exec(`
    ALTER TABLE faq ADD COLUMN answerEn TEXT;
  `);
  console.log('✅ Added answerEn column');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('⚠️ answerEn column already exists');
  } else {
    throw error;
  }
}

// Rename existing columns to indicate Arabic language
try {
  // SQLite doesn't support ALTER COLUMN, so we need to use a workaround
  db.exec(`
    ALTER TABLE faq RENAME COLUMN question TO questionAr;
  `);
  db.exec(`
    ALTER TABLE faq RENAME COLUMN answer TO answerAr;
  `);
  console.log('✅ Renamed columns to questionAr and answerAr');
} catch (error) {
  if (error.message.includes('no such column') || error.message.includes('duplicate column name')) {
    console.log('⚠️ Columns already renamed or do not exist');
  } else {
    console.log('Note: Column rename might need manual handling:', error.message);
  }
}

// Add English translations for existing FAQs
const englishTranslations = [
  {
    id: 1,
    questionEn: 'What is the platform and how does it work?',
    answerEn: 'Our platform is the bridge between you and the best design and construction companies in the Kingdom. We provide you with a comprehensive directory of certified companies with comparison and direct communication capabilities, plus 2% cashback when completing a contract.'
  },
  {
    id: 2,
    questionEn: 'How do I get the cashback?',
    answerEn: 'When completing a contract with one of the certified companies through our platform, you will automatically receive 2% cashback on the contract value. The amount will be transferred to your account within 7 business days of contract confirmation.'
  },
  {
    id: 3,
    questionEn: 'Is the service free for users?',
    answerEn: 'Yes, using the platform is completely free for users. You can browse companies, compare between them, and contact them without any fees. In fact, we give you cashback when completing a contract!'
  },
  {
    id: 4,
    questionEn: 'How are certified companies selected?',
    answerEn: 'We follow strict criteria in selecting certified companies, including: official licenses, previous work record, customer reviews, and commitment to quality standards. We carefully review each company before accepting it on the platform.'
  },
  {
    id: 5,
    questionEn: 'What services are available?',
    answerEn: 'We provide a comprehensive range of services including: architectural design, interior design, construction supervision, general contracting, finishing work, and decoration. All through certified and specialized companies.'
  },
  {
    id: 6,
    questionEn: 'Can I rate companies?',
    answerEn: 'Yes, we encourage all our customers to rate their experience with companies after project completion. Reviews help other users make informed decisions and motivate companies to provide the best service.'
  }
];

const updateStmt = db.prepare(`
  UPDATE faq 
  SET questionEn = ?, answerEn = ?
  WHERE id = ?
`);

englishTranslations.forEach(translation => {
  try {
    updateStmt.run(translation.questionEn, translation.answerEn, translation.id);
    console.log(`✅ Updated FAQ #${translation.id} with English translation`);
  } catch (error) {
    console.log(`⚠️ Could not update FAQ #${translation.id}:`, error.message);
  }
});

console.log('✅ FAQ translations migration completed!');

db.close();
