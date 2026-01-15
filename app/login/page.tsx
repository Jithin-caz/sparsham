"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    const from = searchParams.get("from");
    if (from) {
      router.push(from);
      return;
    }

    const role = data.user?.role as "member" | "super" | undefined;
    if (role === "super") {
      router.push("/admin/dashboard");
    } else {
      router.push("/member/dashboard");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 border-2 border-gray-200 rounded-xl p-8 bg-white shadow-xl animate-scale-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Member / Admin Login
      </h2>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Email
          </label>
          <input
            type="email"
            required
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Password
          </label>
          <input
            type="password"
            required
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-scale-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#00b4d8] text-white rounded-lg py-3 text-sm font-medium hover:bg-[#0096c7] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto mt-12 border-2 border-gray-200 rounded-xl p-8 bg-white shadow-xl">
          <h2 className="text-2xl font-bold mb-3 text-gray-800 text-center">
            Member / Admin Login
          </h2>
          <p className="text-sm text-gray-500 text-center">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
