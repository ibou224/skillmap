/**
 * @module components/types
 * @description Types partagés entre les composants du dashboard SkillMap.
 */

export type UserRole = "PROFESSEUR" | "RH" | "ADMIN";

export interface SessionUser {
  id: string;
  prenom: string;
  nom: string;
  role: UserRole;
}