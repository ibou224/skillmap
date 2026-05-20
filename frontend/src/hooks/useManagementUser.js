/**
 * @module hooks/useManagementUser
 * @description Hook qui centralise la gestion des utilisateurs administratifs.
 */

"use client"
import { useState, useCallback } from 'react'
import { isValidEmail, isValidRole, isValidString } from '@/lib/validation'

export function useManagementUser() {
    const [error, setError]     = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [users, setUsers] = useState([])

    /**
   * Générateur de mot de passe robuste et aléatoire.
   * Format : Prénom + nom + 4 chiffres + caractère spécial.
   */
  const generatePassword = (nom, prenom) => {
    // 1. Nettoyage : suppression des espaces et mise en minuscules
    const cleanNom = nom.replace(/\s+/g, '').toLowerCase();
    const cleanPrenom = prenom.replace(/\s+/g, '').toLowerCase();

    // 2. Formatage : Majuscule sur les deux premières lettres du prénom 
    const prenomMaj = (cleanPrenom.charAt(0) + cleanPrenom.charAt(1)).toUpperCase() + cleanPrenom.slice(2);
    
    // 3. Aléatoire : Nombre à 4 chiffres pour la complexité
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    // 4. Sécurité : Ajout d'un caractère spécial parmi une liste prédéfinie
    const specialChars = "@$!%*?&";
    const randomSpecialChar = specialChars[Math.floor(Math.random() * specialChars.length)];

    let password = `${prenomMaj}${cleanNom}${randomNum}${randomSpecialChar}`;
    
    // 5. Garantie : Sécurité absolue pour atteindre au moins 8 caractères
    while(password.length < 8) {
      password += Math.floor(Math.random() * 10);
      password += specialChars[Math.floor(Math.random() * specialChars.length)];
      password += specialChars[Math.floor(Math.random() * specialChars.length)];
    }

    return password;
  };

  /**
   * Générateur d'email institutionnel.
   * Supprime les accents et les espaces pour respecter les standards SMTP.
   */
  const generateEmail = (prenom, nom) => {
    // Fonction utilitaire pour transformer "Élodie" en "elodie"
    const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const premierPrenom = removeAccents(prenom.trim().split(/\s+/)[0].toLowerCase());
    const premierNom = removeAccents(nom.trim().split(/\s+/)[0].toLowerCase());

    return `${premierPrenom}.${premierNom}@lacitec.on.ca`;
  };
  
  /**
   * Crée un utilisateur en base de données.
   * Génère automatiquement l'email et le mot de passe avant l'envoi.
   */
    const createUser = useCallback(async (nom,prenom, role) => {
        setError('')
        setIsLoading(true)

        if(!isValidString(nom).valid || !isValidString(prenom).valid) {
            setError("Le nom ou le prénom est invalide.")
            setIsLoading(false)
            return
        }

        const generatedEmail = generateEmail(prenom, nom)
        const generatedPassword = generatePassword(nom, prenom)
        
        if(!isValidEmail(generatedEmail).valid) {
            setError("L'email généré est invalide.")
            setIsLoading(false)
            return
        }

        if(!isValidRole(role)) {
            setError("Rôle invalide.")
            setIsLoading(false)
            return
        }

        try{
            const newUser = {
                email: generatedEmail,
                password: generatedPassword,
                role: role,
                nom: nom,
                prenom: prenom,
                isActive: true,
            }

            const response = await fetch('/api/admin/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            })
            const data = await response.json()

            if(!data.success) {
                setError(data.message || "Une erreur est survenue lors de la création de l'utilisateur.")
                setIsLoading(false)
            } else {
                setIsLoading(false)
                return {...data, generatedPassword: generatedPassword, email: generatedEmail};
            }
            
        } catch (error) {
            setError(error.message || "Une erreur réseau est survenue.")
            setIsLoading(false)
            return
        }
    }, [])


    /**
   * Récupère la liste de tous les utilisateurs.
   */
  const getUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Une erreur est survenue lors de la récupération des utilisateurs.');
        setIsLoading(false);
        return [];
      }
      setUsers(data.data ?? data);
      setIsLoading(false);
      return data.data ?? data;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return []; // Retourne un tableau vide pour éviter de casser les .map() dans l'UI
    }
  }, []);

  const updateUser = useCallback(async (userId, updateData) => {
    setError(null);
    setIsLoading(true);
    if(!userId) {
        setError("ID utilisateur invalide.");
        setIsLoading(false);
        return null;
    }

    if(!isValidRole(updateData.role)) {
        setError("Rôle invalide.")
        setIsLoading(false)
        return null;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
        if (!response.ok) {
            setError(data.message);
            setIsLoading(false);
            return null;
        }
        setIsLoading(false);
        return data;
    } catch (err) {
        setError(err.message);
        setIsLoading(false);
        return null;
    }
    }, []);

    const deleteUser = useCallback(async (userId) => {
        setError(null);
        setIsLoading(true);
        if(!userId) {
            setError("ID utilisateur invalide.");
            setIsLoading(false);
            return false;
        }
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message);
                setIsLoading(false);
                return false;
            }
            setIsLoading(false);
            return true;
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return false;
        }
    }, []);

    return { createUser, getUsers, error, isLoading,users, updateUser, deleteUser }
}