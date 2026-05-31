/**
 * @module hooks/useNotifications
 * @description Hook de gestion des notifications utilisateur : chargement initial,
 * rafraîchissement périodique (toutes les 30 s) et marquage comme lu (une ou toutes).
 */

import { useState, useEffect, useRef } from "react";

/**
 * Charge et gère les notifications de l'utilisateur connecté.
 *
 * @returns {Object} État et actions.
 * @returns {Array<Object>} returns.notifications - Notifications non lues.
 * @returns {number} returns.count - Nombre de notifications non lues.
 * @returns {Function} returns.markAllRead - Marque toutes les notifications comme lues.
 * @returns {Function} returns.markOneRead - Marque une notification comme lue (par id).
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const setRef = useRef(setNotifications);

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch("/api/notifications");
        const json = await res.json();
        if (json.success) setRef.current(json.data);
      } catch {
        throw new Error("Erreur lors du chargement des notifications.");
      }
    };

    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications([]);
  };

  const markOneRead = async (id) => {
    await fetch("/api/notifications", {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    count: notifications.length,
    markAllRead,
    markOneRead,
  };
}
