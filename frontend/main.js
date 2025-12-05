// frontend/main.js (El Controlador)
import * as api from './api.js';
import dom from './dom.js';
import * as view from './view.js';
import * as utils from './utils.js';

// --- ESTADO DE LA APLICACIÓN ---
let currentProfile = null;

// --- CONTROLADORES (Lógica de Eventos) ---

/**
 * Carga la lista inicial de perfiles.
 */
async function loadProfiles() {
    view.setLoading(true);
    try {
        const profiles = await api.getProfiles();
        view.renderProfileList(profiles);
    } catch (error) {
        view.showFeedback(`Error al cargar perfiles: ${error.message}`, 'error');
    } finally {
        view.setLoading(false);
    }
}

/**
 * Maneja la selección de un perfil de la lista.
 */
async function handleProfileSelection() {
    const profileId = dom.profileSelector.value;
    if (!profileId) {
        currentProfile = null;
        view.resetUI();
        return;
    }
    try {
        const profile = await api.getProfileById(profileId);
        currentProfile = profile;
        view.renderSelectedProfile(profile);
        view.renderHistory(profile.historial);
        view.togglePanels(true);
    } catch (error) {
        view.showFeedback(error.message, 'error');
    }
}

/**
 * Maneja la creación de un nuevo perfil.
 */
async function handleCreateProfile() {
    const nombre = dom.newProfileNameInput.value.trim();
    const email = dom.newProfileEmailInput.value.trim();
    if (!nombre || !email) {
        return view.showFeedback('Nombre y email son requeridos.', 'error');
    }
    try {
        const newProfile = await api.createProfile({ nombre_perfil: nombre, email });
        view.showFeedback('Perfil creado y cargado exitosamente.', 'success');
        dom.newProfileNameInput.value = '';
        dom.newProfileEmailInput.value = '';
        
        await loadProfiles(); // Recargar la lista
        dom.profileSelector.value = newProfile.id; // Seleccionar el nuevo
        
        currentProfile = newProfile; // Cargar el nuevo perfil en el estado
        view.renderSelectedProfile(newProfile);
        view.renderHistory(newProfile.historial);
        view.togglePanels(true);
        view.pushMessage('success', 'Perfil creado'); // Encargado del Action Log
    } catch (error) {
        view.showFeedback(error.message, 'error');
    }
}

/**
 * Maneja la eliminación del perfil actual.
 */
async function handleDeleteProfile() {
    if (!currentProfile || !confirm(`¿Seguro que quieres eliminar "${currentProfile.nombre_perfil}"?`)) {
        return;
    }
    try {
        await api.deleteProfile(currentProfile.id);
        view.showFeedback('Perfil eliminado.', 'success');
        currentProfile = null;
        await loadProfiles();
        view.resetUI();
        view.pushMessage('success', 'Perfil eliminado'); // Encargado del Action Log
    } catch (error) {
        view.showFeedback(error.message, 'error');
    }
}

/**
 * Maneja la generación de una nueva contraseña.
 */
async function handlePasswordGeneration(event) {
    event.preventDefault();
    if (!currentProfile) {
        return view.showFeedback('Selecciona un perfil para empezar.', 'error');
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
        return view.showFeedback('Seleccione los tipos de carácteres...', 'error');
    } else if (checkedCount < 3) {
        return view.showFeedback('Seleccione al menos 3 tipos de carácteres...', 'error');
    }

    // 1. Lógica Pura (Utils)
    const password = utils.generatePassword(opts.length, opts);
    const strength = utils.calculateStrength(password);
    const suggestions = utils.getSuggestions(password);

    // 2. Actualizar Estado
    currentProfile.historial.unshift(password);
    currentProfile.preferencias = opts;

    // 3. "Pintar" en la Vista (View)
    dom.passwordOutput.value = password;
    view.updateStrengthMeter(strength);
    view.renderSuggestions(suggestions);

    // 4. Guardar en el Modelo (API)
    try {
        await api.updateProfile(currentProfile.id, {
            historial: currentProfile.historial,
            preferencias: currentProfile.preferencias
        });
        // Si el guardado es exitoso, renderizar historial
        view.renderHistory(currentProfile.historial);
        view.pushMessage('success', 'Contraseña generada'); // Encargado del Action Log
    } catch (error) {
        view.showFeedback(`Error al guardar: ${error.message}`, 'error');
        // Revertir cambio de estado local si falla el guardado
        currentProfile.historial.shift();
    }
}

/**
 * Maneja la copia al portapapeles.
 */
function copyToClipboard() {
    if (!dom.passwordOutput.value) {
        return view.showFeedback('No hay contraseña para copiar.', 'error');
    }
    navigator.clipboard.writeText(dom.passwordOutput.value)
        .then(() => {
            view.showFeedback('Copiado al portapapeles.', 'success', 1500);
            view.pushMessage('success', 'Contraseña copiada');
        })
        .catch(() => view.showFeedback('Error al copiar.', 'error'));
}

/**
 * Maneja la exportación del historial a .txt
 */
function exportHistory() {
    if (!currentProfile || currentProfile.historial.length === 0) {
        return view.showFeedback('No hay historial para exportar.', 'error');
    }
    const text = currentProfile.historial.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial_${currentProfile.nombre_perfil}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    view.pushMessage('success', 'Historial exportado'); // Encargado del Action Log
}

/**
 * Maneja la limpieza del historial.
 */
async function clearHistory() {
    if (!currentProfile || currentProfile.historial.length === 0) {
        return view.showFeedback('El historial ya está vacío.', 'error');
    }
    if (!confirm('¿Seguro que quieres limpiar el historial de este perfil?')) return;
    
    const originalHistory = [...currentProfile.historial];
    currentProfile.historial = [];
    
    try {
        await api.updateProfile(currentProfile.id, { historial: [] });
        view.showFeedback('Historial limpiado.', 'success');
        view.renderHistory(currentProfile.historial);
    } catch (error) {
        view.showFeedback(`Error al limpiar: ${error.message}`, 'error');
        currentProfile.historial = originalHistory; // Revertir estado
    }
}

// --- INICIALIZACIÓN ---

function initialize() {
    // Eventos de Perfil
    dom.profileSelector.addEventListener('change', handleProfileSelection);
    dom.createProfileBtn.addEventListener('click', handleCreateProfile);
    dom.deleteProfileBtn.addEventListener('click', handleDeleteProfile);
    
    // Eventos del Generador
    dom.passwordForm.addEventListener('submit', handlePasswordGeneration);
    dom.copyBtn.addEventListener('click', copyToClipboard);
    dom.qrBtn.addEventListener('click', view.generateQR);
    dom.passwordOutput.addEventListener('input', (e) => {
        const password = e.target.value;
        view.updateStrengthMeter(utils.calculateStrength(password));
        view.renderSuggestions(utils.getSuggestions(password));
    });

    // Eventos de Historial
    dom.exportBtn.addEventListener('click', exportHistory);
    dom.clearHistoryBtn.addEventListener('click', clearHistory);
    dom.clearActionLogBtn.addEventListener('click', view.clearActionLog); // Botón Clear Action Log
    
    // Eventos del Modal y Tema
    dom.closeModalBtn.addEventListener('click', view.closeModal);
    
    // Carga inicial
    view.initTheme();
    loadProfiles();
}

// Arrancar la aplicación
document.addEventListener('DOMContentLoaded', initialize);