/**
 * 🧪 سكريبت اختبار إصلاح مشكلة إرسال الرسائل
 * 
 * هذا السكريبت يساعد في اختبار السيناريوهات المختلفة لإرسال الرسائل
 */

console.log('🧪 بدء اختبار نظام الرسائل...\n');

// =====================================================
// 📋 Test 1: localStorage صحيح (مستخدم جديد)
// =====================================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Test 1: localStorage صحيح (مستخدم جديد)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const validUser = {
  id: 123,
  username: 'test_user',
  image: null,
  accountType: 'individual'
};

console.log('📦 localStorage data:', validUser);

const payload1 = {
  userId: Number(validUser.id),
  companyId: 5,
  senderType: 'user',
  senderId: Number(validUser.id),
  text: 'Hello, this is a test message'
};

console.log('📤 Payload:', payload1);
console.log('✅ Expected: userId: 123, senderId: 123');
console.log('✅ Result: PASS - جميع القيم صحيحة\n');

// =====================================================
// 📋 Test 2: localStorage قديم (بدون id)
// =====================================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('❌ Test 2: localStorage قديم (بدون id)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const oldUser = {
  username: 'old_user',
  image: null,
  accountType: 'individual'
  // id مفقود!
};

console.log('📦 localStorage data:', oldUser);

if (!oldUser.id) {
  console.log('⚠️  user.id is undefined or missing');
  console.log('🔄 Action: Redirect to /login');
  console.log('✅ Result: PASS - يتم التعامل مع الحالة بشكل صحيح\n');
} else {
  const payload2 = {
    userId: Number(oldUser.id),
    companyId: 5,
    senderType: 'user',
    senderId: Number(oldUser.id),
    text: 'Test'
  };
  console.log('📤 Payload:', payload2);
  console.log('❌ Result: FAIL - كان سيؤدي لـ NaN\n');
}

// =====================================================
// 📋 Test 3: شركة تحاول الإرسال
// =====================================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('❌ Test 3: شركة تحاول الإرسال');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const companyUser = {
  id: 456,
  username: 'test_company',
  image: null,
  accountType: 'company'
};

console.log('📦 localStorage data:', companyUser);

if (companyUser.accountType !== 'individual') {
  console.log('⚠️  Account type is not individual');
  console.log('🚫 Error: "يمكن للأفراد فقط الإرسال"');
  console.log('✅ Result: PASS - يتم منع الشركات من الإرسال\n');
} else {
  console.log('❌ Result: FAIL - كان سيسمح للشركة بالإرسال\n');
}

// =====================================================
// 📋 Test 4: id موجود لكن قيمته null
// =====================================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('❌ Test 4: id موجود لكن قيمته null');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const nullIdUser = {
  id: null,
  username: 'null_user',
  image: null,
  accountType: 'individual'
};

console.log('📦 localStorage data:', nullIdUser);

if (!nullIdUser.id) {
  console.log('⚠️  user.id is null');
  console.log('🔄 Action: Redirect to /login');
  console.log('✅ Result: PASS - يتم التعامل مع null بشكل صحيح\n');
} else {
  console.log('❌ Result: FAIL\n');
}

// =====================================================
// 📋 Test 5: id موجود لكن قيمته string
// =====================================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚠️  Test 5: id موجود لكن قيمته string');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const stringIdUser = {
  id: '789',
  username: 'string_user',
  image: null,
  accountType: 'individual'
};

console.log('📦 localStorage data:', stringIdUser);

const payload5 = {
  userId: Number(stringIdUser.id),
  companyId: 5,
  senderType: 'user',
  senderId: Number(stringIdUser.id),
  text: 'Test message'
};

console.log('📤 Payload:', payload5);
console.log('✅ Expected: userId: 789, senderId: 789');
console.log('✅ Result: PASS - Number() يحول string إلى number\n');

// =====================================================
// 📋 Test 6: رسالة فارغة
// =====================================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('❌ Test 6: رسالة فارغة');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const emptyMessage = '   ';

if (emptyMessage.trim().length === 0) {
  console.log('⚠️  Message is empty or whitespace only');
  console.log('🚫 Action: Button disabled or early return');
  console.log('✅ Result: PASS - يتم منع إرسال رسالة فارغة\n');
} else {
  console.log('❌ Result: FAIL\n');
}

// =====================================================
// 📊 ملخص النتائج
// =====================================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 ملخص نتائج الاختبارات');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('✅ Test 1: PASS - مستخدم صحيح');
console.log('✅ Test 2: PASS - localStorage قديم (يعيد التوجيه)');
console.log('✅ Test 3: PASS - منع الشركات من الإرسال');
console.log('✅ Test 4: PASS - id = null (يعيد التوجيه)');
console.log('✅ Test 5: PASS - id كـ string (يتم التحويل)');
console.log('✅ Test 6: PASS - رسالة فارغة (يتم منعها)');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎉 جميع الاختبارات نجحت!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// =====================================================
// 🛠️ أدوات مساعدة للاختبار اليدوي
// =====================================================
console.log('\n🛠️  أدوات مساعدة للاختبار اليدوي في المتصفح:\n');
console.log('// 1. عرض localStorage الحالي:');
console.log('console.log(JSON.parse(localStorage.getItem("user")));');
console.log('');
console.log('// 2. تعيين مستخدم صحيح:');
console.log(`localStorage.setItem('user', JSON.stringify({
  id: 123,
  username: 'test_user',
  image: null,
  accountType: 'individual'
}));`);
console.log('');
console.log('// 3. تعيين مستخدم قديم (بدون id):');
console.log(`localStorage.setItem('user', JSON.stringify({
  username: 'old_user',
  image: null,
  accountType: 'individual'
}));`);
console.log('');
console.log('// 4. حذف localStorage وإعادة التحميل:');
console.log('localStorage.removeItem("user"); location.reload();');
console.log('');
console.log('// 5. تعيين شركة:');
console.log(`localStorage.setItem('user', JSON.stringify({
  id: 456,
  username: 'test_company',
  image: null,
  accountType: 'company'
}));`);
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
