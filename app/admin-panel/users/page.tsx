"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfileImageUrl } from "../../../lib/image-utils";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Check if admin is logged in
    const adminStr = localStorage.getItem('admin');
    if (!adminStr) {
      router.push('/admin-panel/login');
      return;
    }
    fetchUsers();
  }, []);

  function fetchUsers(q = "") {
    setLoading(true);
    fetch(`/admin-panel/api/users${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchUsers(search);
  }

  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">إدارة المستخدمين</h1>
      <form onSubmit={handleSearch} className="mb-6 flex gap-2 justify-center">
        <input type="text" className="input input-bordered w-64" placeholder="بحث بالإيميل أو اسم المستخدم" value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit" className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold px-6 py-2 rounded-full">بحث</button>
      </form>
      {loading ? (
        <div className="text-center py-10">جاري التحميل...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead>
              <tr>
                <th className="py-2 px-3 border-b">#</th>
                <th className="py-2 px-3 border-b">الاسم الأول</th>
                <th className="py-2 px-3 border-b">الاسم الثاني</th>
                <th className="py-2 px-3 border-b">البريد الإلكتروني</th>
                <th className="py-2 px-3 border-b">رقم الموبايل</th>
                <th className="py-2 px-3 border-b">اسم المستخدم</th>
                <th className="py-2 px-3 border-b">نوع الحساب</th>
                <th className="py-2 px-3 border-b">الصورة</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className="text-center">
                  <td className="py-2 px-3 border-b">{i + 1}</td>
                  <td className="py-2 px-3 border-b">{u.lastName}</td>
                  <td className="py-2 px-3 border-b">{u.email}</td>
                  <td className="py-2 px-3 border-b">{u.phone}</td>
                  <td className="py-2 px-3 border-b">{u.username}</td>
                  <td className="py-2 px-3 border-b">{u.accountType === 'individual' ? 'فرد' : u.accountType}</td>
                  <td className="py-2 px-3 border-b">
                    {u.image ? (
                      <img 
                        src={getProfileImageUrl(u.image)} 
                        alt={u.username} 
                        className="w-10 h-10 rounded-full mx-auto object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/profile-images/default-avatar.svg';
                        }}
                      />
                    ) : '-'}
                  </td>
                  <td className="py-2 px-3 border-b">{u.image ? <img src={u.image} alt={u.username} className="w-10 h-10 rounded-full mx-auto" /> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="text-center py-8 text-gray-500">لا يوجد مستخدمون.</div>}
        </div>
      )}
    </main>
  );
}
