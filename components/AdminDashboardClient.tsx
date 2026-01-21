"use client";

import { useEffect, useState } from "react";
import LogDetailsModal from "./LogDetailsModal";

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
  user?: { name: string };
  item?: { name: string; description?: string; imageUrl?: string };
  request?: {
    item?: { name: string; description?: string; imageUrl?: string };
    requesterName: string;
    className: string;
    handledBy?: { name: string };
  };
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
  const [filter, setFilter] = useState<"all" | "lending" | "return">("all");
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

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
  const [addingItem, setAddingItem] = useState(false);
  const [creatingMember, setCreatingMember] = useState(false);
  const [actingRequestId, setActingRequestId] = useState<string | null>(null);
  const [approvingMemberId, setApprovingMemberId] = useState<string | null>(
    null
  );

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
    const res = await fetch(`/api/logs?period=${period}&filter=${filter}`);
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

  const [editingItem, setEditingItem] = useState<Item | null>(null);

  useEffect(() => {
    loadItems();
    loadMembers();
    loadRequests();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [period, filter]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingItem(true);
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemForm),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to add item");
      setAddingItem(false);
      return;
    }
    setItemForm({ name: "", description: "", quantity: 1, imageUrl: "" });
    await loadItems();
    alert("Item added successfully!");
    setAddingItem(false);
  };

  const updateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setAddingItem(true); // Reuse loading state
    const res = await fetch(`/api/items/${editingItem._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemForm),
    });

    if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update item");
        setAddingItem(false);
        return;
    }

    setEditingItem(null);
    setItemForm({ name: "", description: "", quantity: 1, imageUrl: "" });
    await loadItems();
    alert("Item updated successfully!");
    setAddingItem(false);
  };

  const startEdit = (item: Item) => {
    setEditingItem(item);
    setItemForm({
        name: item.name,
        description: item.description || "",
        quantity: item.quantity,
        imageUrl: item.imageUrl
    });
    // Scroll correctly to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setItemForm({ name: "", description: "", quantity: 1, imageUrl: "" });
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
    setCreatingMember(true);
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...memberForm, approved: false }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to create member");
      setCreatingMember(false);
      return;
    }
    setMemberForm({ name: "", email: "", password: "" });
    await loadMembers();
    setCreatingMember(false);
  };

  const approveMember = async (id: string) => {
    setApprovingMemberId(id);
    const res = await fetch(`/api/members/${id}/approve`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to approve");
      setApprovingMemberId(null);
      return;
    }
    await loadMembers();
    alert("Member approved successfully!");
    setApprovingMemberId(null);
  };

  const actOnRequest = async (id: string, action: "approve" | "reject" | "return") => {
    setActingRequestId(id);
    const res = await fetch(`/api/requests/${id}/${action}`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Action failed");
      setActingRequestId(null);
      return;
    }
    await loadRequests();
    alert(
      `Request ${
        action === "approve"
          ? "approved"
          : action === "return"
          ? "marked as returned"
          : "rejected"
      } successfully!`
    );
    setActingRequestId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "returned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="no-print">
        <h2 className="text-2xl font-bold text-gray-800">
          Admin Dashboard
        </h2>
      </div>

      <section className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-lg animate-slide-in no-print">
        <h3 className="font-bold mb-4 text-lg text-gray-800">
            {editingItem ? "Edit Item" : "Manage Items"}
        </h3>
        <form
          onSubmit={editingItem ? updateItem : addItem}
          className="grid gap-4 sm:grid-cols-4 text-sm mb-6"
        >
          <input
            required
            placeholder="Item name"
            className="border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#5B65DC] focus:ring-2 focus:ring-[#5B65DC]/20 transition-all"
            value={itemForm.name}
            onChange={(e) =>
              setItemForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <input
            placeholder="Description"
            className="border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#5B65DC] focus:ring-2 focus:ring-[#5B65DC]/20 transition-all"
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
            className="border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#5B65DC] focus:ring-2 focus:ring-[#5B65DC]/20 transition-all"
            value={itemForm.quantity}
            onChange={(e) =>
              setItemForm((f) => ({ ...f, quantity: Number(e.target.value) }))
            }
          />
          <input
            placeholder="Image URL (optional)"
            className="border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#5B65DC] focus:ring-2 focus:ring-[#5B65DC]/20 transition-all"
            value={itemForm.imageUrl}
            onChange={(e) =>
              setItemForm((f) => ({ ...f, imageUrl: e.target.value }))
            }
          />
          <div className="sm:col-span-4 flex gap-2">
            <button
                type="submit"
                disabled={addingItem}
                className="flex-1 inline-flex justify-center px-6 py-2.5 bg-[#5B65DC] text-white rounded-lg text-sm font-medium hover:bg-[#4A54C2] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
                {addingItem ? (editingItem ? "Updating..." : "Adding...") : (editingItem ? "Update Item" : "Add Item")}
            </button>
            {editingItem && (
                <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-2.5 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                    Cancel
                </button>
            )}
          </div>
        </form>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item._id}
              className="border-2 border-gray-200 rounded-xl p-4 flex gap-3 bg-white hover:shadow-md transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-24 h-20 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-800 truncate">
                  {item.name}
                </div>
                <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {item.description}
                </div>
                <div className="text-sm font-medium text-[#5B65DC] mt-2">
                  Qty: {item.quantity}
                </div>
              </div>
              <div className="flex flex-col gap-1 self-start">
                  <button
                    onClick={() => startEdit(item)}
                    className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-xs font-medium"
                  >
                    Delete
                  </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-4">
              No items yet.
            </p>
          )}
        </div>
      </section>

      <section className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-lg animate-slide-in no-print">
        <h3 className="font-bold mb-2 text-lg text-gray-800">Requests</h3>
        <p className="text-sm text-gray-600 mb-4">
          Approve or reject item requests submitted by students.
        </p>
        <div className="space-y-4">
          {requests.map((r, index) => (
            <div
              key={r._id}
              className="border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-gray-800">{r.item?.name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        r.status
                      )}`}
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Requester:</span>{" "}
                      {r.requesterName} ({r.className})
                    </p>
                    <p>
                      <span className="font-medium">College ID:</span>{" "}
                      {r.collegeId}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span> {r.phone}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    Requested: {new Date(r.createdAt).toLocaleString()}
                    {r.handledBy && r.handledAt && (
                      <>
                        {" • "}Handled by {r.handledBy.name} at{" "}
                        {new Date(r.handledAt).toLocaleString()}
                      </>
                    )}
                  </div>
                </div>
                {r.status === "pending" && (
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => actOnRequest(r._id, "approve")}
                      disabled={actingRequestId === r._id}
                      className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {actingRequestId === r._id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => actOnRequest(r._id, "reject")}
                      disabled={actingRequestId === r._id}
                      className="flex-1 sm:flex-none px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {actingRequestId === r._id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                )}
                {r.status === "approved" && (
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => actOnRequest(r._id, "return")}
                      disabled={actingRequestId === r._id}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {actingRequestId === r._id ? "Marking..." : "Mark Returned"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-gray-500 text-center py-4">No requests yet.</p>
          )}
        </div>
      </section>

      <section className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-lg animate-slide-in no-print">
        <h3 className="font-bold mb-4 text-lg text-gray-800">Manage Members</h3>
        <form
          onSubmit={createMember}
          className="grid gap-4 sm:grid-cols-3 text-sm mb-6"
        >
          <input
            required
            placeholder="Name"
            className="border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#5B65DC] focus:ring-2 focus:ring-[#5B65DC]/20 transition-all"
            value={memberForm.name}
            onChange={(e) =>
              setMemberForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#5B65DC] focus:ring-2 focus:ring-[#5B65DC]/20 transition-all"
            value={memberForm.email}
            onChange={(e) =>
              setMemberForm((f) => ({ ...f, email: e.target.value }))
            }
          />
          <input
            required
            type="password"
            placeholder="Temp password"
            className="border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#5B65DC] focus:ring-2 focus:ring-[#5B65DC]/20 transition-all"
            value={memberForm.password}
            onChange={(e) =>
              setMemberForm((f) => ({ ...f, password: e.target.value }))
            }
          />
          <button
            type="submit"
            disabled={creatingMember}
            className="sm:col-span-3 inline-flex justify-center px-6 py-2.5 bg-[#5B65DC] text-white rounded-lg text-sm font-medium hover:bg-[#4A54C2] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {creatingMember ? "Creating..." : "Create Member"}
          </button>
        </form>

        <div className="space-y-3">
          {members.map((m, index) => (
            <div
              key={m._id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-2 border-gray-200 rounded-lg px-4 py-3 bg-white hover:shadow-md transition-all duration-200 animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div>
                <div className="font-bold text-gray-800">{m.name}</div>
                <div className="text-sm text-gray-600">{m.email}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      m.approved ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {m.approved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
              {!m.approved && (
                <button
                  onClick={() => approveMember(m._id)}
                  disabled={approvingMemberId === m._id}
                  className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {approvingMemberId === m._id ? "Approving..." : "Approve"}
                </button>
              )}
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-gray-500 text-center py-4">No members yet.</p>
          )}
        </div>
      </section>

      <section className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-lg animate-slide-in logs-print-container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 no-print">
          <h3 className="font-bold text-lg text-gray-800">Transaction Logs</h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
               onClick={handlePrint}
               className="w-full sm:w-auto px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
               </svg>
               Print
            </button>
            <select
                className="w-full sm:w-auto border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#5B65DC] focus:ring-2 focus:ring-[#5B65DC]/20 transition-all"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
            >
                <option value="all">All Transactions</option>
                <option value="lending">Lending Requests</option>
                <option value="return">Item Returns</option>
            </select>
            <select
                className="w-full sm:w-auto border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#5B65DC] focus:ring-2 focus:ring-[#5B65DC]/20 transition-all"
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
        </div>
        <div className="space-y-2 max-h-64 overflow-auto print-full-width logs-list-container">
          {logs.map((log, index) => (
            <div
              key={log._id}
              onClick={() => setSelectedLog(log)}
              className="border-2 border-gray-200 rounded-lg px-4 py-2 flex justify-between items-center bg-gray-50 hover:bg-white transition-colors duration-200 animate-scale-in cursor-pointer hover:border-[#5B65DC]/50"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-800 text-sm">
                    {log.type === "request_created" && "New Request"}
                    {log.type === "request_approved" && "Request Approved"}
                    {log.type === "request_rejected" && "Request Rejected"}
                    {log.type === "request_returned" && "Item Returned"}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-0.5">
                  {log.request && (
                    <>
                       <div className="font-medium text-gray-800">
                        {log.request?.item?.name || log.item?.name || "Unknown Item"}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Requester:</span> {log.request.requesterName} ({log.request.className})
                      </div>
                      
                      {log.type === "request_approved" && log.request.handledBy && (
                        <div className="text-xs text-green-600">
                          Approved by {log.request.handledBy.name}
                        </div>
                      )}
                      
                      {log.type === "request_returned" && log.user && (
                         <div className="text-xs text-blue-600">
                          Marked returned by {log.user.name}
                        </div>
                      )}

                      {log.type === "request_rejected" && log.user && (
                        <div className="text-xs text-red-600">
                          Rejected by {log.user.name}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              {/* Timestamp moved to top right of card */}
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No logs for this period.
            </p>
          )}
        </div>
      </section>
      <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
