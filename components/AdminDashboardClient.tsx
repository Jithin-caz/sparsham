"use client";

import { useEffect, useState } from "react";

interface Item {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  imageUrl: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  approved: boolean;
}

interface Log {
  _id: string;
  type: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

interface RequestItem {
  _id: string;
  name: string;
}

interface Request {
  _id: string;
  item: RequestItem;
  collegeId: string;
  requesterName: string;
  className: string;
  phone: string;
  status: string;
  createdAt: string;
  handledBy?: { name: string };
  handledAt?: string;
}

export default function AdminDashboardClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">(
    "weekly"
  );

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    quantity: 1,
    imageUrl: "",
  });

  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const loadItems = async () => {
    const res = await fetch("/api/items");
    const data = await res.json();
    setItems(data);
  };
  const loadMembers = async () => {
    const res = await fetch("/api/members");
    if (!res.ok) return;
    const data = await res.json();
    setMembers(data);
  };
  const loadLogs = async () => {
    const res = await fetch(`/api/logs?period=${period}`);
    if (!res.ok) return;
    const data = await res.json();
    setLogs(data);
  };
  const loadRequests = async () => {
    const res = await fetch("/api/requests");
    if (!res.ok) return;
    const data = await res.json();
    setRequests(data);
  };

  useEffect(() => {
    loadItems();
    loadMembers();
    loadRequests();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [period]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemForm),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to add item");
      return;
    }
    setItemForm({ name: "", description: "", quantity: 1, imageUrl: "" });
    await loadItems();
    alert("Item added successfully!");
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete");
      return;
    }
    await loadItems();
  };

  const createMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...memberForm, approved: false }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to create member");
      return;
    }
    setMemberForm({ name: "", email: "", password: "" });
    await loadMembers();
  };

  const approveMember = async (id: string) => {
    const res = await fetch(`/api/members/${id}/approve`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to approve");
      return;
    }
    await loadMembers();
    alert("Member approved successfully!");
  };

  const actOnRequest = async (id: string, action: "approve" | "reject") => {
    const res = await fetch(`/api/requests/${id}/${action}`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Action failed");
      return;
    }
    await loadRequests();
    alert(
      `Request ${action === "approve" ? "approved" : "rejected"} successfully!`
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Admin Dashboard (Super User)</h2>

      <section className="border rounded-lg p-3 bg-white shadow-sm">
        <h3 className="font-semibold mb-2 text-sm">Manage Items</h3>
        <form onSubmit={addItem} className="grid gap-2 sm:grid-cols-4 text-sm">
          <input
            required
            placeholder="Item name"
            className="border rounded px-2 py-1"
            value={itemForm.name}
            onChange={(e) =>
              setItemForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <input
            placeholder="Description"
            className="border rounded px-2 py-1"
            value={itemForm.description}
            onChange={(e) =>
              setItemForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <input
            type="number"
            min={0}
            required
            placeholder="Quantity"
            className="border rounded px-2 py-1"
            value={itemForm.quantity}
            onChange={(e) =>
              setItemForm((f) => ({ ...f, quantity: Number(e.target.value) }))
            }
          />
          <input
            placeholder="Image URL (optional)"
            className="border rounded px-2 py-1"
            value={itemForm.imageUrl}
            onChange={(e) =>
              setItemForm((f) => ({ ...f, imageUrl: e.target.value }))
            }
          />
          <button
            type="submit"
            className="mt-2 sm:mt-0 sm:col-span-4 inline-flex justify-center px-3 py-1.5 bg-sky-700 text-white rounded text-sm hover:bg-sky-800"
          >
            Add Item
          </button>
        </form>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item._id}
              className="border rounded-lg p-2 flex gap-2 text-xs"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-20 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-slate-600">{item.description}</div>
                <div className="text-slate-500">
                  Qty: <b>{item.quantity}</b>
                </div>
              </div>
              <button
                onClick={() => deleteItem(item._id)}
                className="self-start px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-slate-500">No items yet.</p>
          )}
        </div>
      </section>

      <section className="border rounded-lg p-3 bg-white shadow-sm">
        <h3 className="font-semibold mb-2 text-sm">Requests</h3>
        <p className="text-xs text-slate-600 mb-2">
          Approve or reject item requests submitted by students.
        </p>
        <div className="space-y-3 text-sm">
          {requests.map((r) => (
            <div
              key={r._id}
              className="border rounded-lg p-3 bg-slate-50 flex justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="font-semibold">{r.item?.name}</div>
                <div className="text-xs text-slate-600">
                  {r.requesterName} ({r.className}) – {r.collegeId}
                </div>
                <div className="text-xs text-slate-500">
                  Phone: {r.phone} | Status:{" "}
                  <span className="font-medium">{r.status}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Requested: {new Date(r.createdAt).toLocaleString()}
                  {r.handledBy && r.handledAt && (
                    <>
                      {" "}
                      | Handled by {r.handledBy.name} at{" "}
                      {new Date(r.handledAt).toLocaleString()}
                    </>
                  )}
                </div>
              </div>
              {r.status === "pending" && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => actOnRequest(r._id, "approve")}
                    className="px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => actOnRequest(r._id, "reject")}
                    className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-xs text-slate-500">No requests yet.</p>
          )}
        </div>
      </section>

      <section className="border rounded-lg p-3 bg-white shadow-sm">
        <h3 className="font-semibold mb-2 text-sm">Manage Members</h3>
        <form
          onSubmit={createMember}
          className="grid gap-2 sm:grid-cols-3 text-sm mb-3"
        >
          <input
            required
            placeholder="Name"
            className="border rounded px-2 py-1"
            value={memberForm.name}
            onChange={(e) =>
              setMemberForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="border rounded px-2 py-1"
            value={memberForm.email}
            onChange={(e) =>
              setMemberForm((f) => ({ ...f, email: e.target.value }))
            }
          />
          <input
            required
            type="password"
            placeholder="Temp password"
            className="border rounded px-2 py-1"
            value={memberForm.password}
            onChange={(e) =>
              setMemberForm((f) => ({ ...f, password: e.target.value }))
            }
          />
          <button
            type="submit"
            className="mt-2 sm:mt-0 sm:col-span-3 inline-flex justify-center px-3 py-1.5 bg-sky-700 text-white rounded text-sm hover:bg-sky-800"
          >
            Create Member
          </button>
        </form>

        <div className="space-y-2 text-xs">
          {members.map((m) => (
            <div
              key={m._id}
              className="flex justify-between items-center border rounded px-2 py-1"
            >
              <div>
                <div className="font-semibold">{m.name}</div>
                <div className="text-slate-600">{m.email}</div>
                <div className="text-slate-500">
                  Status:{" "}
                  <span className="font-medium">
                    {m.approved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
              {!m.approved && (
                <button
                  onClick={() => approveMember(m._id)}
                  className="px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  Approve
                </button>
              )}
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-xs text-slate-500">No members yet.</p>
          )}
        </div>
      </section>

      <section className="border rounded-lg p-3 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-sm">Transaction Logs</h3>
          <select
            className="border rounded px-2 py-1 text-xs"
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value as "weekly" | "monthly" | "yearly")
            }
          >
            <option value="weekly">Last 7 days</option>
            <option value="monthly">Last 1 month</option>
            <option value="yearly">Last 1 year</option>
          </select>
        </div>
        <div className="space-y-1 text-xs max-h-64 overflow-auto">
          {logs.map((log) => (
            <div
              key={log._id}
              className="border rounded px-2 py-1 flex justify-between"
            >
              <span>{log.type}</span>
              <span className="text-slate-500">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-xs text-slate-500">No logs for this period.</p>
          )}
        </div>
      </section>
    </div>
  );
}
