"use client"
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Admin = {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  permissions: any
  createdAt: string
  lastLogin: string | null
  isActive: number
}

type Permission = {
  label: string
  key: string
  actions: { label: string; key: string }[]
}

const PERMISSIONS: Permission[] = [
  {
    label: 'المستخدمين',
    key: 'users',
    actions: [
      { label: 'عرض', key: 'view' },
      { label: 'تعديل', key: 'edit' },
      { label: 'حذف', key: 'delete' },
      { label: 'تصدير', key: 'export' }
    ]
  },
  {
    label: 'الشركات',
    key: 'companies',
    actions: [
      { label: 'عرض', key: 'view' },
      { label: 'تعديل', key: 'edit' },
      { label: 'حذف', key: 'delete' },
      { label: 'توثيق', key: 'verify' },
      { label: 'تصدير', key: 'export' }
    ]
  },
  {
    label: 'العضويات',
    key: 'memberships',
    actions: [
      { label: 'عرض', key: 'view' },
      { label: 'إدارة', key: 'manage' },
      { label: 'موافقة', key: 'approve' },
      { label: 'إلغاء', key: 'cancel' }
    ]
  },
  {
    label: 'التقييمات',
    key: 'reviews',
    actions: [
      { label: 'عرض', key: 'view' },
      { label: 'إدارة', key: 'manage' },
      { label: 'حذف', key: 'delete' }
    ]
  },
  {
    label: 'الدعم الفني',
    key: 'support',
    actions: [
      { label: 'عرض', key: 'view' },
      { label: 'إدارة', key: 'manage' },
      { label: 'الرد', key: 'reply' },
      { label: 'إغلاق', key: 'close' }
    ]
  },
  {
    label: 'العقود',
    key: 'contracts',
    actions: [
      { label: 'عرض', key: 'view' },
      { label: 'إدارة', key: 'manage' },
      { label: 'موافقة', key: 'approve' },
      { label: 'تصدير', key: 'export' }
    ]
  },
  {
    label: 'المسؤولين',
    key: 'admins',
    actions: [
      { label: 'عرض', key: 'view' },
      { label: 'إدارة', key: 'manage' },
      { label: 'إنشاء', key: 'create' },
      { label: 'تعديل', key: 'edit' },
      { label: 'حذف', key: 'delete' }
    ]
  },
  {
    label: 'الإعدادات',
    key: 'settings',
    actions: [
      { label: 'عرض', key: 'view' },
      { label: 'تعديل', key: 'edit' }
    ]
  },
  {
    label: 'التقارير',
    key: 'reports',
    actions: [
      { label: 'عرض', key: 'view' },
      { label: 'تصدير', key: 'export' }
    ]
  },
  {
    label: 'الإشعارات',
    key: 'notifications',
    actions: [
      { label: 'إرسال', key: 'send' },
      { label: 'إدارة', key: 'manage' }
    ]
  }
]

const ROLE_PRESETS: any = {
  super_admin: {
    label: 'Super Admin',
    color: 'red',
    permissions: Object.fromEntries(
      PERMISSIONS.map(p => [
        p.key,
        Object.fromEntries(p.actions.map(a => [a.key, true]))
      ])
    )
  },
  admin: {
    label: 'Admin',
    color: 'blue',
    permissions: {
      users: { view: true, edit: true, delete: false, export: true },
      companies: { view: true, edit: true, delete: false, verify: true, export: true },
      memberships: { view: true, manage: true, approve: true, cancel: false },
      reviews: { view: true, manage: true, delete: true },
      support: { view: true, manage: true, reply: true, close: true },
      contracts: { view: true, manage: false, approve: false, export: true },
      admins: { view: true, manage: false, create: false, edit: false, delete: false },
      settings: { view: true, edit: false },
      reports: { view: true, export: true },
      notifications: { send: true, manage: false }
    }
  },
  moderator: {
    label: 'Moderator',
    color: 'green',
    permissions: {
      users: { view: true, edit: false, delete: false, export: false },
      companies: { view: true, edit: false, delete: false, verify: false, export: false },
      memberships: { view: true, manage: false, approve: false, cancel: false },
      reviews: { view: true, manage: true, delete: true },
      support: { view: true, manage: true, reply: true, close: false },
      contracts: { view: true, manage: false, approve: false, export: false },
      admins: { view: false, manage: false, create: false, edit: false, delete: false },
      settings: { view: true, edit: false },
      reports: { view: true, export: false },
      notifications: { send: false, manage: false }
    }
  }
}

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [currentAdmin, setCurrentAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [formData, setFormData] = useState<any>({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'admin',
    permissions: ROLE_PRESETS.admin.permissions
  })

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('admin')
    if (!adminData) {
      window.location.href = '/admin-login'
      return
    }
    
    try {
      const admin = JSON.parse(adminData)
      setCurrentAdmin(admin)
      loadAdmins(admin)
    } catch {
      window.location.href = '/admin-login'
    }
  }, [])

  async function loadAdmins(admin: any) {
    setLoading(true)
    try {
      const authHeader = `Bearer ${Buffer.from(JSON.stringify(admin)).toString('base64')}`
      const res = await fetch('/api/admin/admins', {
        headers: { 'Authorization': authHeader }
      })
      
      if (res.ok) {
        const data = await res.json()
        setAdmins(data.admins)
      } else {
        alert('فشل في تحميل البيانات')
      }
    } catch (error) {
      console.error('Error loading admins:', error)
      alert('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingAdmin(null)
    setFormData({
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'admin',
      permissions: ROLE_PRESETS.admin.permissions
    })
    setShowModal(true)
  }

  function openEditModal(admin: Admin) {
    setEditingAdmin(admin)
    setFormData({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive
    })
    setShowModal(true)
  }

  function handleRoleChange(role: string) {
    setFormData({
      ...formData,
      role,
      permissions: ROLE_PRESETS[role]?.permissions || formData.permissions
    })
  }

  function togglePermission(resource: string, action: string) {
    const newPermissions = { ...formData.permissions }
    if (!newPermissions[resource]) {
      newPermissions[resource] = {}
    }
    newPermissions[resource][action] = !newPermissions[resource][action]
    setFormData({ ...formData, permissions: newPermissions })
  }

  function toggleAllPermissions(resource: string, value: boolean) {
    const resourcePerms = PERMISSIONS.find(p => p.key === resource)
    if (!resourcePerms) return
    
    const newPermissions = { ...formData.permissions }
    newPermissions[resource] = Object.fromEntries(
      resourcePerms.actions.map(a => [a.key, value])
    )
    setFormData({ ...formData, permissions: newPermissions })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!currentAdmin) return
    
    try {
      const authHeader = `Bearer ${Buffer.from(JSON.stringify(currentAdmin)).toString('base64')}`
      const method = editingAdmin ? 'PUT' : 'POST'
      
      const res = await fetch('/api/admin/admins', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert(data.message)
        setShowModal(false)
        loadAdmins(currentAdmin)
      } else {
        alert(data.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving admin:', error)
      alert('حدث خطأ أثناء الحفظ')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('هل أنت متأكد من حذف هذا المسؤول؟')) return
    
    if (!currentAdmin) return
    
    try {
      const authHeader = `Bearer ${Buffer.from(JSON.stringify(currentAdmin)).toString('base64')}`
      const res = await fetch(`/api/admin/admins?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': authHeader }
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert(data.message)
        loadAdmins(currentAdmin)
      } else {
        alert(data.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      alert('حدث خطأ أثناء الحذف')
    }
  }

  async function toggleActive(admin: Admin) {
    if (!currentAdmin) return
    
    try {
      const authHeader = `Bearer ${Buffer.from(JSON.stringify(currentAdmin)).toString('base64')}`
      const res = await fetch('/api/admin/admins', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          id: admin.id,
          isActive: admin.isActive ? 0 : 1
        })
      })
      
      if (res.ok) {
        loadAdmins(currentAdmin)
      } else {
        alert('فشل في تحديث الحالة')
      }
    } catch (error) {
      console.error('Error toggling active:', error)
      alert('حدث خطأ')
    }
  }

  function getRoleBadgeColor(role: string) {
    return ROLE_PRESETS[role]?.color || 'gray'
  }

  function getRoleLabel(role: string) {
    return ROLE_PRESETS[role]?.label || role
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جارِ التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">إدارة المسؤولين</h1>
              <p className="text-gray-600">إضافة وتعديل وإدارة حسابات المسؤولين مع صلاحيات مخصصة</p>
            </div>
            <button
              onClick={() => window.location.href = '/admin-panel/dashboard'}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-all"
            >
              ← العودة للوحة التحكم
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg"
          >
            <div className="text-4xl font-bold mb-2">{admins.length}</div>
            <div className="text-blue-100">إجمالي المسؤولين</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg"
          >
            <div className="text-4xl font-bold mb-2">{admins.filter(a => a.isActive).length}</div>
            <div className="text-green-100">نشط</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg"
          >
            <div className="text-4xl font-bold mb-2">{admins.filter(a => a.role === 'admin').length}</div>
            <div className="text-purple-100">أدمن عادي</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg"
          >
            <div className="text-4xl font-bold mb-2">{admins.filter(a => a.role === 'moderator').length}</div>
            <div className="text-orange-100">مشرف</div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة مسؤول جديد
          </button>
        </div>

        {/* Admins List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المعرف</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المستخدم</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الاسم</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">البريد</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الدور</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">آخر دخول</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admins.map((admin, index) => (
                  <motion.tr
                    key={admin.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">#{admin.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{admin.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{admin.firstName} {admin.lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        admin.role === 'super_admin' ? 'bg-red-100 text-red-700' :
                        admin.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {getRoleLabel(admin.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString('ar-EG') : 'لم يسجل دخول'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(admin)}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          admin.isActive 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={admin.role === 'super_admin'}
                      >
                        {admin.isActive ? 'نشط' : 'معطل'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="تعديل"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {admin.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="حذف"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {editingAdmin ? 'تعديل المسؤول' : 'إضافة مسؤول جديد'}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم *</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {!editingAdmin && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور *</label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={!editingAdmin}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الأول *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">اسم العائلة *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الدور *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={editingAdmin?.role === 'super_admin'}
                      >
                        <option value="admin">Admin - مسؤول</option>
                        <option value="moderator">Moderator - مشرف</option>
                        {currentAdmin?.role === 'super_admin' && (
                          <option value="super_admin">Super Admin - مسؤول رئيسي</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">الصلاحيات</h3>
                    <div className="space-y-4">
                      {PERMISSIONS.map((permission) => (
                        <div key={permission.key} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-800">{permission.label}</span>
                              <span className="text-sm text-gray-500">({permission.key})</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => toggleAllPermissions(permission.key, true)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200"
                              >
                                تحديد الكل
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleAllPermissions(permission.key, false)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200"
                              >
                                إلغاء الكل
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {permission.actions.map((action) => (
                              <label key={action.key} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.permissions[permission.key]?.[action.key] || false}
                                  onChange={() => togglePermission(permission.key, action.key)}
                                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{action.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                    >
                      {editingAdmin ? 'حفظ التغييرات' : 'إضافة المسؤول'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
