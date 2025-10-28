import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'companies.db');

// Helper function to get admin from session
function getAdminFromSession(request: NextRequest) {
  // في الإنتاج، استخدم JWT أو session حقيقية
  // هنا نستخدم localStorage للتبسيط
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  try {
    const adminData = JSON.parse(Buffer.from(authHeader.split(' ')[1], 'base64').toString());
    return adminData;
  } catch {
    return null;
  }
}

// Helper function to check permissions
function hasPermission(admin: any, resource: string, action: string): boolean {
  if (admin.role === 'super_admin') return true;
  
  try {
    const permissions = typeof admin.permissions === 'string' 
      ? JSON.parse(admin.permissions) 
      : admin.permissions;
    
    return permissions[resource]?.[action] === true;
  } catch {
    return false;
  }
}

// Helper function to log activity
function logActivity(db: any, adminId: number, action: string, targetType?: string, targetId?: number, details?: string) {
  try {
    db.prepare(`
      INSERT INTO admin_activity_log (adminId, action, targetType, targetId, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, action, targetType || null, targetId || null, details || null);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// GET: List all admins
export async function GET(request: NextRequest) {
  const db = new Database(dbPath);
  
  try {
    const admin = getAdminFromSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    // Check permission
    if (!hasPermission(admin, 'admins', 'view')) {
      return NextResponse.json({ error: 'ليس لديك صلاحية لعرض المسؤولين' }, { status: 403 });
    }
    
    // Get all admins (exclude password)
    const admins = db.prepare(`
      SELECT 
        id, username, email, firstName, lastName, role, permissions,
        createdBy, createdAt, updatedAt, lastLogin, isActive
      FROM admins
      ORDER BY createdAt DESC
    `).all();
    
    // Parse permissions JSON
    const adminsWithParsedPermissions = admins.map((a: any) => ({
      ...a,
      permissions: JSON.parse(a.permissions || '{}')
    }));
    
    return NextResponse.json({ 
      admins: adminsWithParsedPermissions,
      currentAdmin: admin
    });
    
  } catch (error: any) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 });
  } finally {
    db.close();
  }
}

// POST: Create new admin
export async function POST(request: NextRequest) {
  const db = new Database(dbPath);
  
  try {
    const admin = getAdminFromSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    // Check permission
    if (!hasPermission(admin, 'admins', 'create')) {
      return NextResponse.json({ error: 'ليس لديك صلاحية لإنشاء مسؤولين جدد' }, { status: 403 });
    }
    
    const body = await request.json();
    const { username, password, email, firstName, lastName, role, permissions } = body;
    
    // Validation
    if (!username || !password || !email || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }
    
    // Check if username or email already exists
    const existing = db.prepare('SELECT id FROM admins WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
      return NextResponse.json({ error: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Insert new admin
    const result = db.prepare(`
      INSERT INTO admins (username, password, email, firstName, lastName, role, permissions, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      username,
      hashedPassword,
      email,
      firstName,
      lastName,
      role,
      JSON.stringify(permissions || {}),
      admin.id
    );
    
    // Log activity
    logActivity(db, admin.id, 'create_admin', 'admin', result.lastInsertRowid as number, `Created admin: ${username}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم إنشاء المسؤول بنجاح',
      adminId: result.lastInsertRowid
    });
    
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'فشل في إنشاء المسؤول' }, { status: 500 });
  } finally {
    db.close();
  }
}

// PUT: Update admin
export async function PUT(request: NextRequest) {
  const db = new Database(dbPath);
  
  try {
    const admin = getAdminFromSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    // Check permission
    if (!hasPermission(admin, 'admins', 'edit')) {
      return NextResponse.json({ error: 'ليس لديك صلاحية لتعديل المسؤولين' }, { status: 403 });
    }
    
    const body = await request.json();
    const { id, username, email, firstName, lastName, role, permissions, isActive, password } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'معرف المسؤول مطلوب' }, { status: 400 });
    }
    
    // Prevent editing Super Admin by non-Super Admins
    const targetAdmin = db.prepare('SELECT role FROM admins WHERE id = ?').get(id) as any;
    if (targetAdmin?.role === 'super_admin' && admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'لا يمكنك تعديل حساب Super Admin' }, { status: 403 });
    }
    
    // Build update query
    let updateFields: string[] = [];
    let updateValues: any[] = [];
    
    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (firstName) {
      updateFields.push('firstName = ?');
      updateValues.push(firstName);
    }
    if (lastName) {
      updateFields.push('lastName = ?');
      updateValues.push(lastName);
    }
    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (permissions !== undefined) {
      updateFields.push('permissions = ?');
      updateValues.push(JSON.stringify(permissions));
    }
    if (isActive !== undefined) {
      updateFields.push('isActive = ?');
      updateValues.push(isActive ? 1 : 0);
    }
    if (password) {
      updateFields.push('password = ?');
      updateValues.push(bcrypt.hashSync(password, 10));
    }
    
    updateFields.push('updatedAt = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    // Update admin
    db.prepare(`
      UPDATE admins 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `).run(...updateValues);
    
    // Log activity
    logActivity(db, admin.id, 'update_admin', 'admin', id, `Updated admin: ${username || id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم تحديث المسؤول بنجاح'
    });
    
  } catch (error: any) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ error: 'فشل في تحديث المسؤول' }, { status: 500 });
  } finally {
    db.close();
  }
}

// DELETE: Delete admin
export async function DELETE(request: NextRequest) {
  const db = new Database(dbPath);
  
  try {
    const admin = getAdminFromSession(request);
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    // Check permission
    if (!hasPermission(admin, 'admins', 'delete')) {
      return NextResponse.json({ error: 'ليس لديك صلاحية لحذف المسؤولين' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'معرف المسؤول مطلوب' }, { status: 400 });
    }
    
    // Prevent deleting self
    if (parseInt(id) === admin.id) {
      return NextResponse.json({ error: 'لا يمكنك حذف حسابك الخاص' }, { status: 400 });
    }
    
    // Prevent deleting Super Admin
    const targetAdmin = db.prepare('SELECT role, username FROM admins WHERE id = ?').get(id) as any;
    if (targetAdmin?.role === 'super_admin') {
      return NextResponse.json({ error: 'لا يمكن حذف حساب Super Admin' }, { status: 403 });
    }
    
    // Delete admin
    db.prepare('DELETE FROM admins WHERE id = ?').run(id);
    
    // Log activity
    logActivity(db, admin.id, 'delete_admin', 'admin', parseInt(id), `Deleted admin: ${targetAdmin?.username}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم حذف المسؤول بنجاح'
    });
    
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ error: 'فشل في حذف المسؤول' }, { status: 500 });
  } finally {
    db.close();
  }
}
