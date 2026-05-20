/**
 * @module components/courses/CourseTable
 * @description Tableau des cours avec actions de gestion.
 */

'use client';

import React from 'react';
import { Pencil, Archive, ArchiveRestore, BookOpen, Hash, Layers, GraduationCap,Settings2 } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * Affiche les cours dans un tableau lisible.
 *
 * @param {Object} props - Propriétés du composant.
 * @param {Array<Object>} [props.courses=[]] - Liste des cours à afficher.
 * @param {Function} props.onEdit - Ouvre l'édition d'un cours.
 * @param {Function} props.onDelete - Archive un cours.
 * @param {Function} props.onRestore - Restaure un cours archivé.
 * @param {boolean} [props.showArchived=false] - Active l'affichage des archives.
 * @returns {JSX.Element} Tableau de cours.
 */

export default function CourseTable({ courses = [], onEdit, onDelete, onRestore, showArchived = false }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left whitespace-nowrap">

          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="px-5 py-3.5 min-w-[250px] w-1/3">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={20} className="text-cite-green" />
                  Matière / Cours
                </div>
              </th>
              <th className="px-5 py-3.5 min-w-[100px]">
                <div className="flex items-center gap-1.5">
                  <Hash size={20} className="text-cite-green" />
                  Code
                </div>
              </th>
              <th className="px-5 py-3.5 min-w-[180px]">
                <div className="flex items-center gap-1.5">
                  <Layers size={20} className="text-cite-green" />
                  Programmes
                </div>
              </th>
              <th className="px-5 py-3.5 min-w-[180px]">
                <div className="flex items-center gap-1.5">
                  <Layers size={20} className="text-cite-green" />
                  Competences necessaires
                </div>
              </th>
              <th className="px-5 py-3.5 text-center min-w-[80px]">
                <div className="flex items-center justify-center gap-1.5">
                  <GraduationCap size={20} className="text-cite-green" />
                  Étape
                </div>
              </th>
              <th className="px-5 py-3.5 text-right min-w-[120px]">
                <div className="flex items-center justify-end gap-1.5">
                  <Settings2 size={20} className="text-cite-green" />
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">
                      {showArchived ? 'Les archives sont vides.' : 'Aucun cours à afficher.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr
                  key={course.id}
                  className={`group transition-colors duration-150 ${
                    showArchived ? 'bg-gray-50/40 hover:bg-gray-100/50 opacity-80' : 'hover:bg-gray-50/60'
                  }`}
                >
                  {/* Nom */}
                  <td className="px-5 py-3.5">
                    <span className={`font-semibold truncate max-w-[300px] block ${showArchived ? 'text-gray-500' : 'text-gray-900'}`} title={course.nom}>
                      {course.nom}
                    </span>
                  </td>

                  {/* Code */}
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-gray-100 text-gray-700 rounded-md border border-gray-200">
                      {course.code || '—'}
                    </span>
                  </td>

                  {/* Programmes */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {course.programs?.length > 0 ? (
                        course.programs.slice(0, 2).map((p, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 truncate max-w-[110px]" title={p.nom}>
                            {p.nom}
                          </span>
                        )).concat(
                          course.programs.length > 2 ? [
                            <span key="more" className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                              +{course.programs.length - 2}
                            </span>
                          ] : []
                        )
                      ) : (
                        <span className="text-xs text-gray-400 italic">Aucun</span>
                      )}
                    </div>
                  </td>
                  
                  {/* Étape */}
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-bold bg-cite-green/10 text-cite-green rounded-full border border-cite-green/20">
                      {course.etape ?? '—'}
                    </span>
                  </td>

                  {/* Type de salle */}
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-gray-200">
                    {course.courseSkill}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      {showArchived ? (
                        <Button variant="citeGreenLight" size="iconSm" onClick={() => onRestore(course)} title="Restaurer">
                          <ArchiveRestore className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <>
                          <Button variant="citeGreenLight" size="iconSm" onClick={() => onEdit(course)} title="Modifier">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="archiveLight" size="iconSm" onClick={() => onDelete(course.id)} title="Archiver">
                            <Archive className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
