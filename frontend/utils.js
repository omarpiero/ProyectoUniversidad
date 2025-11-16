// frontend/utils.js

const CHAR_SETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

/**
 * Genera una contraseña basada en las opciones proporcionadas.
 * Garantiza que al menos un carácter de cada conjunto seleccionado esté presente.
 */
export function generatePassword(length, opts) {
    let pool = '';
    let requiredChars = [];
    
    if (opts.uppercase) { pool += CHAR_SETS.upper; requiredChars.push(CHAR_SETS.upper[Math.floor(Math.random() * CHAR_SETS.upper.length)]); }
    if (opts.lowercase) { pool += CHAR_SETS.lower; requiredChars.push(CHAR_SETS.lower[Math.floor(Math.random() * CHAR_SETS.lower.length)]); }
    if (opts.numbers) { pool += CHAR_SETS.numbers; requiredChars.push(CHAR_SETS.numbers[Math.floor(Math.random() * CHAR_SETS.numbers.length)]); }
    if (opts.symbols) { pool += CHAR_SETS.symbols; requiredChars.push(CHAR_SETS.symbols[Math.floor(Math.random() * CHAR_SETS.symbols.length)]); }

    if (pool === '') return '';

    let passwordChars = [...requiredChars];
    for (let i = requiredChars.length; i < length; i++) {
        passwordChars.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    // Shuffle
    for (let i = passwordChars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    return passwordChars.join('');
}

/**
 * Calcula la fortaleza de una contraseña y devuelve un objeto de nivel.
 */
export function calculateStrength(password) {
    let score = 0;
    if (!password) { score = 0; } else {
        if (password.length >= 8) score++;
        if (password.length >= 12) score += 2;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score += 2;
    }
    
    const levels = [
        { min: 0, color: "--strength-very-weak", label: "Muy Débil" },
        { min: 3, color: "--strength-weak", label: "Débil" },
        { min: 5, color: "--strength-acceptable", label: "Aceptable" },
        { min: 7, color: "--strength-strong", label: "Fuerte" },
        { min: 8, color: "--strength-very-strong", label: "Muy Fuerte" }
    ];

    let level = levels[0];
    for (let i = levels.length - 1; i >= 0; i--) {
        if (score >= levels[i].min) { level = levels[i]; break; }
    }
    
    const widthPercent = Math.min(100, (score / 9) * 100);
    return { ...level, widthPercent };
}

/**
 * Genera un array de sugerencias de mejora para una contraseña.
 */
export function getSuggestions(password) {
    const suggestions = [];
    if (!password) return suggestions;

    if (password.length < 12) suggestions.push("Usa al menos 12 caracteres.");
    if (!/[A-Z]/.test(password)) suggestions.push("Añade letras mayúsculas.");
    if (!/[0-9]/.test(password)) suggestions.push("Incluye algunos números.");
    if (!/[^A-Za-z0-9]/.test(password)) suggestions.push("Agrega símbolos para mayor fuerza.");

    if (suggestions.length === 0) {
        suggestions.push("¡Buena contraseña! Parece muy segura.");
    }
    
    return suggestions;
}