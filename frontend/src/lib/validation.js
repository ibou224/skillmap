
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || email.trim().length === 0 || typeof email !== "string") return { valid: false, message: "Identifiants incorrects. Veuillez réessayer." };
    if(!emailRegex.test(email.trim())) return { valid: false, message: "Identifiants incorrects. Veuillez réessayer." };
    if(!email.trim().toLocaleLowerCase().endsWith('@lacitec.on.ca')) return { valid: false, message: "Identifiants incorrects. Veuillez réessayer." };
    return { valid: true, message: "L'adresse e-mail est valide." };
};


export const isValidPassword = (password) => {
    if (!password.trim()) return { valid: false, message: "Le mot de passe est requis." };
    if (password.length < 8) return { valid: false, message: "Le mot de passe doit contenir au moins 8 caractères." };
    if (!/[A-Z]/.test(password.trim())) return { valid: false, message: "Le mot de passe doit contenir au moins une lettre majuscule." };
    if (!/[a-z]/.test(password.trim())) return { valid: false, message: "Le mot de passe doit contenir au moins une lettre minuscule." };
    if (!/[0-9]/.test(password.trim())) return { valid: false, message: "Le mot de passe doit contenir au moins un chiffre." };
    if (!/[@$!%*?&]/.test(password.trim())) return { valid: false, message: "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)." };
    return { valid: true, message: "Le mot de passe est valide." };
}

export const isValidString = (nom) => {
    if(!nom.trim() || nom.trim().length === 0 || typeof nom !== "string") return { valid: false, message: "Ce champ est requis." };
    const normalisationRegex = nom.trim().replace(/[\u2018\u2019]/g, "'");
   const stringValide = /^[a-zA-ZÀ-ÿ0-9\s'\-().+,:#]+$/;

    return stringValide.test(normalisationRegex) ? { valid: true, message: "Ce champ est valide." } : { valid: false, message: "Ce champ contient des caractères invalides." };
}

export const isValidRole = (role) => {
    const validRoles = ['ADMIN', 'RH', 'PROFESSEUR'];
    return validRoles.includes(role.trim().toUpperCase());
}


/**
 * Valide un fichier CV avant envoi à l'API.
 * @param {File} file - Le fichier à valider.
 * @returns {{ valid: boolean, error?: string }} Résultat de la validation.
 */

export const isValidFile = (file) => {

    if(!file || !(file instanceof File)) {
        return { valid: false, message: "Aucun fichier fourni." };
    }

    const allowedTypes = [
        "application/pdf", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
        return { 
            valid: false, 
            message: "Type de fichier non autorisé. Seuls les PDF et DOCX sont acceptés." 
        };

    }

    const maxSize = 5 * 1024 * 1024; // 5 Mo
    if (file.size > maxSize) {
        return {
            valid: false,
            message: `Le fichier est trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)} Mo). La taille maximale est de 5 Mo.`,
        };
    }
        
    return { valid: true, message: "Le fichier est valide." };
}

/**
 * Bornes autorisées pour chaque critère de pondération.
 * Source de vérité unique — importée également par les constantes UI.
 */
export const WEIGHT_BOUNDS = {
  competencesPct: { min: 20, max: 80 },
  experiencePct:  { min: 10, max: 80 },
  formationPct:   { min: 0,  max: 30 },
  historiquePct:  { min: 0,  max: 30 },
};

/**
 * Valide les poids d'une configuration de session.
 * @param {{ competencesPct, experiencePct, formationPct, historiquePct }} weights
 * @returns {{ valid: true } | { valid: false, message: string }}
 */
export function isValidateWeights(weights) {
  const { competencesPct, experiencePct, formationPct, historiquePct } = weights;

  if (
    competencesPct == null ||
    experiencePct  == null ||
    formationPct   == null ||
    historiquePct  == null
  ) {
    return { valid: false, message: "Données manquantes." };
  }
  
  for (const [champ, valeur] of Object.entries({ competencesPct, experiencePct, formationPct, historiquePct })) {
    const { min, max } = WEIGHT_BOUNDS[champ];
    if (!Number.isInteger(valeur) || valeur < min || valeur > max) {
      return {
        valid: false,
        message: `${champ} doit être un entier entre ${min}% et ${max}% (reçu : ${valeur}).`,
      };
    }
  }

  const total = competencesPct + experiencePct + formationPct + historiquePct;
  if (total !== 100) {
    return {
      valid: false,
      message: `Le total doit être 100% (actuellement ${total}%).`,
    };
  }

  return { valid: true };
}


