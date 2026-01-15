"use client";

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
    phone?: string;
    collegeId?: string;
    handledBy?: { name: string };
  };
  meta?: Record<string, unknown>;
}

interface LogDetailsModalProps {
  log: Log | null;
  onClose: () => void;
}

export default function LogDetailsModal({ log, onClose }: LogDetailsModalProps) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Transaction Details
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
             <div className={`p-2 rounded-lg ${
                log.type.includes("approved") ? "bg-green-100 text-green-600" :
                log.type.includes("rejected") ? "bg-red-100 text-red-600" :
                log.type.includes("returned") ? "bg-blue-100 text-blue-600" :
                "bg-yellow-100 text-yellow-600"
             }`}>
                {/* Simple Icon based on type */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {log.type.includes("approved") && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
                  {log.type.includes("rejected") && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
                  {log.type.includes("returned") && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />}
                  {log.type.includes("created") && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />}
                </svg>
             </div>
             <div>
                <div className="font-bold text-gray-800">
                    {log.type === "request_created" && "New Usage Request"}
                    {log.type === "request_approved" && "Request Approved"}
                    {log.type === "request_rejected" && "Request Rejected"}
                    {log.type === "request_returned" && "Item Returned"}
                </div>
                <div className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString(undefined, {
                        dateStyle: "full",
                        timeStyle: "medium"
                    })}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Item</label>
                <div className="font-medium text-gray-800">
                    {log.request?.item?.name || log.item?.name || "Unknown Item"}
                </div>
                {(log.request?.item?.description || log.item?.description) && (
                    <div className="text-gray-500 text-xs mt-1 line-clamp-2">
                        {log.request?.item?.description || log.item?.description}
                    </div>
                )}
                 {(log.request?.item?.imageUrl || log.item?.imageUrl) && (
                  <img 
                    src={log.request?.item?.imageUrl || log.item?.imageUrl} 
                    alt="Item" 
                    className="w-16 h-16 object-cover rounded-md mt-2 border border-gray-200"
                  />
                )}
             </div>

             {log.request && (
                 <>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Requester</label>
                        <div className="font-medium text-gray-800">{log.request.requesterName}</div>
                        <div className="text-gray-600 text-xs">{log.request.className}</div>
                    </div>
                 </>
             )}
          </div>
          
           {log.request && (log.request.phone || log.request.collegeId) && (
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {log.request.collegeId && (
                      <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">ID Number</label>
                          <div className="font-mono text-gray-700">{log.request.collegeId}</div>
                      </div>
                  )}
                  {log.request.phone && (
                      <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Contact</label>
                          <div className="font-mono text-gray-700">{log.request.phone}</div>
                      </div>
                  )}
              </div>
           )}

          {(log.user || log.request?.handledBy) && (
            <div className="pt-4 border-t border-gray-100">
                 <div className="text-sm">
                    <span className="text-gray-500">Action performed by: </span>
                    <span className="font-medium text-gray-900">
                        {log.request?.handledBy?.name || log.user?.name || "System"}
                    </span>
                 </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
}
