"use client";

/**
 * @module features/admin/SkillsSection
 * @description Section de gestion des compétences (admin) : liste paginée, filtres,
 * création/édition/suppression via {@link module:hooks/useSkills}.
 * @returns {ReactNode} La section de gestion des compétences.
 */

import { useState, useEffect } from "react";
import { Banner } from "@/components/ui/Banner";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessAlert from "@/components/ui/SuccessAlert";
import useSkills from "@/hooks/useSkills";
import { useCourses } from "@/hooks/useCourses";
import { SkillsToolbar } from "@/components/skills/SkillTools";
import { SkillsTable } from "@/components/skills/SkillsTable";
import { SkillsForm } from "@/components/skills/SkillsForm";

const DEFAULT_FORM = { nom: "", categorie: "", description: "" };
const PAGE_SIZE = 10;

export default function SkillsSection() {
  const [search, setSearch] = useState("");
  const [filterProgramme, setFilterProgramme] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editSkill, setEditSkill] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const { skills, isLoading, fetchSkills, createSkill, updateSkill, deleteSkill } = useSkills();
  const { fetchProgrammes,programmes } = useCourses();

  useEffect(() => {
    fetchProgrammes();
  }, [fetchProgrammes]);

  const filtered = skills.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.nom.toLowerCase().includes(q);
    const matchProgramme = !filterProgramme || s.categorie === filterProgramme;
    return matchSearch && matchProgramme;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openAdd = () => {
    setEditSkill(null);
    setFormData(DEFAULT_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditSkill(s);
    setFormData({ nom: s.nom, categorie: s.categorie ?? "", description: s.description ?? "" });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.nom.trim()) { setFormError("Le nom est requis."); return; }
    if (!formData.categorie.trim()) { setFormError("La catégorie est requise."); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        nom: formData.nom.trim(),
        categorie: formData.categorie.trim(),
        description: formData.description.trim() || null,
      };
      if (editSkill) {
        await updateSkill(editSkill.id, payload);
        setSuccessMessage(`Compétence "${payload.nom}" modifiée.`);
      } else {
        await createSkill(payload);
        setSuccessMessage(`Compétence "${payload.nom}" créée.`);
      }
      setShowModal(false);
      fetchSkills();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    const s = skills.find((s) => s.id === pendingDeleteId);
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteSkill(pendingDeleteId);
      setSuccessMessage(`Compétence "${s?.nom}" supprimée.`);
      setPendingDeleteId(null);
      fetchSkills();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Banner
        title="Compétences"
        description="Gérez le référentiel de compétences utilisé dans les cours et les affectations."
      />

      {successMessage && (
        <SuccessAlert message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      <SkillsToolbar
        search={search}
        setSearch={setSearch}
        filterProgramme={filterProgramme}
        setFilterProgramme={setFilterProgramme}
        programmes={programmes}
        setPage={setPage}
        onOpenAdd={openAdd}
      />

      <SkillsTable
        paginatedSkills={paginated}
        isLoading={isLoading}
        search={search}
        filteredCount={filtered.length}
        currentPage={currentPage}
        totalPages={totalPages}
        setPage={setPage}
        onOpenEdit={openEdit}
        onOpenDelete={(id) => { setDeleteError(""); setPendingDeleteId(id); }}
      />

      {/* 3. Modale création / modification */}
      <SkillsForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editSkill={editSkill}
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        programmes={programmes}
      />

      {/* Modale confirmation suppression */}
      <ConfirmModal
        isOpen={pendingDeleteId !== null}
        title="Supprimer la compétence"
        message={(() => {
          const s = skills.find((s) => s.id === pendingDeleteId);
          return s
            ? `Voulez-vous vraiment supprimer "${s.nom}" ? Cette action est irréversible et peut affecter les cours associés.`
            : "Confirmer la suppression ?";
        })()}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  );
}