const Database = require('better-sqlite3');

// عرض جميع المستخدمين
const usersDb = new Database('users.db');
const users = usersDb.prepare('SELECT * FROM users').all();
console.log('Users:', users);

// عرض جميع الشركات
const companiesDb = new Database('companies.db');
const companies = companiesDb.prepare('SELECT * FROM companies').all();
console.log('Companies:', companies);

// عرض جميع إشعارات المستخدمين
const notificationsDb = new Database('notifications.db');
const userNotifications = notificationsDb.prepare('SELECT * FROM user_notifications').all();
console.log('User Notifications:', userNotifications);

usersDb.close();
companiesDb.close();
notificationsDb.close();