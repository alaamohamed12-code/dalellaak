/* 
 * اختبار سريع لزر لوحة الشركة على الموبايل
 * Quick Test for Company Dashboard Mobile Button
 * 
 * استخدم هذا الكود في Console للتحقق من الزر
 * Use this code in Console to verify the button
 */

// 1. التحقق من وجود المستخدم والنوع
// Check if user exists and type
const user = JSON.parse(localStorage.getItem('user') || 'null');
console.log('👤 User:', user);
console.log('🏢 Is Company?', user?.accountType === 'company');

// 2. التحقق من وجود شريط التنقل السفلي
// Check if mobile navigation exists
const mobileNav = document.querySelector('nav.md\\:hidden.fixed.bottom-0');
console.log('📱 Mobile Nav Found:', !!mobileNav);

if (mobileNav) {
  // 3. عد الأزرار في الشريط
  // Count buttons in navigation
  const buttons = mobileNav.querySelectorAll('button');
  console.log('🔢 Number of buttons:', buttons.length);
  
  // 4. البحث عن زر لوحة الشركة
  // Find company dashboard button
  const dashboardButton = Array.from(buttons).find(btn => {
    const text = btn.textContent || '';
    return text.includes('لوحتي') || text.includes('Dashboard');
  });
  
  console.log('🏢 Dashboard Button Found:', !!dashboardButton);
  
  if (dashboardButton) {
    console.log('✅ Dashboard button is present!');
    console.log('📍 Button text:', dashboardButton.textContent?.trim());
    
    // 5. التحقق من اللون والأيقونة
    // Check color and icon
    const svg = dashboardButton.querySelector('svg');
    const hasBuildingIcon = svg?.querySelector('path[fill-rule="evenodd"]');
    console.log('🎨 Has yellow icon:', svg?.classList.contains('text-yellow-600'));
    console.log('🏢 Has building icon:', !!hasBuildingIcon);
    
    // 6. التحقق من الوجهة
    // Check destination
    const onClick = dashboardButton.getAttribute('onclick') || dashboardButton.outerHTML;
    const hasCorrectDestination = onClick.includes('/company-dashboard/profile');
    console.log('🎯 Correct destination:', hasCorrectDestination);
    
  } else {
    console.warn('⚠️ Dashboard button NOT found!');
    console.log('Current buttons:', Array.from(buttons).map(b => b.textContent?.trim()));
  }
  
  // 7. التحقق من عدد الأعمدة
  // Check grid columns
  const grid = mobileNav.querySelector('div[class*="grid"]');
  const gridCols = grid?.className.match(/grid-cols-(\d+)/)?.[1];
  console.log('📊 Grid columns:', gridCols);
  
  const expectedCols = !user ? '3' : (user.accountType === 'company' ? '6' : '5');
  console.log('✅ Expected columns:', expectedCols);
  console.log('✅ Columns match:', gridCols === expectedCols);
  
} else {
  console.warn('⚠️ Mobile navigation not found! Are you on mobile view?');
  console.log('💡 Tip: Open DevTools (F12) > Toggle device toolbar (Ctrl+Shift+M)');
}

// 8. التحقق من الشاشة
// Check screen size
console.log('📏 Window width:', window.innerWidth, 'px');
console.log('📱 Is mobile size?', window.innerWidth < 768);

// 9. ملخص النتائج
// Results summary
console.log('\n📋 SUMMARY / الملخص:');
console.log('====================');
console.log('User logged in:', !!user);
console.log('User is company:', user?.accountType === 'company');
console.log('Mobile nav exists:', !!mobileNav);
console.log('Dashboard button:', !!mobileNav?.querySelector('button:has(svg.text-yellow-600)'));
console.log('Screen is mobile:', window.innerWidth < 768);
console.log('====================');

if (user?.accountType === 'company' && mobileNav && window.innerWidth < 768) {
  console.log('✅ All conditions met! Button should be visible.');
} else {
  console.log('ℹ️ Some conditions not met:');
  if (!user) console.log('  - Not logged in');
  if (user && user.accountType !== 'company') console.log('  - Not a company user');
  if (!mobileNav) console.log('  - Mobile nav not rendered (check screen size)');
  if (window.innerWidth >= 768) console.log('  - Screen too wide (need < 768px)');
}

// 10. اختبار تلقائي (اختياري)
// Auto test (optional)
function autoTest() {
  console.log('\n🤖 Starting automatic test...');
  
  // محاكاة تسجيل دخول شركة
  // Simulate company login
  localStorage.setItem('user', JSON.stringify({
    id: 999,
    username: 'test_company',
    accountType: 'company',
    email: 'test@company.com'
  }));
  
  console.log('✅ Simulated company login');
  console.log('🔄 Please refresh the page to see the button');
  console.log('💡 Or manually reload: location.reload()');
}

// لتشغيل الاختبار التلقائي، قم بإلغاء التعليق على السطر التالي:
// To run auto test, uncomment the line below:
// autoTest();

export {};
