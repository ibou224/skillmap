
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return { valid: false, message: "Identifiants incorrects. Veuillez réessayer." };
    if(!emailRegex.test(email.trim())) return { valid: false, message: "Identifiants incorrects. Veuillez réessayer." };
    if(!email.trim().endsWith('@lacitec.on.ca')) return { valid: false, message: "Identifiants incorrects. Veuillez réessayer." };
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