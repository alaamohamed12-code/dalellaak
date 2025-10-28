import { NextResponse } from 'next/server';
import usersDb from '@/lib/db';
import companiesDb from '@/lib/companies-db';

export async function POST(req: Request) {
  try {
    const { username1, username2 } = await req.json();

    if (!username1 || !username2) {
      return NextResponse.json(
        { error: 'يجب إدخال اسمي المستخدمين' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم الأول في جداول المستخدمين والشركات
    let user1 = usersDb.prepare('SELECT * FROM users WHERE username = ?').get(username1) as any;
    let user1Type: 'user' | 'company' = 'user';
    
    if (!user1) {
      user1 = companiesDb.prepare('SELECT * FROM companies WHERE username = ?').get(username1) as any;
      user1Type = 'company';
    }

    if (!user1) {
      return NextResponse.json(
        { error: `المستخدم "${username1}" غير موجود` },
        { status: 404 }
      );
    }

    // البحث عن المستخدم الثاني
    let user2 = usersDb.prepare('SELECT * FROM users WHERE username = ?').get(username2) as any;
    let user2Type: 'user' | 'company' = 'user';
    
    if (!user2) {
      user2 = companiesDb.prepare('SELECT * FROM companies WHERE username = ?').get(username2) as any;
      user2Type = 'company';
    }

    if (!user2) {
      return NextResponse.json(
        { error: `المستخدم "${username2}" غير موجود` },
        { status: 404 }
      );
    }

    // التحقق من أن أحد الطرفين على الأقل شركة (لأن المحادثات بين users و companies فقط)
    if (user1Type === 'user' && user2Type === 'user') {
      return NextResponse.json(
        { error: 'لا توجد محادثات بين مستخدمين عاديين. يجب أن يكون أحد الطرفين شركة.' },
        { status: 400 }
      );
    }

    if (user1Type === 'company' && user2Type === 'company') {
      return NextResponse.json(
        { error: 'لا توجد محادثات بين شركتين. يجب أن يكون أحد الطرفين مستخدم عادي.' },
        { status: 400 }
      );
    }

    // تحديد userId و companyId
    let userId: number;
    let companyId: number;
    
    if (user1Type === 'user') {
      userId = user1.id;
      companyId = user2.id;
    } else {
      userId = user2.id;
      companyId = user1.id;
    }

    // البحث عن المحادثة
    const conversation = companiesDb.prepare(
      'SELECT * FROM conversations WHERE userId = ? AND companyId = ?'
    ).get(userId, companyId) as any;

    if (!conversation) {
      return NextResponse.json({
        user1: {
          id: user1.id,
          username: user1.username,
          name: `${user1.firstName} ${user1.lastName}`,
          type: user1Type,
          image: user1.image
        },
        user2: {
          id: user2.id,
          username: user2.username,
          name: `${user2.firstName} ${user2.lastName}`,
          type: user2Type,
          image: user2.image
        },
        messages: [],
        conversationId: null
      });
    }

    // جلب جميع الرسائل
    const messages = companiesDb.prepare(
      'SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC, id ASC'
    ).all(conversation.id) as any[];

    // إضافة معلومات المرسل لكل رسالة
    const enrichedMessages = messages.map(msg => {
      const sender = msg.senderType === user1Type && msg.senderId === user1.id ? user1 : user2;
      return {
        ...msg,
        senderName: `${sender.firstName} ${sender.lastName}`,
        senderUsername: sender.username,
        senderImage: sender.image
      };
    });

    return NextResponse.json({
      user1: {
        id: user1.id,
        username: user1.username,
        name: `${user1.firstName} ${user1.lastName}`,
        type: user1Type,
        image: user1.image
      },
      user2: {
        id: user2.id,
        username: user2.username,
        name: `${user2.firstName} ${user2.lastName}`,
        type: user2Type,
        image: user2.image
      },
      messages: enrichedMessages,
      conversationId: conversation.id,
      conversationCreatedAt: conversation.createdAt,
      conversationUpdatedAt: conversation.updatedAt
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المحادثة' },
      { status: 500 }
    );
  }
}
