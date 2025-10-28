const Database = require('better-sqlite3');
const path = require('path');

const companiesDbPath = path.join(process.cwd(), 'companies.db');
const notificationsDbPath = path.join(process.cwd(), 'notifications.db');

console.log('🔔 بدء فحص انتهاء العضويات وإرسال الإشعارات...\n');

try {
  const companiesDb = new Database(companiesDbPath);
  const notificationsDb = new Database(notificationsDbPath);

  const now = new Date();
  
  // الفترات التي نريد إرسال إشعارات عندها (بالأيام)
  const notificationPeriods = [7, 3, 1];

  // احصل على جميع الشركات ذات العضويات النشطة
  const activeCompanies = companiesDb.prepare(`
    SELECT id, firstName as companyName, membershipExpiry, membershipStatus 
    FROM companies 
    WHERE membershipStatus = 'active' 
    AND membershipExpiry IS NOT NULL
  `).all();

  console.log(`📊 عدد الشركات النشطة: ${activeCompanies.length}\n`);

  let sentNotifications = 0;
  let expiredCompanies = 0;

  for (const company of activeCompanies) {
    const expiryDate = new Date(company.membershipExpiry);
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    console.log(`   الشركة: ${company.companyName} (ID: ${company.id})`);
    console.log(`   - الأيام المتبقية: ${daysLeft}`);
    console.log(`   - تاريخ الانتهاء: ${expiryDate.toLocaleDateString('ar-EG')}`);

    // إذا انتهت العضوية، قم بتعطيلها
    if (daysLeft <= 0) {
      companiesDb.prepare(`
        UPDATE companies 
        SET membershipStatus = 'inactive' 
        WHERE id = ?
      `).run(company.id);

      // أرسل إشعار انتهاء العضوية
      const expiryMessage = 'انتهت عضويتك! لن يظهر ملفك الشخصي في نتائج البحث. قم بالتجديد الآن للاستمرار في تلقي الطلبات.';
      
      notificationsDb.prepare(`
        INSERT INTO notifications (userId, message, type, createdAt, isRead)
        VALUES (?, ?, ?, ?, ?)
      `).run(company.id, expiryMessage, 'membership_expired', now.toISOString(), 0);

      console.log(`   ⚠️  تم تعطيل العضوية وإرسال إشعار الانتهاء\n`);
      expiredCompanies++;
      sentNotifications++;
      continue;
    }

    // فحص إذا كانت الشركة تحتاج لإشعار تحذيري
    for (const days of notificationPeriods) {
      if (daysLeft === days) {
        // تحقق من عدم إرسال إشعار سابق لهذه الفترة
        const existingNotification = companiesDb.prepare(`
          SELECT notificationSent FROM company_memberships 
          WHERE companyId = ? 
          AND endDate = ? 
          AND notificationSent >= ?
          ORDER BY id DESC LIMIT 1
        `).get(company.id, company.membershipExpiry, days);

        if (!existingNotification || existingNotification.notificationSent < days) {
          // أرسل الإشعار
          const message = `تنتهي عضويتك خلال ${days} ${days === 1 ? 'يوم' : 'أيام'}! قم بالتجديد للاستمرار في الظهور للعملاء.`;
          
          notificationsDb.prepare(`
            INSERT INTO notifications (userId, message, type, createdAt, isRead)
            VALUES (?, ?, ?, ?, ?)
          `).run(company.id, message, 'membership_warning', now.toISOString(), 0);

          // سجل أنه تم إرسال إشعار لهذه الفترة
          companiesDb.prepare(`
            UPDATE company_memberships 
            SET notificationSent = ? 
            WHERE companyId = ? 
            AND endDate = ?
          `).run(days, company.id, company.membershipExpiry);

          console.log(`   🔔 تم إرسال إشعار تحذيري (${days} ${days === 1 ? 'يوم' : 'أيام'})\n`);
          sentNotifications++;
        } else {
          console.log(`   ✓  تم إرسال الإشعار مسبقاً لهذه الفترة\n`);
        }
        break;
      }
    }

    if (daysLeft > 7) {
      console.log(`   ✓  العضوية نشطة ولا تحتاج لإشعار حالياً\n`);
    }
  }

  companiesDb.close();
  notificationsDb.close();

  console.log('✅ اكتمل فحص العضويات!\n');
  console.log('📈 الإحصائيات:');
  console.log(`   - إجمالي الشركات المفحوصة: ${activeCompanies.length}`);
  console.log(`   - الإشعارات المرسلة: ${sentNotifications}`);
  console.log(`   - العضويات المنتهية: ${expiredCompanies}`);
  console.log(`   - التاريخ: ${now.toLocaleString('ar-EG')}\n`);

} catch (error) {
  console.error('❌ خطأ في فحص العضويات:', error.message);
  process.exit(1);
}
