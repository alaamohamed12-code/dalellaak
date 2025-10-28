import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'companies.db');

export async function POST(request: NextRequest) {
  const db = new Database(dbPath);
  
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' }, { status: 400 });
    }
    
    // Get admin by username
    const admin: any = db.prepare(`
      SELECT id, username, password, email, firstName, lastName, role, permissions, isActive
      FROM admins
      WHERE username = ?
    `).get(username);
    
    if (!admin) {
      return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });
    }
    
    // Check if account is active
    if (!admin.isActive) {
      return NextResponse.json({ error: 'هذا الحساب غير نشط. يرجى الاتصال بالمسؤول الرئيسي' }, { status: 403 });
    }
    
    // Verify password
    const passwordMatch = bcrypt.compareSync(password, admin.password);
    
    if (!passwordMatch) {
      return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });
    }
    
    // Update last login
    db.prepare('UPDATE admins SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?').run(admin.id);
    
    // Log activity
    db.prepare(`
      INSERT INTO admin_activity_log (adminId, action, details)
      VALUES (?, ?, ?)
    `).run(admin.id, 'login', 'Admin logged in');
    
    // Remove password from response
    delete admin.password;
    
    // Parse permissions
    admin.permissions = JSON.parse(admin.permissions || '{}');
    
    return NextResponse.json({ 
      success: true,
      admin,
      message: 'تم تسجيل الدخول بنجاح'
    });
    
  } catch (error: any) {
    console.error('Error during admin login:', error);
    return NextResponse.json({ error: 'فشل في تسجيل الدخول' }, { status: 500 });
  } finally {
    db.close();
  }
}
