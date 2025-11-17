// frontend/view.js
import dom from './dom.js';

/**
 * Muestra u oculta el indicador de carga.
 * @param {boolean} isLoading
 */
export function setLoading(isLoading) {
    dom.loadingIndicator.style.display = isLoading ? 'block' : 'none';
}

/**
 * Rellena la lista desplegable de perfiles.
 * @param {Array} profiles - La lista de perfiles obtenida de la API.
 */
export function renderProfileList(profiles) {
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
}

/**
 * Habilita o deshabilita los paneles principales.
 * @param {boolean} isEnabled
 */
export function togglePanels(isEnabled) {
    const action = isEnabled ? 'remove' : 'add';
    [dom.generatorContainer, dom.historyContainer].forEach(el => el.classList[action]('disabled-panel'));
}

/**
 * Actualiza la UI para mostrar los datos de un perfil cargado.
 * @param {object} profile - El perfil actual.
 */
export function renderSelectedProfile(profile) {
    if (!profile) return;
    
    dom.profileInfoDiv.innerHTML = `<strong>Perfil:</strong> ${profile.nombre_perfil}<br><strong>Email:</strong> ${profile.email}`;
    dom.profileInfoDiv.style.display = 'block';
    dom.deleteProfileBtn.style.display = 'block';

    const { length, uppercase, lowercase, numbers, symbols } = profile.preferencias;
    dom.lengthInput.value = length;
    dom.uppercaseCheck.checked = uppercase;
    dom.lowercaseCheck.checked = lowercase;
    dom.numbersCheck.checked = numbers;
    dom.symbolsCheck.checked = symbols;
}

/**
 * Resetea la UI al estado inicial (ningún perfil cargado).
 */
export function resetUI() {
    togglePanels(false);
    dom.profileInfoDiv.style.display = 'none';
    dom.deleteProfileBtn.style.display = 'none';
    dom.passwordOutput.value = '';
    renderHistory([]);
    dom.profileSelector.value = "";
    updateStrengthMeter(null);
    renderSuggestions([]);
}

/**
 * "Pinta" la lista del historial en el DOM.
 * @param {Array} history - La lista de contraseñas.
 */
export function renderHistory(history) {
    dom.historyList.innerHTML = '';
    if (history && history.length > 0) {
        history.forEach(pass => {
            const li = document.createElement('li');
            li.textContent = pass;
            dom.historyList.appendChild(li);
        });
    } else {
        dom.historyList.innerHTML = '<li>El historial está vacío.</li>';
    }
    dom.passwordCount.textContent = history ? history.length : 0;
}

/**
 * Muestra el modal de feedback.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - 'success' o 'error'.
 * @param {number} [duration=3000] - Duración en ms (solo para 'success').
 */
export function showFeedback(message, type = 'success', duration = 3000) {
    dom.feedbackMessage.textContent = message;
    dom.feedbackModal.querySelector('.modal-content').style.borderTopColor = type === 'error' ? 'var(--danger)' : 'var(--primary)';
    dom.feedbackModal.style.display = 'flex';
    if (type === 'success') {
        setTimeout(() => dom.feedbackModal.style.display = 'none', duration);
    }
}

/**
 * Cierra el modal de feedback.
 */
export function closeModal() {
    dom.feedbackModal.style.display = 'none';
}

/**
 * Actualiza la barra de fortaleza en la UI.
 * @param {object} strength - El objeto de fortaleza de utils.calculateStrength.
 */
export function updateStrengthMeter(strength) {
    if (!strength) {
        dom.strengthBar.style.width = '0%';
        dom.strengthText.textContent = 'Seguridad: -';
        return;
    }
    dom.strengthBar.style.width = `${strength.widthPercent}%`;
    dom.strengthBar.style.background = getComputedStyle(document.documentElement).getPropertyValue(strength.color).trim();
    dom.strengthText.textContent = `Seguridad: ${strength.label}`;
}

/**
 * "Pinta" las sugerencias en la UI.
 * @param {Array} suggestions - Un array de strings de sugerencias.
 */
export function renderSuggestions(suggestions) {
    dom.suggestionsList.innerHTML = '';
    if (!suggestions || suggestions.length === 0) {
        dom.suggestionsContainer.style.display = 'none';
        return;
    }

    suggestions.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        dom.suggestionsList.appendChild(li);
    });
    dom.suggestionsContainer.style.display = 'block';
}

/**
 * Genera y muestra el código QR.
 */
export function generateQR() {
    const password = dom.passwordOutput.value;
    if (!password) {
        return showFeedback('Genera una contraseña primero.', 'error');
    }
    dom.qrContainer.style.display = 'block';
    const size = 180;
    dom.qrCanvas.width = size;
    dom.qrCanvas.height = size;
    const ctx = dom.qrCanvas.getContext('2d');
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => ctx.drawImage(img, 0, 0, size, size);
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(password)}`;
}

/**
 * Inicializa la lógica del tema (claro/oscuro).
 */
export function initTheme() {
    const savedTheme = localStorage.getItem("preferredTheme");
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const isLight = savedTheme === 'light' || (!savedTheme && prefersLight);
    
    const setTheme = (light) => {
        document.body.classList.toggle("light-theme", light);
        document.querySelector(".theme-label").textContent = light ? "Claro" : "Oscuro";
        localStorage.setItem("preferredTheme", light ? "light" : "dark");
    };

    setTheme(isLight);
    dom.themeToggle.checked = isLight;
    dom.themeToggle.addEventListener('change', (e) => setTheme(e.target.checked));
}