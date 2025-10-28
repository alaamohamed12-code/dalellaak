const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');

function addUpdatedAtColumn() {
  const db = new Database(dbPath);
  
  try {
    // Check if updatedAt column exists in sectors table
    const sectorsInfo = db.pragma('table_info(sectors)');
    const hasUpdatedAt = sectorsInfo.some(col => col.name === 'updatedAt');
    
    if (!hasUpdatedAt) {
      console.log('Adding updatedAt column to sectors table...');
      db.exec(`
        ALTER TABLE sectors 
        ADD COLUMN updatedAt TEXT DEFAULT (datetime('now'))
      `);
      console.log('✅ Successfully added updatedAt column to sectors table');
    } else {
      console.log('✅ updatedAt column already exists in sectors table');
    }
    
    // Check cities table
    const citiesInfo = db.pragma('table_info(cities)');
    const citiesHasUpdatedAt = citiesInfo.some(col => col.name === 'updatedAt');
    
    if (!citiesHasUpdatedAt) {
      console.log('Adding updatedAt column to cities table...');
      db.exec(`
        ALTER TABLE cities 
        ADD COLUMN updatedAt TEXT DEFAULT (datetime('now'))
      `);
      console.log('✅ Successfully added updatedAt column to cities table');
    } else {
      console.log('✅ updatedAt column already exists in cities table');
    }
    
    console.log('\n✨ Database schema check completed!');
    
  } catch (error) {
    console.error('❌ Error updating database schema:', error.message);
  } finally {
    db.close();
  }
}

addUpdatedAtColumn();
