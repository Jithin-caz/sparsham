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
  const [actingId, setActingId] = useState<string | null>(null);

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

  const actOnRequest = async (id: string, action: "approve" | "reject" | "return") => {
    setActingId(id);
    const res = await fetch(`/api/requests/${id}/${action}`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Action failed");
      setActingId(null);
      return;
    }
    await load();
    setActingId(null);
    alert(
      `Request ${
        action === "approve"
          ? "approved"
          : action === "return"
          ? "marked as returned"
          : "rejected"
      } successfully!`
    );
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Member Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          View and process item requests submitted by students.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-scale-in">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#5B65DC] text-lg">Loading...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r, index) => (
            <div
              key={r._id}
              className="border-2 border-gray-200 rounded-xl p-5 bg-white shadow-md hover:shadow-lg transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-gray-800">
                      {r.item?.name}
                    </h3>
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
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => actOnRequest(r._id, "approve")}
                      disabled={actingId === r._id}
                      className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {actingId === r._id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => actOnRequest(r._id, "reject")}
                      disabled={actingId === r._id}
                      className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {actingId === r._id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                )}
                {r.status === "approved" && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => actOnRequest(r._id, "return")}
                      disabled={actingId === r._id}
                      className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {actingId === r._id ? "Marking..." : "Mark Returned"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
              <p className="text-gray-500">No requests yet. Come back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
