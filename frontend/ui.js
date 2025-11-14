// frontend/ui.js
import dom from './dom.js';
import { currentProfile } from './state.js';

/**
 * Actualiza la UI cuando se selecciona un perfil.
 */
export function updateUIForProfile() {
    if (!currentProfile) return;
    
    [dom.generatorContainer, dom.historyContainer].forEach(el => el.classList.remove('disabled-panel'));
    dom.profileInfoDiv.innerHTML = `<strong>Perfil:</strong> ${currentProfile.nombre_perfil}<br><strong>Email:</strong> ${currentProfile.email}`;
    dom.profileInfoDiv.style.display = 'block';
    dom.deleteProfileBtn.style.display = 'block';

    const { length, uppercase, lowercase, numbers, symbols } = currentProfile.preferencias;
    dom.lengthInput.value = length;
    dom.uppercaseCheck.checked = uppercase;
    dom.lowercaseCheck.checked = lowercase;
    dom.numbersCheck.checked = numbers;
    dom.symbolsCheck.checked = symbols;

    renderHistory();
}

/**
 * Resetea la UI a su estado inicial.
 */
export function resetUI() {
    [dom.generatorContainer, dom.historyContainer].forEach(el => el.classList.add('disabled-panel'));
    dom.profileInfoDiv.style.display = 'none';
    dom.deleteProfileBtn.style.display = 'none';
    dom.passwordOutput.value = '';
    dom.historyList.innerHTML = '';
    dom.passwordCount.textContent = 0;
    dom.profileSelector.value = "";
    updateStrengthMeter('');
}

/**
 * Renderiza la lista del historial.
 */
export function renderHistory() {
    dom.historyList.innerHTML = '';
    if (currentProfile && currentProfile.historial.length > 0) {
        currentProfile.historial.forEach(pass => {
            const li = document.createElement('li');
            li.textContent = pass;
            dom.historyList.appendChild(li);
        });
    } else {
        dom.historyList.innerHTML = '<li>El historial está vacío.</li>';
    }
    dom.passwordCount.textContent = currentProfile ? currentProfile.historial.length : 0;
}

/**
 * Muestra el modal de feedback.
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
 * Actualiza la barra de fortaleza de la contraseña.
 */
export function updateStrengthMeter(password) {
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
    dom.strengthBar.style.width = `${widthPercent}%`;
    dom.strengthBar.style.background = getComputedStyle(document.documentElement).getPropertyValue(level.color).trim();
    dom.strengthText.textContent = `Seguridad: ${level.label}`;
}

/**
 * Genera sugerencias para la contraseña.
 */
export function generateSuggestions(password) {
    dom.suggestionsList.innerHTML = '';
    if (!password) {
        dom.suggestionsContainer.style.display = 'none';
        return;
    }
    
    const suggestions = [];
    if (password.length < 12) suggestions.push("Usa al menos 12 caracteres.");
    if (!/[A-Z]/.test(password)) suggestions.push("Añade letras mayúsculas.");
    if (!/[0-9]/.test(password)) suggestions.push("Incluye algunos números.");
    if (!/[^A-Za-z0-9]/.test(password)) suggestions.push("Agrega símbolos para mayor fuerza.");

    if (suggestions.length === 0) {
        suggestions.push("¡Buena contraseña! Parece muy segura.");
    }

    suggestions.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        dom.suggestionsList.appendChild(li);
    });
    dom.suggestionsContainer.style.display = 'block';
}

/**
 * Genera el código QR.
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