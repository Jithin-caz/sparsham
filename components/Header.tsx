"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
    <header className="bg-[#00b4d8] text-white p-4 shadow-lg shadow-[#00b4d8]/20">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="font-bold text-xl tracking-tight">
          Palliative Care Club Inventory
        </h1>
        <nav className="space-x-4 text-sm flex items-center">
          <a
            href="/"
            className="hover:text-[#90e0ef] transition-colors duration-200 font-medium"
          >
            Home
          </a>
          {!isLoggedIn ? (
            <a
              href="/login"
              className="hover:text-[#90e0ef] transition-colors duration-200 font-medium"
            >
              Member Login
            </a>
          ) : (
            <>
              <a
                href="/member/dashboard"
                className="hover:text-[#90e0ef] transition-colors duration-200 font-medium"
              >
                Member Dashboard
              </a>
              <a
                href="/admin/dashboard"
                className="hover:text-[#90e0ef] transition-colors duration-200 font-medium"
              >
                Admin
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 bg-white text-[#00b4d8] hover:bg-[#90e0ef] hover:text-white rounded-lg text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md"
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
