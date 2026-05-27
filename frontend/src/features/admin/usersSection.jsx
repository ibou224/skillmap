"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { UserToolbar } from "@/components/users/userToolbar";
import { UserTable } from "@/components/users/UserTable";
import { UserModal } from "@/components/users/UserModal";
import { useManagementUser } from "@/hooks/useManagementUser";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessAlert from "@/components/ui/SuccessAlert";

const PAGE_SIZE = 10;

export default function UsersSection() {
  const { users, getUsers, updateUser, deleteUser } = useManagementUser();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("tous");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(q);
    const matchRole = filterRole === "tous" || u.role?.toLowerCase() === filterRole;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearchChange = (v) => { setSearch(v); setPage(1); };
  const handleFilterChange = (v) => { setFilterRole(v); setPage(1); };

  const openAdd = () => {
    setEditUser(null);
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setShowModal(true);
  };

  const toggleStatus = async (id) => {
    const u = users.find((u) => u.id === id);
    if (!u) return;
    await updateUser(id, { estActif: !u.isActive, role: u.role });
    await getUsers();
  };

  const handleDelete = (id) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    const u = users.find((u) => u.id === pendingDeleteId);
    setIsDeleting(true);
    await deleteUser(pendingDeleteId);
    await getUsers();
    setIsDeleting(false);
    setPendingDeleteId(null);
    if (u) setSuccessMessage(`Le compte de ${u.prenom} ${u.nom} a été désactivé.`);
  };

  return (
    <div className="space-y-6">
      <Banner
        title="Utilisateurs"
        description="Gestion des professeurs, RH et administrateurs."
      />

      {successMessage && (
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <UserToolbar
        search={search}
        onSearchChange={handleSearchChange}
        filterRole={filterRole}
        onFilterChange={handleFilterChange}
        onAdd={openAdd}
      />

      <UserTable
        users={paginated}
        onToggleStatus={toggleStatus}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-400">
            {filtered.length} utilisateurs — page {currentPage} / {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`e-${i}`} className="px-1 text-slate-400 text-xs">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition
                      ${p === currentPage ? "bg-[hsl(134,35%,45%)] text-white" : "hover:bg-slate-100 text-slate-500"}`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}

      <UserModal
        key={editUser?.id ?? (showModal ? "new" : "closed")}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userToEdit={editUser}
        onSuccess={(result) => {
          setShowModal(false);
          getUsers();
          if (result?.message) setSuccessMessage(result.message);
        }}
      />

      <ConfirmModal
        isOpen={pendingDeleteId !== null}
        title="Désactiver l'utilisateur"
        message={(() => {
          const u = users.find((u) => u.id === pendingDeleteId);
          return u
            ? `Voulez-vous vraiment désactiver le compte de ${u.prenom} ${u.nom} ? L'utilisateur ne pourra plus se connecter.`
            : "Voulez-vous vraiment désactiver cet utilisateur ?";
        })()}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
