"use client";
import { useEffect, useState } from 'react';
import Header from '../../../components/layout/Header';

export default function CompanyWorksPage() {
  const [user, setUser] = useState<any>(null);
  const [works, setWorks] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', description: '', media: [] as File[] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    }
  }, []);

  useEffect(() => {
    if (user && user.accountType === 'company') fetchWorks();
  }, [user]);

  async function fetchWorks() {
    setLoading(true);
    const res = await fetch(`/api/company-works?companyId=${user.id}`);
    const data = await res.json();
    setWorks(data.works || []);
    setLoading(false);
  }

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleFiles(e: any) {
    setForm({ ...form, media: Array.from(e.target.files).slice(0, 15) as File[] });
  }

  async function handleAddWork(e: any) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.title) {
      setError('اسم العمل مطلوب');
      return;
    }
    if (form.media.length > 15) {
      setError('الحد الأقصى للملفات هو 15');
      return;
    }
    const formData = new FormData();
    formData.append('companyId', user.id);
    formData.append('title', form.title);
    formData.append('description', form.description);
    form.media.forEach(file => formData.append('media', file));
    const res = await fetch('/api/company-works', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'فشل إضافة العمل');
      return;
    }
    setSuccess('تمت إضافة العمل بنجاح');
    setForm({ title: '', description: '', media: [] });
    fetchWorks();
  }

  return (
    <>
      <Header navOnlyHome />
      <main className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">أعمال وخدمات الشركة</h1>
        {user && user.accountType === 'company' ? (
          <>
            <form onSubmit={handleAddWork} className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <input type="text" name="title" value={form.title} onChange={handleChange} className="input input-bordered w-full" placeholder="اسم العمل أو الخدمة" required />
                <input type="file" multiple accept="image/*,video/*" onChange={handleFiles} className="input input-bordered w-full" />
              </div>
              <textarea name="description" value={form.description} onChange={handleChange} className="input input-bordered w-full min-h-[80px]" placeholder="وصف العمل أو تفاصيل إضافية" />
              {error && <div className="text-red-500 text-center">{error}</div>}
              {success && <div className="text-green-600 text-center">{success}</div>}
              <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-full">إضافة العمل</button>
            </form>
            <div>
              {loading ? (
                <div className="text-center py-10">جاري التحميل...</div>
              ) : works.length === 0 ? (
                <div className="text-center text-gray-500 py-8">لا توجد أعمال مضافة بعد.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {works.map(work => (
                    <div key={work.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
                      <h2 className="text-lg font-bold mb-1">{work.title}</h2>
                      <p className="text-gray-700 mb-2">{work.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {JSON.parse(work.media || '[]').map((file: string, i: number) => (
                          file.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video key={i} src={`/company-works/${file}`} controls className="w-32 h-24 rounded object-cover" />
                          ) : (
                            <img key={i} src={`/company-works/${file}`} alt="media" className="w-24 h-24 rounded object-cover" />
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-red-500 py-10">هذه الميزة متاحة فقط لحسابات الشركات.</div>
        )}
      </main>
    </>
  );
}
