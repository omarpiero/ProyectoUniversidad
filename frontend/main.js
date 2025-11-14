// frontend/main.js
import dom from './dom.js';
import * as ui from './ui.js';
import * as handlers from './handlers.js';

/**
 * Delega todos los eventos 'click' desde el 'body'.
 * Esto es más eficiente que añadir múltiples listeners.
 */
function handleClicks(event) {
    const target = event.target;

    // Usamos .closest() para encontrar el botón
    // por su ID, incluso si el usuario hizo clic
    // en un ícono dentro del botón.
    if (target.closest('#createProfileBtn')) {
        handlers.handleCreateProfile();
    } else if (target.closest('#deleteProfileBtn')) {
        handlers.handleDeleteProfile();
    } else if (target.closest('#copyBtn')) {
        handlers.copyToClipboard();
    } else if (target.closest('#qrBtn')) {
        ui.generateQR();
    } else if (target.closest('#exportBtn')) {
        handlers.exportHistory();
    } else if (target.closest('#clearHistoryBtn')) {
        handlers.clearHistory();
    } else if (target.closest('#closeModal')) {
        dom.feedbackModal.style.display = 'none';
    }
}

/**
 * Función de inicialización principal
 */
function initialize() {
    // 1. Delegación de Eventos 'click'
    document.body.addEventListener('click', handleClicks);

    // 2. Eventos 'change' o 'submit' específicos
    dom.profileSelector.addEventListener('change', handlers.handleProfileSelection);
    dom.passwordForm.addEventListener('submit', handlers.handlePasswordGeneration);
    
    // 3. Eventos de 'input'
    dom.passwordOutput.addEventListener('input', (e) => {
        ui.updateStrengthMeter(e.target.value);
        ui.generateSuggestions(e.target.value);
    });
    
    // 4. Carga inicial
    ui.initTheme();
    handlers.loadProfiles();
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initialize);