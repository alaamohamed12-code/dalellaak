import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'companies.db');

type AdminRow = {
  id: number;
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  permissions: string;
  isActive: number;
  lastLogin?: string;
  createdAt?: string;
};

export async function POST(req: Request) {
  const db = new Database(dbPath);
  
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: 'اسم المستخدم وكلمة المرور مطلوبة' }, { status: 400 });
    }
    
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username) as AdminRow | undefined;
    
    if (!admin) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }
    
    // Check if admin is active
    if (admin.isActive === 0) {
      return NextResponse.json({ error: 'هذا الحساب معطل. يرجى التواصل مع المسؤول الرئيسي' }, { status: 403 });
    }
    
    const valid = bcrypt.compareSync(password, admin.password);
    
    if (!valid) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }
    
    // Update last login time
    db.prepare('UPDATE admins SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?').run(admin.id);
    
    // Parse permissions
    let permissions = {};
    try {
      permissions = JSON.parse(admin.permissions || '{}');
    } catch {
      permissions = {};
    }
    
    // Return admin data (excluding password)
    const adminData = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      permissions: permissions,
      lastLogin: new Date().toISOString()
    };
    
    return NextResponse.json({ 
      success: true,
      admin: adminData
    });
    
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تسجيل الدخول' }, { status: 500 });
  } finally {
    db.close();
  }
}
