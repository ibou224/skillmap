"use client";

import { useState } from "react";
import {
  Users, Search, Plus, Trash2, Edit2,
  CheckCircle2, XCircle, Shield, User, GraduationCap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "admin" | "rh" | "professeur";
type Status = "actif" | "inactif";

interface UserEntry {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: Role;
  status: Status;
  cvUploaded: boolean;
  createdAt: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockUsers: UserEntry[] = [
  { id: 1,  prenom: "Sophie",  nom: "Martin",   email: "s.martin@cite.qc.ca",   role: "admin",     status: "actif",   cvUploaded: false, createdAt: "2024-08-01" },
  { id: 2,  prenom: "Jean",    nom: "Dupont",   email: "j.dupont@cite.qc.ca",   role: "professeur",status: "actif",   cvUploaded: true,  createdAt: "2024-08-15" },
  { id: 3,  prenom: "Marie",   nom: "Tremblay", email: "m.tremblay@cite.qc.ca", role: "rh",        status: "actif",   cvUploaded: false, createdAt: "2024-09-01" },
  { id: 4,  prenom: "Pierre",  nom: "Gagnon",   email: "p.gagnon@cite.qc.ca",   role: "professeur",status: "inactif", cvUploaded: true,  createdAt: "2023-01-10" },
  { id: 5,  prenom: "Léa",     nom: "Bernard",  email: "l.bernard@cite.qc.ca",  role: "professeur",status: "actif",   cvUploaded: true,  createdAt: "2024-10-05" },
  { id: 6,  prenom: "Marc",    nom: "Leblanc",  email: "m.leblanc@cite.qc.ca",  role: "professeur",status: "actif",   cvUploaded: false, createdAt: "2025-01-20" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const roleMeta: Record<Role, { label: string; color: string; icon: React.ReactNode }> = {
  admin:      { label: "Admin",      color: "bg-violet-100 text-violet-700", icon: <Shield className="w-3 h-3" />       },
  rh:         { label: "RH",         color: "bg-blue-100 text-blue-700",     icon: <Users className="w-3 h-3" />        },
  professeur: { label: "Professeur", color: "bg-emerald-100 text-emerald-700",icon: <GraduationCap className="w-3 h-3" />},
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white";

// ─── Composant ────────────────────────────────────────────────────────────────
export default function UsersSection() {
  const [users, setUsers]           = useState<UserEntry[]>(mockUsers);
  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState<Role | "tous">("tous");
  const [showModal, setShowModal]   = useState(false);
  const [editUser, setEditUser]     = useState<UserEntry | null>(null);

  const [form, setForm] = useState({ prenom: "", nom: "", email: "", role: "professeur" as Role });

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(q);
    const matchRole   = filterRole === "tous" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setEditUser(null);
    setForm({ prenom: "", nom: "", email: "", role: "professeur" });
    setShowModal(true);
  };

  const openEdit = (u: UserEntry) => {
    setEditUser(u);
    setForm({ prenom: u.prenom, nom: u.nom, email: u.email, role: u.role });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.prenom || !form.nom || !form.email) return;
    if (editUser) {
      setUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, ...form } : u));
    } else {
      setUsers((prev) => [
        ...prev,
        { id: Date.now(), ...form, status: "actif", cvUploaded: false, createdAt: new Date().toISOString().slice(0, 10) },
      ]);
    }
    setShowModal(false);
  };

  const toggleStatus = (id: number) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "actif" ? "inactif" : "actif" } : u));

  const deleteUser = (id: number) =>
    setUsers((prev) => prev.filter((u) => u.id !== id));

  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <h1 className="relative text-2xl sm:text-3xl font-black text-white">Utilisateurs</h1>
        <p className="relative text-white/70 text-sm mt-1">Gestion des professeurs, RH et administrateurs.</p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Rechercher un utilisateur…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as Role | "tous")}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white"
        >
          <option value="tous">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="rh">RH</option>
          <option value="professeur">Professeur</option>
        </select>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Nom</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Rôle</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">CV</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => {
                const rm = roleMeta[u.role];
                return (
                  <tr key={u.id} className="hover:bg-slate-50/40 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-xs font-bold text-[hsl(134,35%,45%)]">
                          {u.prenom[0]}{u.nom[0]}
                        </div>
                        <span className="font-semibold text-gray-700">{u.prenom} {u.nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${rm.color}`}>
                        {rm.icon} {rm.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {u.cvUploaded
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        : <XCircle className="w-4 h-4 text-slate-300" />}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg transition ${
                          u.status === "actif"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                      >
                        {u.status === "actif" ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="text-slate-400 hover:text-[hsl(134,35%,45%)] transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="text-slate-400 hover:text-red-500 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-400">
          {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Modal ajout/édition ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-gray-700">
                {editUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prénom</label>
                  <input value={form.prenom} onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))} className={inputCls} placeholder="Jean" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nom</label>
                  <input value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} className={inputCls} placeholder="Dupont" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="jean@cite.qc.ca" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rôle</label>
                <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as Role }))} className={inputCls}>
                  <option value="professeur">Professeur</option>
                  <option value="rh">RH</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Annuler</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition">
                {editUser ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}