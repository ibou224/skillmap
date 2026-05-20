/**
 * @module components/courses/CourseForm
 * @description Formulaire de création et de modification des cours.
 */

'use client';

// --- IMPORTATIONS ---
import React from 'react';
import {
  BookOpen,
  Hash,
  ListOrdered,
  X,
  PencilLine,
  PlusCircle,
  SaveAll,
  CheckSquare
} from 'lucide-react';
import { ETAPES } from '@/constants/constantes';
import { Button } from '../ui/Button';
import ErrorAlert from '../ui/ErrorAlert';

/**
 * Composant CourseForm (Modale)
 * Formulaire d'ajout et de modification d'un cours.
 * 
 * @param {Object} props
 * @param {boolean} props.open - Contrôle l'affichage de la modale.
 * @param {Function} props.onClose - Ferme la modale.
 * @param {Function} props.onSubmit - Gère la soumission du formulaire.
 * @param {Object} props.formData - L'état local contenant les données du cours.
 * @param {Function} props.setFormData - Fonction de mise à jour des données du cours.
 * @param {boolean} props.isEditing - Détermine si on est en mode "Édition" (true) ou "Création" (false).
 * @param {Array} props.programmesList - Liste des programmes disponibles pour l'affectation.
 * @param {string} props.error - Message d'erreur éventuel à afficher.
 * @param {Function} props.onErrorClose - Fonction pour fermer l'alerte d'erreur.
 */
export default function CourseForm({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing,
  programmesList = [],
  error = '',
  onErrorClose = () => {},
}) {
  // --- GESTIONNAIRES D'ÉVÉNEMENTS (HANDLERS) ---

  // Fonction pour ajouter/supprimer un programme de la sélection (Many-to-Many)
  const handleProgrammeToggle = (programmeId) => {
    // Utilisation de "programIds" pour correspondre à ce qu'attend l'API
    const currentSelected = formData.programIds || [];
    
    const newSelection = currentSelected.includes(programmeId)
      ? currentSelected.filter((id) => id !== programmeId)
      : [...currentSelected, programmeId];

    setFormData({ ...formData, programIds: newSelection });
  };

  const selectedCount = formData.programIds?.length || 0;

  // --- STYLES RÉUTILISABLES ---
  const inputClasses = "w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cite-green focus:border-transparent transition-all duration-200 bg-gray-50/50 focus:bg-white text-gray-800 placeholder-gray-400";
  const labelClasses = "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider";

  // Ne rien rendre si la modale est fermée
  if (!open) return null;

  // --- RENDU VISUEL (JSX) ---
  return (
    <div className='relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200'>

      {/* --- 1. EN-TÊTE --- */}
      <div className='flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/30'>
        <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2.5'>
          {isEditing ? (
            <>
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                <PencilLine size={20} className='text-amber-500' />
              </div>
              Modifier le cours
            </>
          ) : (
            <>
              <div className="p-2 bg-cite-green/10 rounded-lg border border-cite-green/20">
                <PlusCircle size={20} className='text-cite-green' />
              </div>
              Ajouter un nouveau cours
            </>
          )}
        </h2>
        <button
          type='button'
          onClick={onClose}
          className='p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors'
          title="Fermer"
        >
          <X size={20} />
        </button>
      </div>

      {/* --- BANDEAU D'ERREUR --- */}
      {error && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 w-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <ErrorAlert message={error} onClose={onErrorClose} />
        </div>
      )}

      {/* --- 2. CORPS DU FORMULAIRE --- */}
      <form id='course-form' onSubmit={onSubmit} className='p-6 space-y-5 overflow-y-auto flex-1'>

        {/* Ligne 1 : Nom (Prend toute la largeur) */}
        <div>
          <label htmlFor="nom" className={labelClasses}>Nom du cours <span className="text-red-500">*</span></label>
          <div className='relative'>
            <BookOpen size={16} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
            <input
              id="nom"
              type='text'
              placeholder='Ex: Programmation Web Avancée'
              value={formData.nom || ''}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Ligne 2 : Code + Étape */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {/* Champ : Code */}
          <div>
            <label htmlFor="code" className={labelClasses}>Code <span className="text-red-500">*</span></label>
            <div className='relative'>
              <Hash size={16} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' />
              <input
                id="code"
                type='text'
                placeholder='Ex: 025770-IFM'
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={`${inputClasses} uppercase`}
              />
            </div>
          </div>

          {/* Champ : Étape */}
          <div>
            <label htmlFor="etape" className={labelClasses}>Étape (Niveau)</label>
            <div className='relative'>
              <ListOrdered size={16} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none' />
              <select
                id="etape"
                value={formData.etape || '1'}
                onChange={(e) => setFormData({ ...formData, etape: parseInt(e.target.value) })}
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                {ETAPES.map((num) => (
                  <option key={num} value={num}>Étape {num}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Ligne 3 : Programmes (Liste de Checkboxes) */}
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <label className={labelClasses} style={{ marginBottom: 0 }}>
              Programmes associés <span className="text-red-500">*</span>
            </label>
            <span className="text-xs font-medium text-cite-green bg-cite-green/10 px-2 py-0.5 rounded-full">
              {selectedCount} sélectionné(s)
            </span>
          </div>
          
          {/* Conteneur défilant pour les cases à cocher */}
          <div className='border border-gray-200 rounded-xl bg-gray-50/50 p-2 max-h-48 overflow-y-auto space-y-1 shadow-inner'>
            {programmesList.length > 0 ? (
              programmesList.map((p) => {
                // Vérification avec programIds
                const isChecked = formData.programIds?.includes(p.id);
                return (
                  <label 
                    key={p.id} 
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border
                      ${isChecked ? 'bg-white border-cite-green/30 shadow-sm' : 'border-transparent hover:bg-gray-100'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleProgrammeToggle(p.id)}
                      className="w-4 h-4 text-cite-green bg-white border-gray-300 rounded focus:ring-cite-green focus:ring-2 cursor-pointer transition-all"
                    />
                    <span className={`text-sm ${isChecked ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {p.nom}
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                Aucun programme disponible.
              </div>
            )}
          </div>
        </div>

      </form>

      {/* --- 3. PIED DE PAGE (ACTIONS) --- */}
      <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/30'>
        <Button 
          type='button' 
          variant='outline' 
          size='xl' 
          onClick={onClose}
          className="w-full sm:w-auto text-gray-600 border-gray-200 hover:bg-gray-100"
        >
          Annuler
        </Button>
        <Button 
          type='submit'
          form='course-form'
          variant='citeGreen' 
          size='xl'
          className="w-full sm:w-auto shadow-sm"
        >
          {isEditing ? (
            <>
              <SaveAll size={18} className="mr-2" /> 
              Enregistrer les modifications
            </>
          ) : (
            <>
              <CheckSquare size={18} className="mr-2" /> 
              Créer le cours
            </>
          )}
        </Button>
      </div>

    </div>
  );
}