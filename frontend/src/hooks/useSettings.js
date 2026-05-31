/**
 * @module hooks/useSettings
 * @description Hook de gestion des paramètres du compte connecté : changement de
 * mot de passe (avec validation) et mise à jour des informations de profil.
 */

import { useState, useEffect, useCallback } from "react";
import { isValidPassword } from "@/lib/validation";


/**
 * Hook de paramètres de compte.
 *
 * @returns {Object} État et actions.
 * @returns {Function} returns.changePassword - Change le mot de passe ({ password, newpassword, confirmPassword }).
 * @returns {Function} returns.changeProfile - Met à jour le profil ({ prenom, nom }).
 * @returns {boolean} returns.isloading - Indicateur de chargement.
 * @returns {string|null} returns.error - Message d'erreur éventuel.
 */
export const useSettings = () => {

    const [isloading, setIsloading] = useState(false)
    const [error, setError] = useState(null)
    
    const changePassword = useCallback(async ({password, newpassword, confirmPassword}) => {
        setIsloading(true)
        setError(null)

        const passwordValidation = isValidPassword(password)
        const newPasswordValidation = isValidPassword(newpassword)
        if (!passwordValidation.valid || !newPasswordValidation.valid) {
            setError(passwordValidation.message || newPasswordValidation.message)
            setIsloading(false)
            return
        }
        if (newpassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.")
            setIsloading(false)
            return
        }
        const data = { password, newpassword }
        try {
            const response = await fetch("/api/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.message || "Erreur lors de la modification du mot de passe")
            }
            return result
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsloading(false)
        }
    }, [])

    const changeProfile = useCallback(async ({prenom, nom}) => {
        setIsloading(true)
        setError(null)
        const data = { prenom, nom }
        try {
            const response = await fetch("/api/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.message || "Erreur lors de la mise à jour du profil.")
            }
            return result
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setIsloading(false)
        }
    }, []);

    return { changePassword, isloading, error, changeProfile };
}