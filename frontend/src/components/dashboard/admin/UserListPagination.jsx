import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { secondaryBtnClass } from "../dashboardTheme";

export const PAGE_SIZE = 10;

export function UserListPagination({
  page,
  totalPages,
  total,
  limit = PAGE_SIZE,
  offset = 0,
  onPageChange,
  loading = false,
}) {
  if (total === 0) return null;

  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);
  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-black/[0.08]">
      <p className="text-[11px] font-semibold text-[#94a3b8]">
        Showing <span className="text-[#0c0407]">{from}</span>–
        <span className="text-[#0c0407]">{to}</span> of{" "}
        <span className="text-[#0c0407]">{total}</span> users
      </p>

      <nav
        className="flex items-center gap-1.5"
        aria-label="User list pagination"
      >
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={`${secondaryBtnClass} !px-3 !py-2 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="Previous page"
        >
          <FiChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) =>
            p === "…" ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 text-center text-xs font-bold text-[#94a3b8]"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                disabled={loading}
                onClick={() => onPageChange(p)}
                className={`min-w-[36px] h-9 px-2 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-40 ${
                  p === page
                    ? "bg-gradient-to-r from-rose-500 to-[#fc362d] text-white shadow-sm"
                    : "text-[#475569] border border-black/10 bg-white hover:bg-[#f8fafc]"
                }`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          disabled={loading || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`${secondaryBtnClass} !px-3 !py-2 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <FiChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}

function buildPageNumbers(current, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

export default UserListPagination;
