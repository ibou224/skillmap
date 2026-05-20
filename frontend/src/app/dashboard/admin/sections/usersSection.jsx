"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/Banner";
import { UserToolbar } from "@/components/user/userToolbar";
import { UserTable } from "@/components/user/UserTable";
import { UserModal } from "@/components/user/UserModal";
import { useManagementUser } from "@/hooks/useManagementUser";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessAlert from "@/components/ui/SuccessAlert";

export default function UsersSection() {
  const { users, getUsers, updateUser, deleteUser } = useManagementUser();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("tous");
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
        onSearchChange={setSearch}
        filterRole={filterRole}
        onFilterChange={setFilterRole}
        onAdd={openAdd}
      />

      <UserTable
        users={filtered}
        onToggleStatus={toggleStatus}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

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
