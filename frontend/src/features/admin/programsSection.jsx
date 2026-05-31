"use client";

/**
 * @module features/admin/programsSection
 * @description Section de gestion des programmes (admin) : liste, recherche,
 * création/édition/suppression via {@link module:hooks/usePrograms}.
 * @returns {ReactNode} La section de gestion des programmes.
 */

import { useEffect, useState } from "react";
import {
  BookOpen, Loader2, Search, Building2, Layers,
  PlusCircle, ChevronLeft, ChevronRight, Pencil, Trash2,
} from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessAlert from "@/components/ui/SuccessAlert";
import ProgramModal from "@/components/programs/ProgramModal";
import { usePrograms } from "@/hooks/usePrograms";
import  EmptyState from "@/components/programs/EmptyState";
import ProgramRow from "@/components/programs/ProgramRow";

const PAGE_SIZE = 10;


export default function ProgramsSection() {
  const {
    programs, departements, isLoading, error,
    fetchPrograms, fetchDepartements,
    createProgram, updateProgram, deleteProgram,
  } = usePrograms();

  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);
  const [showModal, setShowModal]         = useState(false);
  const [editProgram, setEditProgram]     = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formError, setFormError]         = useState(null);
  const [fieldErrors, setFieldErrors]     = useState({});

  useEffect(() => {
    fetchPrograms();
    fetchDepartements();
  }, [fetchPrograms, fetchDepartements]);

  const filtered = programs.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nom?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.departement?.nom?.toLowerCase().includes(q)
    );
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };

  const openAdd  = () => { setEditProgram(null); setFormError(null); setFieldErrors({}); setShowModal(true); };
  const openEdit = (p) => { setEditProgram(p);    setFormError(null); setFieldErrors({}); setShowModal(true); };

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const result = editProgram
      ? await updateProgram(editProgram.id, payload)
      : await createProgram(payload);

    setIsSubmitting(false);

    if (!result.success) {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      } else {
        setFormError(result.message || "Une erreur est survenue.");
      }
      return;
    }

    setShowModal(false);
    setSuccessMessage(result.message);
    fetchPrograms();
  };


  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    const result = await deleteProgram(pendingDelete.id);
    setIsDeleting(false);
    setPendingDelete(null);

    if (!result.success) {
      setSuccessMessage(null);
      return;
    }
    setSuccessMessage(result.message);
    fetchPrograms();
  };

  return (
    <div className="space-y-6">
      <Banner
        title="Programmes"
        description="Programmes d'études et leur structure par département."
      />

      {successMessage && (
        <SuccessAlert message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      {/* Erreur de chargement */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
          <span className="font-semibold">Erreur :</span> {error}
          <button onClick={fetchPrograms} className="ml-auto text-xs underline hover:no-underline">
            Réessayer
          </button>
        </div>
      )}

      {/* Barre outils */}
      {!isLoading && !error && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un programme…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
            />
          </div>
          {programs.length > 0 && (
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {filtered.length} / {programs.length} programme{programs.length > 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={openAdd}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      )}

      {/* Chargement */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-slate-500">Chargement des programmes…</p>
        </div>
      )}

      {/* Tableau */}
      {!isLoading && !error && programs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Département</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Étapes</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map((p) => (
                <ProgramRow key={p.id} program={p} onEdit={openEdit} onDelete={setPendingDelete} />
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && <EmptyState search={search} onAdd={openAdd} />}
        </div>
      )}

      {/* Aucun programme */}
      {!isLoading && !error && programs.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState search="" onAdd={openAdd} />
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-400">
            {filtered.length} programme{filtered.length > 1 ? "s" : ""} — page {currentPage} / {totalPages}
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
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                      p === currentPage ? "bg-[hsl(134,35%,45%)] text-white" : "hover:bg-slate-100 text-slate-500"
                    }`}
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

      {/* Modal création / modification */}
      <ProgramModal
        key={editProgram?.id ?? (showModal ? "new" : "closed")}
        isOpen={showModal}
        onClose={() => { setShowModal(false); setFormError(null); setFieldErrors({}); }}
        programToEdit={editProgram}
        departements={departements}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        fieldErrors={fieldErrors}
        serverError={formError}
      />

      {/* Modal confirmation suppression */}
      <ConfirmModal
        isOpen={pendingDelete !== null}
        title="Supprimer le programme"
        message={
          pendingDelete
            ? `Voulez-vous vraiment supprimer le programme "${pendingDelete.nom}" ? Cette action est irréversible.`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
