
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