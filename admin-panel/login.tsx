"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/admin-panel/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "فشل تسجيل الدخول");
      return;
    }
    // تخزين جلسة الأدمن
    if (typeof window !== "undefined") {
      localStorage.setItem("admin", JSON.stringify({ username }));
    }
    router.push("/admin-panel/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-center mb-2">تسجيل دخول الأدمن</h2>
        <input type="text" className="input input-bordered w-full" placeholder="اسم الأدمن" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" className="input input-bordered w-full" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button type="submit" className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-3 rounded-full text-lg shadow transition-all">دخول</button>
      </form>
    </main>
  );
}
