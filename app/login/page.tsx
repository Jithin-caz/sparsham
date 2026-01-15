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

    // If we came from a protected route, go back there
    const from = searchParams.get("from");
    if (from) {
      router.push(from);
      return;
    }

    // Otherwise, route based on role
    const role = data.user?.role as "member" | "super" | undefined;
    if (role === "super") {
      router.push("/admin/dashboard");
    } else {
      router.push("/member/dashboard");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Member / Admin Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-xs mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full border rounded px-2 py-1 text-sm"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full border rounded px-2 py-1 text-sm"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 bg-sky-700 text-white rounded py-1.5 text-sm hover:bg-sky-800 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="max-w-sm mx-auto mt-10 border rounded-lg p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Member / Admin Login</h2>
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
