import React, { useEffect, useRef, useState } from "react";
import { FiMoreVertical, FiUserX, FiUserCheck } from "react-icons/fi";

export function UserActionsMenu({
  user: row,
  currentUserId,
  onDeactivate,
  onReactivate,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const isSelf = row.id === currentUserId;
  const isSuspended = row.status === "suspended";
  const isAdmin = row.role === "ADMIN";

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleDeactivate = () => {
    setOpen(false);
    onDeactivate(row);
  };

  const handleReactivate = () => {
    setOpen(false);
    onReactivate(row);
  };

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`p-2 rounded-lg transition-colors cursor-pointer ${
          open
            ? "bg-[#f1f5f9] text-[#0c0407]"
            : "hover:bg-[#f1f5f9] text-[#94a3b8]"
        }`}
        aria-label="User actions"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <FiMoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 w-52 bg-white border border-black/[0.08] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-1.5 z-50 animate-fade-in"
        >
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider px-3 py-2">
            Options
          </p>

          {isSuspended ? (
            <button
              type="button"
              role="menuitem"
              onClick={handleReactivate}
              disabled={isSelf}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-[#059669] rounded-xl hover:bg-[#ecfdf5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiUserCheck className="w-4 h-4 shrink-0" />
              Reactivate user
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={handleDeactivate}
              disabled={isSelf || isAdmin}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-[#b91c1c] rounded-xl hover:bg-[#fef2f2] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiUserX className="w-4 h-4 shrink-0" />
              Deactivate user
            </button>
          )}

          {(isSelf || isAdmin) && !isSuspended && (
            <p className="text-[10px] text-[#94a3b8] font-semibold px-3 py-2 border-t border-black/[0.06] mt-1">
              {isSelf
                ? "You cannot deactivate your own account."
                : "Administrator accounts cannot be deactivated."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default UserActionsMenu;
