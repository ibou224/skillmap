/**
 * @module lib/notify
 * @description Helpers de création de notifications persistées en base (Prisma).
 * Permet de notifier un utilisateur précis ou tous les utilisateurs d'un ou
 * plusieurs rôles.
 */

import prisma from "@/lib/prisma";

/**
 * Crée une notification pour un utilisateur unique.
 *
 * @param {Object} params
 * @param {string} params.userId  Identifiant du destinataire.
 * @param {string} params.type    Type/catégorie de notification.
 * @param {string} params.title   Titre court.
 * @param {string} params.body    Corps du message.
 * @param {string} [params.link]  Lien optionnel vers la ressource concernée.
 * @returns {Promise<Object>} La notification créée.
 */
export async function createNotification({ userId, type, title, body, link }) {
  return prisma.notification.create({
    data: { userId, type, title, body, link },
  });
}

/**
 * Crée une notification pour tous les utilisateurs actifs ayant l'un des rôles donnés.
 *
 * @param {Object} params
 * @param {string[]} params.roles  Rôles ciblés (ex. ['ADMIN', 'RH']).
 * @param {string} params.type     Type/catégorie de notification.
 * @param {string} params.title    Titre court.
 * @param {string} params.body     Corps du message.
 * @param {string} [params.link]   Lien optionnel vers la ressource concernée.
 * @returns {Promise<void>} Ne retourne rien ; ne fait rien si aucun utilisateur ne correspond.
 */
export async function notifyByRole({ roles, type, title, body, link }) {
  const users = await prisma.user.findMany({
    where: { role: { in: roles }, isActive: true },
    select: { id: true },
  });

  if (users.length === 0) return;

  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, type, title, body, link })),
  });
}
