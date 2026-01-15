"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by trying to fetch a protected endpoint
    fetch("/api/requests")
      .then((res) => {
        setIsLoggedIn(res.ok);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });
    if (res.ok) {
      setIsLoggedIn(false);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="bg-sky-800 text-white p-4 shadow">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <h1 className="font-semibold text-lg">
          Palliative Care Club Inventory
        </h1>
        <nav className="space-x-4 text-sm flex items-center">
          <a href="/" className="hover:underline">
            Home
          </a>
          {!isLoggedIn ? (
            <a href="/login" className="hover:underline">
              Member Login
            </a>
          ) : (
            <>
              <a href="/member/dashboard" className="hover:underline">
                Member Dashboard
              </a>
              <a href="/admin/dashboard" className="hover:underline">
                Admin
              </a>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
