// Test script for Reviews API
console.log('🧪 اختبار API endpoints للتقييمات...\n');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    // Test 1: GET reviews for company
    console.log('📥 Test 1: جلب تقييمات الشركة (GET /api/reviews?companyId=5)');
    const getResponse = await fetch(`${BASE_URL}/api/reviews?companyId=5`);
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ النتيجة:', {
        عدد_التقييمات: getData.reviews?.length,
        المتوسط: getData.stats?.avgRating,
        إجمالي: getData.stats?.totalReviews,
        توزيع_النجوم: getData.stats?.distribution
      });
      console.log('\n📋 التقييمات:');
      getData.reviews?.forEach((r, i) => {
        console.log(`  ${i+1}. ${r.userFirstName} ${r.userLastName} - ${'⭐'.repeat(r.rating)}`);
        console.log(`     "${r.comment?.substring(0, 60)}..."`);
      });
    } else {
      console.log('❌ فشل:', getData.error);
    }

    // Test 2: POST new review (simulation - would need real user)
    console.log('\n\n📤 Test 2: إضافة تقييم جديد (POST /api/reviews)');
    console.log('⚠️  يتطلب مستخدم حقيقي - سيتم اختبار من الواجهة');
    
    // Test 3: GET reviews with invalid companyId
    console.log('\n\n📥 Test 3: اختبار companyId غير موجود');
    const invalidResponse = await fetch(`${BASE_URL}/api/reviews?companyId=99999`);
    const invalidData = await invalidResponse.json();
    
    if (invalidResponse.ok) {
      console.log('✅ استجابة صحيحة لشركة غير موجودة:', {
        عدد_التقييمات: invalidData.reviews?.length,
        المتوسط: invalidData.stats?.avgRating
      });
    }

    // Test 4: GET without companyId
    console.log('\n\n📥 Test 4: اختبار بدون companyId');
    const noIdResponse = await fetch(`${BASE_URL}/api/reviews`);
    const noIdData = await noIdResponse.json();
    
    if (!noIdResponse.ok) {
      console.log('✅ رفض الطلب بشكل صحيح:', noIdData.error);
    } else {
      console.log('❌ كان يجب رفض الطلب');
    }

    console.log('\n\n✨ انتهى اختبار API!');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    console.log('\n⚠️  تأكد من أن الموقع يعمل على http://localhost:3000');
  }
}

testAPI();
