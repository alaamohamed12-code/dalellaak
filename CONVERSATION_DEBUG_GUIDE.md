# 🔍 دليل تشخيص مشكلة عدم ظهور المحادثة

## 📋 خطوات التشخيص

### 1. افتح Developer Console (F12)

عند إرسال رسالة وفتح صفحة `/messages`، يجب أن ترى في Console:

```javascript
// عند إرسال الرسالة من صفحة الشركة:
📤 رسالة الإرسال: {userId: 123, companyId: 5, ...}
user.id: 123 type: number
params.id: 5 type: string

// بعد النجاح:
✅ Message sent successfully
// تأخير 500ms
🔄 Redirecting to: /messages?conv=1&refresh=1730...

// عند فتح صفحة /messages:
🔄 Loading conversations for user: 123 accountType: individual
📍 URL params - targetConvId: 1 refreshParam: 1730...
📥 Received conversations from API: 1
📋 Raw conversations: [{id: 1, userId: 123, companyId: 5, ...}]
  🔍 Fetching details for conversation #1 - companyId=5
    ✅ Got details for conversation #1: company_username
✅ Processed conversations with details: 1
🎯 Looking for target conversation: 1
✅ Selected conversation from URL: 1
```

---

## ❌ إذا رأيت هذه الأخطاء:

### Error 1: `user.id: undefined`
```javascript
user.id: undefined type: undefined
{userId: NaN, ...}
```

**الحل:**
```javascript
// في Console:
localStorage.removeItem('user');
location.reload();
// ثم سجل دخول من جديد
```

---

### Error 2: `Received conversations from API: 0`
```javascript
📥 Received conversations from API: 0
⚠️  No conversations available
```

**السبب:** الرسالة لم تُحفظ في قاعدة البيانات

**التحقق:**
```javascript
// في Console، شغّل:
fetch('/api/conversations?userId=123')
  .then(r => r.json())
  .then(console.log);

// يجب أن يعيد:
{
  conversations: [
    {id: 1, userId: 123, companyId: 5, lastBody: 'hello test', ...}
  ]
}
```

**إذا كان فارغاً:**
- المشكلة في API messages
- تحقق من Database (companies.db)

---

### Error 3: `Target conversation not found!`
```javascript
🎯 Looking for target conversation: 1
⚠️  Target conversation not found! Available IDs: [2, 3]
```

**السبب:** الـ conversation ID في URL لا يطابق الموجود في القاعدة

**الحل:**
```javascript
// في Console:
// 1. تحقق من المحادثات الموجودة
fetch('/api/conversations?userId=123')
  .then(r => r.json())
  .then(data => {
    console.log('All conversation IDs:', data.conversations.map(c => c.id));
  });

// 2. اذهب يدوياً للمحادثة
window.location.href = '/messages?conv=2&refresh=' + Date.now();
```

---

### Error 4: `Failed to fetch details`
```javascript
❌ Failed to fetch details for conversation 1
```

**السبب:** API user-details لا يعمل

**التحقق:**
```javascript
// في Console:
fetch('/api/user-details?companyId=5')
  .then(r => r.json())
  .then(console.log);

// يجب أن يعيد:
{
  company: {
    id: 5,
    username: 'company_name',
    firstName: '...',
    ...
  }
}
```

---

## 🛠️ أدوات التشخيص

### 1. تحقق من localStorage
```javascript
// في Console:
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
console.log('Has ID?', !!user.id);
console.log('Account Type:', user.accountType);
```

### 2. تحقق من Database مباشرة
```bash
# في Terminal:
cd "d:\mahmoud hammad"
node -e "const db = require('./lib/companies-db').default; console.log(db.prepare('SELECT * FROM conversations').all());"
```

### 3. تحقق من الرسائل
```javascript
// في Console:
fetch('/api/messages?conversationId=1')
  .then(r => r.json())
  .then(data => {
    console.log('Messages:', data.messages);
  });
```

### 4. إعادة إرسال رسالة يدوياً
```javascript
// في Console:
fetch('/api/messages', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    userId: 123,
    companyId: 5,
    senderType: 'user',
    senderId: 123,
    text: 'Test message for debugging'
  })
}).then(r => r.json()).then(console.log);
```

---

## ✅ الحل النهائي

إذا جربت كل شيء ولم ينجح:

### خطوة 1: نظف كل شيء
```javascript
// في Console:
localStorage.clear();
location.reload();
```

### خطوة 2: سجل دخول من جديد
```
اذهب لـ /login
سجل دخول بحساب مستخدم فرد
```

### خطوة 3: أرسل رسالة جديدة
```
اذهب لصفحة شركة
اضغط "مراسلة"
اكتب رسالة
اضغط "إرسال"
```

### خطوة 4: راقب Console
```
يجب أن ترى كل الـ console.log المذكورة أعلاه
```

---

## 📊 معلومات إضافية

### كيف يعمل النظام؟

```
1. المستخدم يضغط "إرسال"
   ↓
2. POST /api/messages
   ↓
3. findOrCreateConversation(userId, companyId)
   ↓
4. addMessage(conversationId, ...)
   ↓
5. UPDATE conversations SET updatedAt = ...
   ↓
6. router.push('/messages?conv=X&refresh=timestamp')
   ↓
7. صفحة /messages تحمل:
   - GET /api/conversations?userId=123
   - يجلب المحادثات من DB
   - يبحث عن conversation مع targetConvId
   - يفتحها تلقائياً
```

### نقاط الفشل المحتملة:

1. ❌ `user.id` undefined → localStorage قديم
2. ❌ API messages يرجع 400 → بيانات ناقصة
3. ❌ findOrCreateConversation فشل → DB مقفل
4. ❌ addMessage فشل → خطأ SQL
5. ❌ conversations API فارغ → لم يُحفظ في DB
6. ❌ targetConvId لا يطابق → race condition
7. ❌ user-details API فشل → الشركة/المستخدم غير موجود

---

## 🚨 للمطورين فقط

### فحص Database مباشرة:

```javascript
// في Node.js:
const Database = require('better-sqlite3');
const db = new Database('./companies.db');

// تحقق من المحادثات
console.log('Conversations:', db.prepare('SELECT * FROM conversations').all());

// تحقق من الرسائل
console.log('Messages:', db.prepare('SELECT * FROM messages').all());

// آخر محادثة
console.log('Latest:', db.prepare('SELECT * FROM conversations ORDER BY id DESC LIMIT 1').get());
```

### إعادة إنشاء المحادثة يدوياً:

```sql
-- في SQLite:
INSERT INTO conversations (userId, companyId, createdAt, updatedAt)
VALUES (123, 5, datetime('now'), datetime('now'));

INSERT INTO messages (conversationId, senderType, senderId, body, createdAt)
VALUES (1, 'user', 123, 'Test message', datetime('now'));
```

---

**ملاحظة:** الآن أضفنا console.log مفصل في كل خطوة، لذا راقب Console بعناية!
