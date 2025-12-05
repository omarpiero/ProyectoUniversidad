// frontend/view.js
import dom from './dom.js';

/** 
 * Crea una cola de mensajes con tamaño máximo.
 * @param {number} maxSize - Tamaño máximo de la cola.
 * @returns {object} - Objeto con métodos push, next, clear, getAll, remove.
 */
// APARTADO - Funcionalidad mejorada: Cola de Mensajes para Action Log
export function createMessageQueue(maxSize = 50) {
    const queue = [];
    return {
        push(msg) {
            queue.push(msg);
            if (queue.length > maxSize) {
                queue.shift();
            }
        },
        next() {
            return queue.shift();
        },
        clear() {
            queue.length = 0;
        },
        getAll() {
            return [...queue];
        },
        remove(id) {
            const index = queue.findIndex(m => m.id === id);
            if (index > -1) queue.splice(index, 1);
        }
    };
}

// Instancia de la cola de acciones
const actionQueue = createMessageQueue();

/**
 * Añade un mensaje a la cola de acciones y lo renderiza.
 * Los mensajes permanecen hasta que el usuario limpie el panel manualmente.
 * @param {string} type - 'success', 'error', 'info'.
 * @param {string} text - Texto del mensaje.
 */
export function pushMessage(type, text) {
    const id = Date.now();
    const msg = { id, text, type, timestamp: id };
    actionQueue.push(msg);
    renderActionLog();
}

/**
 * Renderiza la lista de acciones en el DOM.
 */
export function renderActionLog() {
    if (!dom.actionLogList) return; // Si no existe aún, no renderizar
    dom.actionLogList.innerHTML = '';
    
    const messages = actionQueue.getAll();
    
    if (messages.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No hay acciones registradas.';
        li.classList.add('action-empty');
        dom.actionLogList.appendChild(li);
        return;
    }
    
    messages.forEach(msg => {
        const li = document.createElement('li');
        
        // Crear estructura con icono y texto
        const icon = getIconForType(msg.type);
        const timeStr = new Date(msg.timestamp).toLocaleTimeString();
        
        li.innerHTML = `<span class="action-icon">${icon}</span> <span class="action-text">${msg.text}</span> <span class="action-time">${timeStr}</span>`;
        li.classList.add(`action-${msg.type}`);
        li.style.animation = 'slideIn 0.5s ease-out';
        dom.actionLogList.appendChild(li);
    });
}

/**
 * Obtiene el icono apropiado según el tipo de mensaje.
 * @param {string} type - Tipo de mensaje.
 * @returns {string} - Emoji del icono.
 */
function getIconForType(type) {
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

/**
 * Limpia la cola de acciones y re-renderiza.
 */
export function clearActionLog() {
    actionQueue.clear();
    renderActionLog();
    pushMessage('info', 'Panel de acciones limpiado');
}

/**
 * Ejecuta tests si la URL contiene ?runTests=1.
 */
function runTests() {
    if (!window.location.search.includes('runTests=1')) return;
    console.log('Running Action Log Tests...');
    const q = createMessageQueue(3);
    // Test push
    q.push({id:1, text:'msg1', type:'info'});
    assert(q.getAll().length === 1, 'Push one');
    q.push({id:2, text:'msg2', type:'success'});
    q.push({id:3, text:'msg3', type:'error'});
    q.push({id:4, text:'msg4', type:'info'}); // Debería mantener 2,3,4
    assert(q.getAll().length === 3, 'Max size');
    assert(q.getAll()[0].id === 2, 'FIFO');
    q.remove(2);
    assert(q.getAll().length === 2, 'Remove');
    assert(q.getAll()[0].id === 3, 'Remove correct');
    q.clear();
    assert(q.getAll().length === 0, 'Clear');
    console.log('All tests passed!');
}

function assert(cond, msg) {
    if (!cond) {
        console.error('Test failed: ' + msg);
        throw new Error(msg);
    }
}

// Ejecutar tests si corresponde
runTests();

//FIN APARTADO


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
    [dom.generatorContainer, dom.historyContainer, dom.actionLogContainer].forEach(el => el.classList[action]('disabled-panel'));
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
export function updateStrengthMeter(strength, timeEstimate = "") {
    if (!strength) {
        dom.strengthBar.style.width = '0%';
        dom.strengthText.innerHTML = 'Seguridad: -'; // Limpiar
        return;
    }
    dom.strengthBar.style.width = `${strength.widthPercent}%`;
    dom.strengthBar.style.background = getComputedStyle(document.documentElement).getPropertyValue(strength.color).trim();
    
    // ACTUALIZADO: Incluye el tiempo estimado si existe
    const timeText = timeEstimate ? ` <span style="opacity: 0.8; font-size: 0.9em;">(Tiempo: ${timeEstimate})</span>` : '';
    dom.strengthText.innerHTML = `Seguridad: ${strength.label}${timeText}`;
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
/**
 * Alterna la visibilidad del campo de contraseña.
 */
export function togglePasswordVisibility() {
    const currentType = dom.passwordOutput.type;
    const isHidden = currentType === 'password';
    
    // 1. Alternar input principal
    dom.passwordOutput.type = isHidden ? 'text' : 'password';
    
    // 2. Alternar icono del botón
    dom.toggleVisibilityBtn.textContent = isHidden ? '🔒' : '👁️';

    // 3. [NUEVO] Alternar borrosidad en el historial
    // Si estaba oculto (password) y pasamos a text, quitamos el blur.
    // Si estaba visible (text) y pasamos a password, ponemos el blur.
    if (isHidden) {
        dom.historyList.classList.remove('blur-content');
    } else {
        dom.historyList.classList.add('blur-content');
    }
}