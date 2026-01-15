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

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: selectedItemId, ...form }),
    });

    const data = await res.json();
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
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-2">Available Items</h2>
        {loading && <p>Loading items...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() =>
                  setSelectedItemId(
                    selectedItemId === item._id ? null : item._id
                  )
                }
                className={`flex flex-col border rounded-lg overflow-hidden text-left bg-white shadow-sm hover:shadow-md transition ${
                  selectedItemId === item._id ? "ring-2 ring-sky-500" : ""
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3 space-y-1">
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <p className="text-xs text-slate-600">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </button>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-slate-500">No items available.</p>
            )}
          </div>
        )}
      </section>

      <section className="border rounded-lg p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Request an Item</h2>
        <p className="text-xs text-slate-500 mb-3">
          Anyone can request freely. Please select an item above and fill in
          your details.
        </p>

        <form onSubmit={submitRequest} className="space-y-3">
          <div className="text-xs text-slate-600">
            Selected Item:{" "}
            {selectedItemId
              ? items.find((i) => i._id === selectedItemId)?.name
              : "None"}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="College ID"
              className="border rounded px-2 py-1 text-sm"
              value={form.collegeId}
              onChange={(e) =>
                setForm((f) => ({ ...f, collegeId: e.target.value }))
              }
            />
            <input
              required
              placeholder="Name"
              className="border rounded px-2 py-1 text-sm"
              value={form.requesterName}
              onChange={(e) =>
                setForm((f) => ({ ...f, requesterName: e.target.value }))
              }
            />
            <input
              required
              placeholder="Class"
              className="border rounded px-2 py-1 text-sm"
              value={form.className}
              onChange={(e) =>
                setForm((f) => ({ ...f, className: e.target.value }))
              }
            />
            <input
              required
              placeholder="Phone"
              className="border rounded px-2 py-1 text-sm"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            className="mt-1 inline-flex items-center px-3 py-1.5 bg-sky-700 text-white rounded text-sm hover:bg-sky-800"
          >
            Submit Request
          </button>

          {message && (
            <p className="text-sm text-emerald-600 mt-2">{message}</p>
          )}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </form>
      </section>
    </div>
  );
}
