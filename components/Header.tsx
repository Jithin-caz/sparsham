"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      setIsMenuOpen(false);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="bg-[#00b4d8] text-white p-4 shadow-lg shadow-[#00b4d8]/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
            <img src="/club_logo.png" alt="Club Logo" className="h-10 w-auto rounded-full bg-white shadow-sm" />
            <h1 className="font-bold text-xl tracking-tight">
            SPARSHAM MACE
            </h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 text-sm items-center">
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-2 border-t border-white/20 mt-4 animate-slide-in">
          <nav className="flex flex-col space-y-2">
            <a
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors font-medium"
            >
              Home
            </a>
            {!isLoggedIn ? (
              <a
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors font-medium"
              >
                Member Login
              </a>
            ) : (
              <>
                <a
                  href="/member/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors font-medium"
                >
                  Member Dashboard
                </a>
                <a
                  href="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors font-medium"
                >
                  Admin
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg transition-colors font-medium text-white/90"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
