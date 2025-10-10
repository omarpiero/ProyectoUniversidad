import * as api from './api.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- ESTADO DE LA APLICACIÓN ---
    let currentProfile = null;

    // --- SELECTORES DEL DOM ---
    const dom = {
        profileSelector: document.getElementById('profileSelector'),
        createProfileBtn: document.getElementById('createProfileBtn'),
        deleteProfileBtn: document.getElementById('deleteProfileBtn'),
        newProfileNameInput: document.getElementById('newProfileName'),
        newProfileEmailInput: document.getElementById('newProfileEmail'),
        passwordForm: document.getElementById('passwordForm'),
        passwordOutput: document.getElementById('passwordOutput'),
        copyBtn: document.getElementById('copyBtn'),
        historyList: document.getElementById('historyList'),
        passwordCount: document.getElementById('passwordCount'),
        generatorContainer: document.getElementById('generator-container'),
        historyContainer: document.getElementById('history-container'),
        profileInfoDiv: document.getElementById('profile-info'),
        loadingIndicator: document.getElementById('loading-indicator'),
        themeToggle: document.getElementById('themeToggle'),
        feedbackModal: document.getElementById('feedbackModal'),
        feedbackMessage: document.getElementById('feedbackMessage'),
        closeModalBtn: document.getElementById('closeModal'),
        strengthBar: document.getElementById('strengthBar'),
        strengthText: document.getElementById('strengthText'),
        suggestionsContainer: document.getElementById('suggestionsContainer'),
        suggestionsList: document.getElementById('suggestionsList'),
        qrBtn: document.getElementById('qrBtn'),
        qrContainer: document.getElementById('qrContainer'),
        qrCanvas: document.getElementById('qrCanvas'),
        exportBtn: document.getElementById('exportBtn'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        lengthInput: document.getElementById('length'),
        uppercaseCheck: document.getElementById('uppercase'),
        lowercaseCheck: document.getElementById('lowercase'),
        numbersCheck: document.getElementById('numbers'),
        symbolsCheck: document.getElementById('symbols'),
    };

    // --- LÓGICA DE PERFILES ---

    async function loadProfiles() {
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

    async function handleProfileSelection() {
        const profileId = dom.profileSelector.value;
        if (!profileId) {
            resetUI();
            return;
        }
        try {
            const profile = await api.getProfileById(profileId);
            currentProfile = profile;
            updateUIForProfile();
        } catch (error) {
            showFeedback(error.message, 'error');
        }
    }

    async function handleCreateProfile() {
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
            currentProfile = newProfile;
            updateUIForProfile();
        } catch (error) {
            showFeedback(error.message, 'error');
        }
    }

    async function handleDeleteProfile() {
        if (!currentProfile || !confirm(`¿Seguro que quieres eliminar "${currentProfile.nombre_perfil}"?`)) {
            return;
        }
        try {
            await api.deleteProfile(currentProfile.id);
            showFeedback('Perfil eliminado.', 'success');
            currentProfile = null;
            await loadProfiles();
            resetUI();
        } catch (error) {
            showFeedback(error.message, 'error');
        }
    }

    // --- LÓGICA DE INTERFAZ (UI) ---

    function updateUIForProfile() {
        if (!currentProfile) return;
        
        // Activar paneles
        [dom.generatorContainer, dom.historyContainer].forEach(el => el.classList.remove('disabled-panel'));

        // Mostrar info
        dom.profileInfoDiv.innerHTML = `<strong>Perfil:</strong> ${currentProfile.nombre_perfil}<br><strong>Email:</strong> ${currentProfile.email}`;
        dom.profileInfoDiv.style.display = 'block';
        dom.deleteProfileBtn.style.display = 'block';

        // Cargar preferencias
        const { length, uppercase, lowercase, numbers, symbols } = currentProfile.preferencias;
        dom.lengthInput.value = length;
        dom.uppercaseCheck.checked = uppercase;
        dom.lowercaseCheck.checked = lowercase;
        dom.numbersCheck.checked = numbers;
        dom.symbolsCheck.checked = symbols;

        // Cargar historial
        renderHistory();
    }

    function resetUI() {
        [dom.generatorContainer, dom.historyContainer].forEach(el => el.classList.add('disabled-panel'));
        dom.profileInfoDiv.style.display = 'none';
        dom.deleteProfileBtn.style.display = 'none';
        dom.passwordOutput.value = '';
        dom.historyList.innerHTML = '';
        dom.passwordCount.textContent = 0;
        dom.profileSelector.value = "";
        updateStrengthMeter('');
    }

    function renderHistory() {
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
    
    function showFeedback(message, type = 'success', duration = 3000) {
        dom.feedbackMessage.textContent = message;
        dom.feedbackModal.querySelector('.modal-content').style.borderTopColor = type === 'error' ? 'var(--danger)' : 'var(--primary)';
        dom.feedbackModal.style.display = 'flex';
        if (type === 'success') {
            setTimeout(() => dom.feedbackModal.style.display = 'none', duration);
        }
    }

    // --- LÓGICA DE GENERACIÓN DE CONTRASEÑAS (Original y Mejorada) ---
    
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

        // Shuffle para que los caracteres requeridos no estén siempre al principio
        for (let i = passwordChars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
        }

        return passwordChars.join('');
    }

async function handlePasswordGeneration(event) {
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
        
        // Contamos cuántos checkboxes están marcados
        const checkedCount = Object.values(opts).filter(v => typeof v === 'boolean' && v).length;

        // Aplicamos las nuevas reglas de validación
        if (checkedCount === 0) {
            return showFeedback('Seleccione los tipos de carácteres con los que desee generar su contraseña.', 'error');
        } else if (checkedCount < 3) { // Esto cubre los casos de 1 y 2 seleccionados
            return showFeedback('Seleccione al menos 3 tipos de carácteres para generar una contraseña segura.', 'error');
        }

        const password = generatePassword(opts.length, opts);
        dom.passwordOutput.value = password;
        updateStrengthMeter(password);
        generateSuggestions(password);

        // Guardar en backend
        currentProfile.historial.unshift(password); // Añadir al inicio
        currentProfile.preferencias = opts;
        try {
            await api.updateProfile(currentProfile.id, {
                historial: currentProfile.historial,
                preferencias: currentProfile.preferencias
            });
            renderHistory();
        } catch (error) {
            showFeedback(`Error al guardar: ${error.message}`, 'error');
            // Revertir cambio local si falla el guardado
            currentProfile.historial.shift();
        }
    }
    
    // --- FUNCIONALIDADES ADICIONALES (Restauradas) ---

    function copyToClipboard() {
        if (!dom.passwordOutput.value) {
            return showFeedback('No hay contraseña para copiar.', 'error');
        }
        navigator.clipboard.writeText(dom.passwordOutput.value)
            .then(() => showFeedback('Copiado al portapapeles.', 'success', 1500))
            .catch(() => showFeedback('Error al copiar.', 'error'));
    }

    function exportHistory() {
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
    
    async function clearHistory() {
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

    function generateQR() {
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
    
    // --- LÓGICA DE ANÁLISIS DE CONTRASEÑA ---

    function updateStrengthMeter(password) {
        // Lógica de cálculo de fuerza (puedes usar la tuya original)
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

    function generateSuggestions(password) {
        // Lógica de sugerencias (puedes usar la tuya original)
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
    
    // --- INICIALIZACIÓN ---

    function initTheme() {
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

    function initialize() {
        // Eventos de Perfil
        dom.profileSelector.addEventListener('change', handleProfileSelection);
        dom.createProfileBtn.addEventListener('click', handleCreateProfile);
        dom.deleteProfileBtn.addEventListener('click', handleDeleteProfile);
        
        // Eventos del Generador
        dom.passwordForm.addEventListener('submit', handlePasswordGeneration);
        dom.copyBtn.addEventListener('click', copyToClipboard);
        dom.qrBtn.addEventListener('click', generateQR);
        dom.passwordOutput.addEventListener('input', (e) => {
            updateStrengthMeter(e.target.value);
            generateSuggestions(e.target.value);
        });

        // Eventos de Historial
        dom.exportBtn.addEventListener('click', exportHistory);
        dom.clearHistoryBtn.addEventListener('click', clearHistory);
        
        // Eventos del Modal y Tema
        dom.closeModalBtn.onclick = () => dom.feedbackModal.style.display = 'none';
        
        initTheme();
        loadProfiles(); // Carga inicial
    }

    initialize();
});
