import React, { useCallback, useEffect, useState } from "react";
import { FiUsers, FiShield, FiSearch } from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner,
  StatCards,
  Panel,
  PanelHeader,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  Toast,
} from "../DashboardUI";
import { pageWrapClass, inputClass } from "../dashboardTheme";
import { useAuth } from "../../../app/AuthContext";
import { InviteUserModal } from "./InviteUserModal";
import { DeactivateUserModal } from "./DeactivateUserModal";
import { UserActionsMenu } from "./UserActionsMenu";
import { UserListPagination, PAGE_SIZE } from "./UserListPagination";

function statusVariant(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "ok";
  if (s === "inactive" || s === "pending") return "warn";
  return "danger";
}

function formatRole(role) {
  if (!role) return "—";
  return String(role).replace(/_/g, " ");
}

const defaultStats = {
  total: 0,
  active: 0,
  inactive: 0,
  suspended: 0,
};

const defaultPagination = {
  total: 0,
  limit: PAGE_SIZE,
  offset: 0,
  page: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export const UserControl = () => {
  const { user } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(defaultStats);
  const [pagination, setPagination] = useState(defaultPagination);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [statusModal, setStatusModal] = useState({
    open: false,
    user: null,
    mode: "deactivate",
  });

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchUsers = useCallback(
    async (targetPage = page) => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/admin/users", {
          params: {
            limit: PAGE_SIZE,
            offset: (targetPage - 1) * PAGE_SIZE,
            page: targetPage,
            search: debouncedSearch || undefined,
          },
        });

        setUsers(Array.isArray(data?.users) ? data.users : []);
        setPagination(data?.pagination ?? defaultPagination);
        setStats(data?.stats ?? defaultStats);
      } catch {
        setUsers([]);
        setPagination(defaultPagination);
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    },
    [page, debouncedSearch],
  );

  useEffect(() => {
    fetchUsers(page);
  }, [page, debouncedSearch, fetchUsers]);

  const handleInviteSuccess = () => {
    setToast("Invitation sent successfully");
    setPage(1);
    fetchUsers(1);
    window.setTimeout(() => setToast(""), 4000);
  };

  const openStatusModal = (targetUser, mode) => {
    setStatusModal({ open: true, user: targetUser, mode });
  };

  const closeStatusModal = () => {
    setStatusModal({ open: false, user: null, mode: "deactivate" });
  };

  const handleStatusSuccess = (action) => {
    setToast(
      action === "reactivate"
        ? "User reactivated successfully"
        : "User deactivated successfully",
    );
    fetchUsers(page);
    window.setTimeout(() => setToast(""), 4000);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  const totalUsers = stats.total;
  const activeCount = stats.active;
  const inactiveCount = stats.inactive;
  const suspendedCount = stats.suspended;

  return (
    <div className={pageWrapClass}>
      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={handleInviteSuccess}
      />

      <DeactivateUserModal
        open={statusModal.open}
        user={statusModal.user}
        mode={statusModal.mode}
        onClose={closeStatusModal}
        onSuccess={handleStatusSuccess}
      />

      <WelcomeBanner
        badge="User Control"
        title="Manage accounts & roles"
        description="Create users, assign RBAC roles, and monitor account status across the institute."
        actions={
          <>
            <PrimaryButton type="button" onClick={() => setInviteOpen(true)}>
              Invite User
            </PrimaryButton>
          </>
        }
      />

      <StatCards
        stats={[
          {
            label: "Total Users",
            value: String(totalUsers),
            change: loading ? "Loading…" : "All accounts",
            icon: <FiUsers className="w-5 h-5" />,
          },
          {
            label: "Active",
            value: String(activeCount),
            change: totalUsers
              ? `${Math.round((activeCount / totalUsers) * 100) || 0}%`
              : "—",
            icon: <FiShield className="w-5 h-5" />,
          },
          {
            label: "Pending activation",
            value: String(inactiveCount),
            change: "Invited, not activated",
            icon: <FiUsers className="w-5 h-5" />,
          },
          {
            label: "Suspended",
            value: String(suspendedCount),
            change: "Restricted access",
            icon: <FiShield className="w-5 h-5" />,
          },
        ]}
      />

      <Panel>
        <PanelHeader
          eyebrow="Directory"
          title="All users"
          action={
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="search"
                placeholder="Search by name or email…"
                className={`${inputClass} pl-9`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          }
        />

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.08] text-[#94a3b8] uppercase tracking-wider">
                <th className="pb-3 font-bold px-2">User</th>
                <th className="pb-3 font-bold px-2">Role</th>
                <th className="pb-3 font-bold px-2">Status</th>
                <th className="pb-3 font-bold px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-[#94a3b8] font-semibold"
                  >
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-[#94a3b8] font-semibold"
                  >
                    {debouncedSearch
                      ? "No users match your search"
                      : "No users found"}
                  </td>
                </tr>
              ) : (
                users.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-black/[0.04] hover:bg-[#fafafa]"
                  >
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.name || row.email)}`}
                          alt=""
                          className="w-8 h-8 rounded-lg"
                        />
                        <div>
                          <p className="font-bold text-[#0c0407]">{row.name}</p>
                          <p className="text-[#94a3b8] font-semibold mt-0.5">
                            {row.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 font-bold text-[#475569]">
                      {formatRole(row.role)}
                    </td>
                    <td className="py-3.5 px-2">
                      <StatusBadge variant={statusVariant(row.status)}>
                        {row.status}
                      </StatusBadge>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <UserActionsMenu
                        user={row}
                        currentUserId={user?.id}
                        onDeactivate={(target) =>
                          openStatusModal(target, "deactivate")
                        }
                        onReactivate={(target) =>
                          openStatusModal(target, "reactivate")
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <UserListPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          offset={pagination.offset}
          onPageChange={handlePageChange}
          loading={loading}
        />

        <p className="text-[10px] text-[#94a3b8] font-semibold mt-2">
          Signed in as {user?.name || "Administrator"}
        </p>
      </Panel>

      <Toast message={toast} />
    </div>
  );
};

export default UserControl;
