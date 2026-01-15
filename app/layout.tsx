import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "Sparsham MACE",
  description: "Manage and request palliative care equipment stock",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 max-w-6xl mx-auto w-full p-6 animate-fade-in">
            {children}
          </main>
          <footer className="bg-gray-50 border-t border-gray-200 text-xs text-center py-4 text-gray-500">
            SPARSHAM MACE
          </footer>
        </div>
      </body>
    </html>
  );
}
