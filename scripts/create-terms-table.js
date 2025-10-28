const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'site-settings.db');
const db = new Database(dbPath);

console.log('📦 إنشاء جدول الشروط والأحكام...');

// Create terms table
db.exec(`
  CREATE TABLE IF NOT EXISTS terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sectionId TEXT NOT NULL UNIQUE,
    titleAr TEXT NOT NULL,
    titleEn TEXT NOT NULL,
    contentAr TEXT NOT NULL,
    contentEn TEXT NOT NULL,
    icon TEXT DEFAULT '📄',
    displayOrder INTEGER NOT NULL DEFAULT 0,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert default terms sections
const defaultTerms = [
  {
    sectionId: 'intro',
    titleAr: 'مقدمة',
    titleEn: 'Introduction',
    contentAr: 'مرحباً بك في منصتنا. باستخدامك لخدماتنا، فإنك توافق على هذه الشروط والأحكام. يرجى قراءتها بعناية، وإذا لم توافق على أي جزء منها، فيُرجى التوقف عن استخدام الموقع.',
    contentEn: 'Welcome to our platform. By using our services, you agree to these terms and conditions. Please read them carefully, and if you do not agree with any part, please stop using the site.',
    icon: '📄',
    displayOrder: 1
  },
  {
    sectionId: 'definitions',
    titleAr: 'التعريفات',
    titleEn: 'Definitions',
    contentAr: `المستخدم: أي فرد يستخدم المنصة للتواصل أو الاستفادة من الخدمات.
الشركة: أي حساب مسجّل ككيان تجاري على المنصة.
المحادثات: قنوات التواصل بين المستخدمين والشركات داخل المنصة.
العضوية: حالة تُمكّن الشركات من الظهور والاستفادة من مزايا المنصة وفق مدة محددة.
حالات التعاقد: طلبات إتمام أو إلغاء التعاقد المرتبطة بالمحادثات.`,
    contentEn: `User: Any individual using the platform to communicate or benefit from services.
Company: Any account registered as a business entity on the platform.
Conversations: Communication channels between users and companies within the platform.
Membership: A status that enables companies to appear and benefit from platform features for a specified duration.
Contract States: Requests for contract completion or cancellation associated with conversations.`,
    icon: '📚',
    displayOrder: 2
  },
  {
    sectionId: 'usage',
    titleAr: 'استخدام المنصة',
    titleEn: 'Platform Usage',
    contentAr: `يجب استخدام المنصة بشكل قانوني ووفق الأنظمة المعمول بها.
يُمنع إساءة الاستخدام، مثل إرسال محتوى مسيء أو مضلل أو مخالف للحقوق.
يجوز للمنصة تعليق أو إيقاف أي حساب يخالف هذه الشروط.`,
    contentEn: `The platform must be used legally and in accordance with applicable regulations.
Misuse is prohibited, such as sending offensive, misleading, or rights-violating content.
The platform may suspend or terminate any account that violates these terms.`,
    icon: '✅',
    displayOrder: 3
  },
  {
    sectionId: 'accounts',
    titleAr: 'الحسابات والمسؤوليات',
    titleEn: 'Accounts & Responsibilities',
    contentAr: `أنت مسؤول عن سرية بيانات الدخول لأي حساب تمتلكه.
يجب تقديم معلومات صحيحة ومحدثة.
أي نشاط يتم عبر حسابك يُعتبر على مسؤوليتك.`,
    contentEn: `You are responsible for the confidentiality of login credentials for any account you own.
Accurate and updated information must be provided.
Any activity conducted through your account is your responsibility.`,
    icon: '👤',
    displayOrder: 4
  },
  {
    sectionId: 'membership',
    titleAr: 'العضوية وظهور الشركات',
    titleEn: 'Membership & Company Display',
    contentAr: `ظهور الشركات في الواجهة العامة يتطلب عضوية سارية.
عند انتهاء العضوية قد لا تظهر الشركة للعامة حتى التجديد.
يجوز للإدارة تعليق أو إلغاء العضوية عند المخالفة.`,
    contentEn: `Company visibility on the public interface requires an active membership.
When membership expires, the company may not appear publicly until renewal.
The administration may suspend or cancel membership in case of violation.`,
    icon: '🪪',
    displayOrder: 5
  },
  {
    sectionId: 'contracts',
    titleAr: 'المحادثات وإتمام/إلغاء التعاقد',
    titleEn: 'Conversations & Contract Completion/Cancellation',
    contentAr: `يمكن للأطراف إرسال طلب إتمام التعاقد عبر شاشة الرسائل.
يمكن إرسال طلب إلغاء التعاقد مع توضيح السبب للمراجعة.
تُعرض الطلبات للإدارة للمراجعة واتخاذ ما يلزم وفق السياسات.`,
    contentEn: `Parties can send a contract completion request via the messages screen.
A contract cancellation request can be sent with reason clarification for review.
Requests are submitted to the administration for review and appropriate action according to policies.`,
    icon: '🤝',
    displayOrder: 6
  },
  {
    sectionId: 'ip',
    titleAr: 'الملكية الفكرية',
    titleEn: 'Intellectual Property',
    contentAr: 'جميع العلامات والشعارات والمحتوى والتصاميم على المنصة مملوكة لأصحابها ومحميّة بموجب القوانين ذات الصلة. لا يجوز نسخها أو استخدامها بدون إذن مسبق.',
    contentEn: 'All trademarks, logos, content, and designs on the platform are owned by their respective owners and protected under relevant laws. They may not be copied or used without prior permission.',
    icon: '©️',
    displayOrder: 7
  },
  {
    sectionId: 'privacy',
    titleAr: 'الخصوصية',
    titleEn: 'Privacy',
    contentAr: 'نلتزم بحماية خصوصيتك وفق سياساتنا المعتمدة. للمزيد، يُرجى مراجعة سياسة الخصوصية إن وُجدت.',
    contentEn: 'We are committed to protecting your privacy according to our adopted policies. For more information, please review the privacy policy if available.',
    icon: '🔒',
    displayOrder: 8
  },
  {
    sectionId: 'disclaimer',
    titleAr: 'إخلاء المسؤولية',
    titleEn: 'Disclaimer',
    contentAr: 'يتم تقديم الخدمات "كما هي" دون أي ضمانات صريحة أو ضمنية. لا تتحمل المنصة أي مسؤولية عن أي خسائر ناتجة عن الاستخدام.',
    contentEn: 'Services are provided "as is" without any express or implied warranties. The platform assumes no liability for any losses resulting from use.',
    icon: '⚠️',
    displayOrder: 9
  },
  {
    sectionId: 'changes',
    titleAr: 'تعديل الشروط',
    titleEn: 'Terms Modification',
    contentAr: 'يجوز لنا تعديل هذه الشروط في أي وقت. يسري التعديل عند نشره في هذه الصفحة. استمرارك في الاستخدام يعني موافقتك على التحديثات.',
    contentEn: 'We may modify these terms at any time. Modifications take effect upon publication on this page. Your continued use signifies acceptance of updates.',
    icon: '🔁',
    displayOrder: 10
  },
  {
    sectionId: 'contact',
    titleAr: 'التواصل',
    titleEn: 'Contact',
    contentAr: 'للاستفسارات، يُرجى التواصل عبر صفحة اتصل بنا إن وُجدت.',
    contentEn: 'For inquiries, please contact us via the Contact Us page if available.',
    icon: '✉️',
    displayOrder: 11
  }
];

const insertStmt = db.prepare(`
  INSERT INTO terms (sectionId, titleAr, titleEn, contentAr, contentEn, icon, displayOrder)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

defaultTerms.forEach(term => {
  insertStmt.run(
    term.sectionId,
    term.titleAr,
    term.titleEn,
    term.contentAr,
    term.contentEn,
    term.icon,
    term.displayOrder
  );
});

console.log('✅ تم إنشاء جدول terms بنجاح!');
console.log(`✅ تم إضافة ${defaultTerms.length} قسم افتراضي!`);

db.close();
