/**
 * @module components/ui/ErrorAlert
 * @description Alerte d'erreur réutilisable.
 */

'use client';

import { AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Composant d'alerte d'erreur réutilisable.
 * Affiche un message d'erreur avec fermeture automatique ou manuelle.
 */
export default function ErrorAlert({
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 7000,
  label,
}) {
  // le message disparait après autoCloseDelay ms (7s par défaut)
  useEffect(() => {
    if (!message || !autoClose) return;
    const timer = setTimeout(onClose, autoCloseDelay);
    return () => clearTimeout(timer);
  }, [message, autoClose, autoCloseDelay, onClose]);

  if (!message) return null;

  return (
    <div className='bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-center gap-3'>
      <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
      <div className='flex-1 min-w-0'>
        {label && <p className='text-[10px] font-bold uppercase tracking-wide text-red-500 mb-0.5'>{label}</p>}
        <p className='text-sm font-medium text-red-800'>{message}</p>
      </div>
      <button
        onClick={onClose}
        className='text-red-400 hover:text-red-600 flex-shrink-0'
      >
        <X size={18} />
      </button>
    </div>
  );
}
