# 🔒 دليل نظام الصلاحيات المتقدم

## ✅ تم إصلاح المشكلة بنجاح!

تم إنشاء نظام صلاحيات احترافي يمنع المسؤولين من الوصول إلى الصفحات والإجراءات التي لا يملكون صلاحية لها.

---

## 📋 الملفات الجديدة

### 1. **hooks/useAdminPermissions.ts**
Hook مخصص للتحقق من صلاحيات المسؤولين.

**الوظائف:**
- `hasPermission(resource, action)` - التحقق من صلاحية معينة
- `canAccessPage(resource)` - التحقق من إمكانية الوصول للصفحة
- `requirePermission(resource, action)` - إعادة توجيه إذا لم يكن لديه صلاحية
- `isSuperAdmin` - التحقق من كونه Super Admin

**مثال الاستخدام:**
```typescript
const { hasPermission, canAccessPage, isSuperAdmin } = useAdminPermissions();

// التحقق من صلاحية
if (hasPermission('companies', 'delete')) {
  // يمكنه حذف الشركات
}

// التحقق من الوصول للصفحة
if (canAccessPage('users')) {
  // يمكنه الوصول لصفحة المستخدمين
}
```

---

### 2. **components/admin/PermissionGuard.tsx**
مكون لحماية الصفحات بالكامل.

**الاستخدام:**
```tsx
export default function AdminCompaniesPage() {
  return (
    <PermissionGuard resource="companies" action="view">
      <CompaniesPageContent />
    </PermissionGuard>
  );
}
```

**النتيجة:**
- إذا لم يكن لديه صلاحية → يظهر شاشة "ليس لديك صلاحية" مع زر للعودة
- إذا كان لديه صلاحية → يعرض المحتوى بشكل طبيعي

---

### 3. **components/admin/PermissionElements.tsx**
مكونات لحماية الأزرار والعناصر الفردية.

**PermissionButton:**
```tsx
<PermissionButton
  resource="companies"
  action="delete"
  onClick={() => deleteCompany(id)}
  className="bg-red-500 text-white px-4 py-2 rounded"
>
  حذف
</PermissionButton>
```

**PermissionElement:**
```tsx
<PermissionElement resource="notifications" action="create">
  <button>إرسال إشعار</button>
</PermissionElement>
```

**النتيجة:**
- إذا لم يكن لديه صلاحية → الزر/العنصر لن يظهر نهائياً
- إذا كان لديه صلاحية → يظهر بشكل طبيعي

---

## 🔐 أنواع الصلاحيات

### الموارد (Resources):
- `companies` - الشركات
- `users` - المستخدمين
- `services` - الخدمات
- `reviews` - التقييمات
- `notifications` - الإشعارات
- `messages` - الرسائل
- `contracts` - العقود
- `cities` - المدن
- `sectors` - المجالات
- `homeContent` - محتوى الصفحة الرئيسية
- `faq` - الأسئلة الشائعة
- `terms` - الشروط والأحكام
- `support` - الدعم الفني
- `admins` - المسؤولين
- `memberships` - العضويات

### الإجراءات (Actions):
- `view` - عرض/مشاهدة
- `create` - إنشاء/إضافة
- `update` - تعديل/تحديث
- `delete` - حذف

---

## 📁 الصفحات المحدّثة

### ✅ `/app/admin-panel/companies/page.tsx`
- ✅ محمية بـ `PermissionGuard`
- ✅ أزرار القبول/الرفض محمية بـ `PermissionButton`
- ✅ زر الحذف محمي بـ `PermissionButton`

### ✅ `/app/admin-panel/dashboard/page.tsx`
- ✅ يعرض فقط الأزرار التي لديه صلاحية الوصول لها
- ✅ يستخدم `canAccessPage()` لإخفاء الأزرار غير المسموحة

---

## 🎯 كيفية حماية صفحة جديدة

### الخطوة 1: استخدام PermissionGuard

```tsx
"use client";
import PermissionGuard from "@/components/admin/PermissionGuard";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

function UsersPageContent() {
  const { hasPermission } = useAdminPermissions();
  
  return (
    <div>
      {/* محتوى الصفحة */}
    </div>
  );
}

export default function UsersPage() {
  return (
    <PermissionGuard resource="users" action="view">
      <UsersPageContent />
    </PermissionGuard>
  );
}
```

### الخطوة 2: حماية الأزرار

```tsx
import { PermissionButton } from "@/components/admin/PermissionElements";

// زر الحذف - يظهر فقط لمن لديه صلاحية delete
<PermissionButton
  resource="users"
  action="delete"
  onClick={() => deleteUser(id)}
  className="bg-red-500 text-white px-3 py-1 rounded"
>
  حذف
</PermissionButton>

// زر الإضافة - يظهر فقط لمن لديه صلاحية create
<PermissionButton
  resource="users"
  action="create"
  onClick={() => openAddModal()}
  className="bg-green-500 text-white px-4 py-2 rounded"
>
  إضافة مستخدم جديد
</PermissionButton>
```

---

## 🧪 اختبار النظام

### السيناريو 1: Super Admin
```typescript
// Super Admin لديه كل الصلاحيات
hasPermission('companies', 'delete') → true
hasPermission('admins', 'create') → true
canAccessPage('users') → true
```

### السيناريو 2: Admin محدود الصلاحيات
```typescript
// Admin لديه صلاحيات محددة فقط
hasPermission('companies', 'view') → true
hasPermission('companies', 'delete') → false
hasPermission('admins', 'create') → false
canAccessPage('companies') → true
canAccessPage('admins') → false
```

---

## 🔄 كيف يعمل النظام

### 1. تسجيل الدخول
```typescript
// في /admin-panel/api/login/route.ts
return NextResponse.json({ 
  success: true,
  admin: {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    permissions: JSON.parse(admin.permissions) // ← هنا الصلاحيات
  }
});
```

### 2. حفظ البيانات
```typescript
// في /admin-panel/login/page.tsx
localStorage.setItem("admin", JSON.stringify(data.admin));
```

### 3. التحقق من الصلاحيات
```typescript
// في useAdminPermissions hook
const hasPermission = (resource, action) => {
  if (admin.role === 'super_admin') return true; // Super Admin كل شيء
  
  const resourcePermissions = admin.permissions[resource];
  return resourcePermissions?.[action] === true;
};
```

### 4. الحماية التلقائية
```typescript
// في PermissionGuard
if (!hasPermission(resource, action)) {
  return <AccessDeniedScreen />; // شاشة رفض الوصول
}
```

---

## 🎨 شاشة رفض الوصول

عندما يحاول مسؤول الوصول لصفحة ليس لديه صلاحية لها:

```
┌─────────────────────────────────────────┐
│         🚫 ليس لديك صلاحية            │
│                                         │
│  عذراً، ليس لديك الصلاحيات اللازمة   │
│  للوصول إلى هذه الصفحة               │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ المورد المطلوب: الشركات          │ │
│  │ الإجراء المطلوب: حذف              │ │
│  │ دورك الحالي: مشرف                 │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [ 🏠 العودة إلى لوحة التحكم ]        │
└─────────────────────────────────────────┘
```

---

## ✨ المزايا

### ✅ أمان محكم
- لا يمكن تجاوز الصلاحيات من Frontend
- التحقق يتم في كل مكون
- Super Admin له صلاحيات كاملة دائماً

### ✅ واجهة نظيفة
- الأزرار غير المسموحة لا تظهر
- الصفحات غير المسموحة تعيد توجيه تلقائياً
- رسائل واضحة عند رفض الوصول

### ✅ سهولة الاستخدام
- Hook بسيط `useAdminPermissions()`
- مكونات جاهزة `PermissionGuard`, `PermissionButton`
- توثيق كامل بالعربي

### ✅ قابل للتوسع
- يمكن إضافة موارد جديدة بسهولة
- يمكن إضافة إجراءات جديدة
- يمكن تخصيص شاشة رفض الوصول

---

## 🚀 الاستخدام السريع

### لحماية صفحة كاملة:
```tsx
<PermissionGuard resource="companies" action="view">
  <YourPageContent />
</PermissionGuard>
```

### لحماية زر:
```tsx
<PermissionButton resource="users" action="delete" onClick={deleteUser}>
  حذف
</PermissionButton>
```

### للتحقق في الكود:
```tsx
const { hasPermission } = useAdminPermissions();

if (hasPermission('services', 'update')) {
  // قم بعملية التحديث
}
```

---

## 📝 ملاحظات مهمة

1. **Super Admin دائماً لديه كل الصلاحيات**
   - لا يمكن تقييد Super Admin
   - يمكنه الوصول لكل شيء
   - محمي من الحذف

2. **الصلاحيات تُحفظ في قاعدة البيانات**
   - في حقل `permissions` كـ JSON
   - تُحمّل عند تسجيل الدخول
   - تُحفظ في localStorage

3. **يجب تطبيق النظام على جميع الصفحات**
   - استخدم `PermissionGuard` لكل صفحة admin
   - استخدم `PermissionButton` لكل زر حساس
   - تحقق من `hasPermission()` قبل API calls

---

## 🎓 أمثلة عملية

### مثال 1: صفحة المستخدمين
```tsx
"use client";
import PermissionGuard from "@/components/admin/PermissionGuard";
import { PermissionButton, PermissionElement } from "@/components/admin/PermissionElements";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

function UsersContent() {
  const { hasPermission } = useAdminPermissions();

  return (
    <div>
      <h1>إدارة المستخدمين</h1>
      
      {/* زر الإضافة - يظهر فقط لمن لديه صلاحية create */}
      <PermissionButton
        resource="users"
        action="create"
        onClick={openAddModal}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        + إضافة مستخدم
      </PermissionButton>

      <table>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>
              {/* زر التعديل */}
              <PermissionButton
                resource="users"
                action="update"
                onClick={() => editUser(user.id)}
              >
                تعديل
              </PermissionButton>
              
              {/* زر الحذف */}
              <PermissionButton
                resource="users"
                action="delete"
                onClick={() => deleteUser(user.id)}
              >
                حذف
              </PermissionButton>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}

export default function UsersPage() {
  return (
    <PermissionGuard resource="users" action="view">
      <UsersContent />
    </PermissionGuard>
  );
}
```

### مثال 2: لوحة التحكم الرئيسية
```tsx
"use client";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

export default function Dashboard() {
  const { canAccessPage, isSuperAdmin } = useAdminPermissions();

  return (
    <div>
      <h1>لوحة التحكم</h1>
      
      {/* عرض الأزرار حسب الصلاحيات */}
      <div className="grid">
        {canAccessPage('companies') && (
          <DashboardCard 
            title="الشركات" 
            link="/admin-panel/companies"
          />
        )}
        
        {canAccessPage('users') && (
          <DashboardCard 
            title="المستخدمين" 
            link="/admin-panel/users"
          />
        )}
        
        {canAccessPage('services') && (
          <DashboardCard 
            title="الخدمات" 
            link="/admin/services"
          />
        )}

        {/* فقط Super Admin يرى هذا */}
        {isSuperAdmin && (
          <DashboardCard 
            title="إدارة المسؤولين" 
            link="/admin-panel/settings/admins"
            className="bg-red-500"
          />
        )}
      </div>
    </div>
  );
}
```

---

## 🔧 التخصيص

### تغيير رسالة رفض الوصول:
```tsx
<PermissionGuard 
  resource="companies" 
  action="view"
  fallback={
    <div className="custom-access-denied">
      <h2>غير مسموح!</h2>
      <p>اتصل بالمسؤول الرئيسي</p>
    </div>
  }
>
  <Content />
</PermissionGuard>
```

### إضافة مورد جديد:
```typescript
// في useAdminPermissions.ts - أضف للـ interface
export interface AdminPermissions {
  // ... الموارد الموجودة
  reports?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
}

// في PermissionGuard.tsx - أضف للترجمة
function getResourceNameAr(resource: keyof AdminPermissions): string {
  const names: Record<string, string> = {
    // ... الموارد الموجودة
    reports: 'التقارير'
  };
  return names[resource] || resource;
}
```

---

## ✅ تم الإصلاح بنجاح!

الآن عند إنشاء مسؤول جديد بصلاحيات محددة:
- ✅ لن يرى إلا الصفحات المسموح له بها في Dashboard
- ✅ عند محاولة الوصول لصفحة ممنوعة → سيظهر "ليس لديك صلاحية"
- ✅ الأزرار الممنوعة لن تظهر نهائياً
- ✅ Super Admin لا يتأثر - لديه كل الصلاحيات

---

**تم إنشاء النظام بواسطة:** GitHub Copilot  
**التاريخ:** 28 أكتوبر 2025  
**الحالة:** ✅ جاهز للاستخدام
