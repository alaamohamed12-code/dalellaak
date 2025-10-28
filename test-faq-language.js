#!/usr/bin/env node

/**
 * 🧪 FAQ Language Test Script
 * 
 * This script tests the FAQ API directly to verify language switching works
 * 
 * Usage: node test-faq-language.js
 */

const http = require('http');

console.log('🧪 Testing FAQ Language Switch...\n');

// Test 1: Fetch Arabic FAQs
console.log('📋 Test 1: Fetching Arabic FAQs');
console.log('URL: http://localhost:3000/api/faq?activeOnly=true&lang=ar\n');

const testArabic = new Promise((resolve) => {
  http.get('http://localhost:3000/api/faq?activeOnly=true&lang=ar', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const faqs = JSON.parse(data);
        console.log('✅ Arabic Test Results:');
        console.log(`   Total FAQs: ${faqs.length}`);
        if (faqs.length > 0) {
          console.log(`   First Question: "${faqs[0].question}"`);
          console.log(`   First Answer Preview: "${faqs[0].answer.substring(0, 50)}..."\n`);
        }
        resolve(faqs);
      } catch (e) {
        console.error('❌ Error parsing Arabic response:', e.message);
        resolve(null);
      }
    });
  }).on('error', (e) => {
    console.error('❌ Network error (Arabic):', e.message);
    resolve(null);
  });
});

// Test 2: Fetch English FAQs
console.log('📋 Test 2: Fetching English FAQs');
console.log('URL: http://localhost:3000/api/faq?activeOnly=true&lang=en\n');

const testEnglish = new Promise((resolve) => {
  setTimeout(() => {
    http.get('http://localhost:3000/api/faq?activeOnly=true&lang=en', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const faqs = JSON.parse(data);
          console.log('✅ English Test Results:');
          console.log(`   Total FAQs: ${faqs.length}`);
          if (faqs.length > 0) {
            console.log(`   First Question: "${faqs[0].question}"`);
            console.log(`   First Answer Preview: "${faqs[0].answer.substring(0, 50)}..."\n`);
          }
          resolve(faqs);
        } catch (e) {
          console.error('❌ Error parsing English response:', e.message);
          resolve(null);
        }
      });
    }).on('error', (e) => {
      console.error('❌ Network error (English):', e.message);
      resolve(null);
    });
  }, 1000); // Wait 1 second between requests
});

// Run tests
Promise.all([testArabic, testEnglish]).then(([arFaqs, enFaqs]) => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS:');
  console.log('='.repeat(60) + '\n');

  if (!arFaqs || !enFaqs) {
    console.log('❌ TEST FAILED: Could not fetch data');
    console.log('   Make sure the dev server is running (npm run dev)');
    process.exit(1);
  }

  if (arFaqs.length === 0 || enFaqs.length === 0) {
    console.log('⚠️  WARNING: No FAQs returned');
    console.log('   Check database: site-settings.db');
    process.exit(1);
  }

  // Compare questions
  const arFirst = arFaqs[0].question;
  const enFirst = enFaqs[0].question;

  console.log('🔍 Language Comparison:');
  console.log(`   Arabic:  "${arFirst}"`);
  console.log(`   English: "${enFirst}"`);
  console.log('');

  if (arFirst === enFirst) {
    console.log('❌ TEST FAILED: Questions are identical!');
    console.log('   This means language switching is NOT working');
    console.log('   Expected different text for AR vs EN');
    console.log('');
    console.log('🔧 Possible Issues:');
    console.log('   1. API not reading lang parameter correctly');
    console.log('   2. Database columns (questionEn/questionAr) not set up');
    console.log('   3. Frontend not sending lang parameter');
    process.exit(1);
  } else {
    console.log('✅ TEST PASSED: Language switching works!');
    console.log('   Arabic and English versions are different');
    console.log('   API is correctly selecting language columns');
    console.log('');
    console.log('💡 If the problem persists in browser:');
    console.log('   1. Clear browser cache (Ctrl+Shift+R)');
    console.log('   2. Check Console for errors (F12)');
    console.log('   3. Verify useLang() hook in frontend');
    process.exit(0);
  }
});
