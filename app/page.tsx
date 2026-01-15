"use client";

import { useEffect, useState } from "react";

interface Item {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  imageUrl: string;
}

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    collegeId: "",
    requesterName: "",
    className: "",
    phone: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch(() => setError("Failed to load items"))
      .finally(() => setLoading(false));
  }, []);

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!selectedItemId) {
      setError("Please select an item");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: selectedItemId, ...form }),
    });

    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Failed to submit request");
    } else {
      setMessage("Request submitted successfully");
      setForm({
        collegeId: "",
        requesterName: "",
        className: "",
        phone: "",
      });
      setSelectedItemId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Available Items</h2>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#00b4d8] text-lg">Loading items...</div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-scale-in">
            {error}
          </div>
        )}
        {!loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <button
                key={item._id}
                type="button"
                onClick={() =>
                  setSelectedItemId(
                    selectedItemId === item._id ? null : item._id
                  )
                }
                className={`flex flex-col border-2 rounded-xl overflow-hidden text-left bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-scale-in ${
                  selectedItemId === item._id
                    ? "ring-2 ring-[#00b4d8] border-[#00b4d8] shadow-[#00b4d8]/20"
                    : "border-gray-200 hover:border-[#00b4d8]/50"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="p-4 space-y-2">
                  <div className="font-semibold text-gray-800">{item.name}</div>
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <p className="text-sm font-medium text-[#00b4d8]">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </button>
            ))}
            {items.length === 0 && (
              <p className="text-gray-500 col-span-full text-center py-8">
                No items available.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Modal for Requesting Item */}
      {selectedItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-xl text-gray-800">
                Request {items.find((i) => i._id === selectedItemId)?.name}
              </h3>
              <button
                onClick={() => setSelectedItemId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                Please fill in your details to request this item.
              </p>

              <form onSubmit={submitRequest} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">College ID</label>
                    <input
                      required
                      placeholder="e.g. 23BCA23"
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all outline-none"
                      value={form.collegeId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, collegeId: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      required
                      placeholder="John Doe"
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all outline-none"
                      value={form.requesterName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, requesterName: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Class/Department</label>
                    <input
                      required
                      placeholder="BCA 2nd Year"
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all outline-none"
                      value={form.className}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, className: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      required
                      placeholder="Phone"
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all outline-none"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                   <button
                    type="button"
                    onClick={() => setSelectedItemId(null)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#00b4d8] text-white rounded-lg text-sm font-medium hover:bg-[#0096c7] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting && (
                      <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                    )}
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>

                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
