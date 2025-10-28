import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, code, subject, message } = body;
  
  // استخدام الموضوع والرسالة المخصصة أو القيم الافتراضية
  const emailSubject = subject || 'كود التحقق من التسجيل';
  const emailMessage = message || `كود التحقق الخاص بك هو: ${code}`;

  if (!email || !code) {
    return NextResponse.json({ error: 'Missing email or code' }, { status: 400 });
  }

  // إعدادات Gmail SMTP (يفضل استخدام متغيرات بيئة)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: emailSubject,
      text: emailMessage,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0;">${emailSubject}</h2>
          </div>
          <div style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            ${emailMessage.replace(/\n/g, '<br>')}
          </div>
          <div style="text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p>إذا لم تطلب هذا الكود، يمكنك تجاهل هذا البريد.</p>
          </div>
        </div>
      </div>`
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'فشل إرسال البريد', details: err }, { status: 500 });
  }
}
