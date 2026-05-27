import { useState, useEffect, useCallback } from "react";
import { isValidPassword } from "@/lib/validation";


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