"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRegister() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/admin-panel/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "فشل إنشاء الأدمن");
      return;
    }
    setSuccess("تم إنشاء حساب الأدمن بنجاح! يمكنك تسجيل الدخول الآن.");
    setTimeout(() => router.push("/admin-panel/login"), 1500);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-center mb-2">تسجيل أدمن جديد</h2>
        <input type="text" className="input input-bordered w-full" placeholder="اسم الأدمن" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="email" className="input input-bordered w-full" placeholder="البريد الإلكتروني (اختياري)" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" className="input input-bordered w-full" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="text-green-600 text-center font-bold text-lg py-2">{success}</div>}
        <button type="submit" className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-3 rounded-full text-lg shadow transition-all">تسجيل</button>
      </form>
    </main>
  );
}
