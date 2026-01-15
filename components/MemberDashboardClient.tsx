"use client";

import { useEffect, useState } from "react";

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

export default function MemberDashboardClient() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/requests");
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to load requests");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const actOnRequest = async (id: string, action: "approve" | "reject") => {
    const res = await fetch(`/api/requests/${id}/${action}`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Action failed");
      return;
    }
    await load();
    alert(`Request ${action === "approve" ? "approved" : "rejected"} successfully!`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Member Dashboard</h2>
      <p className="text-xs text-slate-600">
        View and process item requests submitted by students.
      </p>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r._id}
              className="border rounded-lg p-3 bg-white shadow-sm text-sm flex justify-between gap-3"
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
            <p className="text-sm text-slate-500">
              No requests yet. Come back later.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
