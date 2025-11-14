// frontend/handlers.js
import * as api from './api.js';
import dom from './dom.js';
import { currentProfile, setCurrentProfile } from './state.js';
import { 
    updateUIForProfile, 
    resetUI, 
    renderHistory, 
    showFeedback, 
    updateStrengthMeter, 
    generateSuggestions 
} from './ui.js';

// --- LÓGICA DE PERFILES ---

export async function loadProfiles() {
    dom.loadingIndicator.style.display = 'block';
    try {
        const profiles = await api.getProfiles();
        dom.profileSelector.innerHTML = '<option value="">-- Selecciona un perfil --</option>';
        if (profiles && profiles.length > 0) {
            profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile.id;
                option.textContent = `${profile.nombre_perfil} (${profile.email})`;
                dom.profileSelector.appendChild(option);
            });
        } else {
             dom.profileSelector.innerHTML = '<option value="">No hay perfiles, crea uno nuevo.</option>';
        }
    } catch (error) {
        showFeedback(`Error al cargar perfiles: ${error.message}`, 'error');
    } finally {
        dom.loadingIndicator.style.display = 'none';
    }
}

export async function handleProfileSelection() {
    const profileId = dom.profileSelector.value;
    if (!profileId) {
        setCurrentProfile(null);
        resetUI();
        return;
    }
    try {
        const profile = await api.getProfileById(profileId);
        setCurrentProfile(profile);
        updateUIForProfile();
    } catch (error) {
        showFeedback(error.message, 'error');
    }
}

export async function handleCreateProfile() {
    const nombre = dom.newProfileNameInput.value.trim();
    const email = dom.newProfileEmailInput.value.trim();
    if (!nombre || !email) {
        return showFeedback('Nombre y email son requeridos.', 'error');
    }
    try {
        const newProfile = await api.createProfile({ nombre_perfil: nombre, email });
        showFeedback('Perfil creado y cargado exitosamente.', 'success');
        dom.newProfileNameInput.value = '';
        dom.newProfileEmailInput.value = '';
        await loadProfiles();
        dom.profileSelector.value = newProfile.id;
        setCurrentProfile(newProfile);
        updateUIForProfile();
    } catch (error) {
        showFeedback(error.message, 'error');
    }
}

export async function handleDeleteProfile() {
    if (!currentProfile || !confirm(`¿Seguro que quieres eliminar "${currentProfile.nombre_perfil}"?`)) {
        return;
    }
    try {
        await api.deleteProfile(currentProfile.id);
        showFeedback('Perfil eliminado.', 'success');
        setCurrentProfile(null);
        await loadProfiles();
        resetUI();
    } catch (error) {
        showFeedback(error.message, 'error');
    }
}

// --- LÓGICA DE GENERACIÓN ---

const CHAR_SETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

function generatePassword(length, opts) {
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

export async function handlePasswordGeneration(event) {
    event.preventDefault();
    if (!currentProfile) {
        return showFeedback('Selecciona un perfil para empezar.', 'error');
    }
    
    const opts = {
        length: parseInt(dom.lengthInput.value),
        uppercase: dom.uppercaseCheck.checked,
        lowercase: dom.lowercaseCheck.checked,
        numbers: dom.numbersCheck.checked,
        symbols: dom.symbolsCheck.checked,
    };
    
    const checkedCount = Object.values(opts).filter(v => typeof v === 'boolean' && v).length;

    if (checkedCount === 0) {
        return showFeedback('Seleccione los tipos de carácteres...', 'error');
    } else if (checkedCount < 3) {
        return showFeedback('Seleccione al menos 3 tipos de carácteres...', 'error');
    }

    const password = generatePassword(opts.length, opts);
    dom.passwordOutput.value = password;
    updateStrengthMeter(password);
    generateSuggestions(password);

    // Guardar en backend
    currentProfile.historial.unshift(password);
    currentProfile.preferencias = opts;
    try {
        await api.updateProfile(currentProfile.id, {
            historial: currentProfile.historial,
            preferencias: currentProfile.preferencias
        });
        renderHistory();
    } catch (error) {
        showFeedback(`Error al guardar: ${error.message}`, 'error');
        currentProfile.historial.shift(); // Revertir
    }
}

// --- FUNCIONALIDADES ADICIONALES ---

export function copyToClipboard() {
    if (!dom.passwordOutput.value) {
        return showFeedback('No hay contraseña para copiar.', 'error');
    }
    navigator.clipboard.writeText(dom.passwordOutput.value)
        .then(() => showFeedback('Copiado al portapapeles.', 'success', 1500))
        .catch(() => showFeedback('Error al copiar.', 'error'));
}

export function exportHistory() {
    if (!currentProfile || currentProfile.historial.length === 0) {
        return showFeedback('No hay historial para exportar en este perfil.', 'error');
    }
    const text = currentProfile.historial.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial_${currentProfile.nombre_perfil}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
}

export async function clearHistory() {
    if (!currentProfile || currentProfile.historial.length === 0) {
        return showFeedback('El historial ya está vacío.', 'error');
    }
    if (!confirm('¿Seguro que quieres limpiar el historial de este perfil?')) return;
    
    const originalHistory = [...currentProfile.historial];
    currentProfile.historial = [];
    try {
        await api.updateProfile(currentProfile.id, { historial: [] });
        showFeedback('Historial limpiado.', 'success');
        renderHistory();
    } catch (error) {
        showFeedback(`Error al limpiar: ${error.message}`, 'error');
        currentProfile.historial = originalHistory; // Revertir
    }
}