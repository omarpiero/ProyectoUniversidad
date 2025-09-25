// ===============================
// Constantes globales
// ===============================
const CHAR_SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

// ===============================
// Validaciones
// ===============================
function validarLongitudPassword(length) {
  if (isNaN(length) || length < 8 || length > 32) {
    mostrarError("La longitud debe estar entre 8 y 32 caracteres.");
    return false;
  }
  return true;
}

function validarSeleccionMinimaCaracteres(selecciones) {
  if (!selecciones.some(Boolean)) {
    mostrarError("Debe seleccionar los tipos de caracteres que desea incluir en su contraseña generada.");
    return false;
  }
  return true;
}

function validarCantidadMinimaTipos(selecciones) {
  if (selecciones.filter(Boolean).length < 3) {
    mostrarError("Debe seleccionar al menos 3 tipos de caracteres para obtener contraseñas seguras.");
    return false;
  }
  return true;
}

function validarCantidadContraseñas(quantity) {
  if (isNaN(quantity) || quantity < 1 || quantity > 100) {
    mostrarError("La cantidad debe estar entre 1 y 100.");
    return false;
  }
  return true;
}

// ===============================
// Generación de contraseñas
// ===============================
function construirPoolCaracteres(includeUpper, includeLower, includeNumbers, includeSymbols) {
  let pool = "";
  if (includeUpper) pool += CHAR_SETS.upper;
  if (includeLower) pool += CHAR_SETS.lower;
  if (includeNumbers) pool += CHAR_SETS.numbers;
  if (includeSymbols) pool += CHAR_SETS.symbols;
  return pool;
}

function obtenerCaracterAleatorio(caracteres) {
  return caracteres[Math.floor(Math.random() * caracteres.length)];
}

function contieneTodosLosTipos(password, includeUpper, includeLower, includeNumbers, includeSymbols) {
  if (includeUpper && !/[A-Z]/.test(password)) return false;
  if (includeLower && !/[a-z]/.test(password)) return false;
  if (includeNumbers && !/[0-9]/.test(password)) return false;
  if (includeSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) return false;
  return true;
}

function generarPassword(longitud, includeUpper, includeLower, includeNumbers, includeSymbols) {
  const pool = construirPoolCaracteres(includeUpper, includeLower, includeNumbers, includeSymbols);
  let password = "";
  let intentos = 0;

  do {
    password = "";
    for (let i = 0; i < longitud; i++) {
      password += obtenerCaracterAleatorio(pool);
    }
    intentos++;
  } while (!contieneTodosLosTipos(password, includeUpper, includeLower, includeNumbers, includeSymbols) && intentos < 1000);

  return password;
}

function generarMultiplesPasswords(quantity, length, includeUpper, includeLower, includeNumbers, includeSymbols) {
  let ultima = "";
  for (let i = 0; i < quantity; i++) {
    ultima = generarPassword(length, includeUpper, includeLower, includeNumbers, includeSymbols);
    guardarPasswordEnHistorial(ultima);
  }
  return ultima;
}

// ===============================
// Historial
// ===============================
function cargarHistorial() {
  const historial = JSON.parse(localStorage.getItem("passwordHistory")) || [];
  const lista = document.getElementById("historyList");
  lista.innerHTML = "";

  historial.forEach(pass => {
    const li = document.createElement("li");
    li.textContent = pass;
    lista.appendChild(li);
  });

  document.getElementById("passwordCount").textContent = historial.length;
}

function guardarPasswordEnHistorial(password) {
  try {
    let historial = JSON.parse(localStorage.getItem("passwordHistory")) || [];

    // 🚨 Excepción si se acumulan demasiadas contraseñas
    if (historial.length >= 1000) {
      throw new Error("⚠️ El historial alcanzó el límite de almacenamiento. Reinícialo para continuar.");
    }

    historial.unshift(password);
    localStorage.setItem("passwordHistory", JSON.stringify(historial));
    cargarHistorial();
  } catch (error) {
    mostrarError(error.message);
    console.error("Error en guardarPasswordEnHistorial:", error);
  }
}

function reiniciarHistorial() {
  if (confirm("¿Seguro que deseas reiniciar el historial y el contador?")) {
    localStorage.removeItem("passwordHistory");
    cargarHistorial();
    alert("✅ Historial reiniciado correctamente.");
  }
}

// ===============================
// Exportación
// ===============================
function exportarHistorial() {
  try {
    const historial = JSON.parse(localStorage.getItem("passwordHistory")) || [];

    if (historial.length === 0) {
      throw new Error("⚠️ No hay contraseñas para exportar.");
    }

    const blob = new Blob([historial.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "historial_contraseñas.txt";
    link.click();
  } catch (error) {
    mostrarError(error.message);
    console.error("Error en exportarHistorial:", error);
  }
}


// ===============================
// Funciones auxiliares de validación
// ===============================
function contieneSecuenciasPredecibles(password) {
  return /abc|123|qwerty|abcd/i.test(password);
}

function esDominadaPorUnGrupo(password) {
  const grupos = {
    lower: (password.match(/[a-z]/g) || []).length,
    upper: (password.match(/[A-Z]/g) || []).length,
    numbers: (password.match(/[0-9]/g) || []).length,
    symbols: (password.match(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/g) || []).length
  };
  let maxGroup = Math.max(...Object.values(grupos));
  return maxGroup / (password.length || 1) > 0.8;
}

// ===============================
// Calcular fuerza
// ===============================
function calcularFuerza(password) {
  if (!password) return 0;
  let score = 0;

  // Base por longitud
  score += password.length >= 8 ? 1 : 0;
  score += password.length >= 12 ? 1 : 0;
  score += password.length >= 16 ? 1 : 0;

  // Base por diversidad
  score += /[a-z]/.test(password) ? 1 : 0;
  score += /[A-Z]/.test(password) ? 1 : 0;
  score += /[0-9]/.test(password) ? 1 : 0;
  score += /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password) ? 1 : 0;

  // Excepción 1: secuencias
  try {
    if (contieneSecuenciasPredecibles(password)) {
      throw new Error("❌ La contraseña contiene secuencias predecibles como '123' o 'abc'.");
    }
  } catch (error) {
    mostrarError(error.message);
    score = Math.max(score - 2, 0);
  }

  // Excepción 2: dominada por un solo grupo
  try {
    if (esDominadaPorUnGrupo(password)) {
      throw new Error("❌ La contraseña está dominada por un solo tipo de carácter.");
    }
  } catch (error) {
    mostrarError(error.message);
    score = Math.max(score - 2, 0);
  }

  return score;
}

// ===============================
// NUEVO: Sugerencias de mejora (al menos 20 líneas, fácil de explicar)
// ===============================
function generarSugerencias(password) {
  const container = document.getElementById("suggestionsContainer");
  const lista = document.getElementById("suggestionsList");
  lista.innerHTML = "";

  // Si no hay contraseña, ocultamos el bloque y salimos
  if (!password) {
    container.style.display = "none";
    return;
  }

  const sugerencias = [];

  // Reglas simples y explicables
  if (password.length < 12) {
    sugerencias.push("🔹 Usa al menos 12 caracteres para mayor seguridad.");
  } else if (password.length >= 20) {
    sugerencias.push("🔹 Buena longitud: 20+ caracteres es muy segura.");
  }

  if (!/[A-Z]/.test(password)) {
    sugerencias.push("🔹 Agrega letras mayúsculas (A-Z).");
  }
  if (!/[a-z]/.test(password)) {
    sugerencias.push("🔹 Agrega letras minúsculas (a-z).");
  }
  if (!/[0-9]/.test(password)) {
    sugerencias.push("🔹 Incluye números (0-9).");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    sugerencias.push("🔹 Incluye símbolos especiales para aumentar entropía.");
  }

  if (contieneSecuenciasPredecibles(password)) {
    sugerencias.push("⚠️ Evita secuencias comunes como '123', 'abc' o 'qwerty'.");
  }

  if (esDominadaPorUnGrupo(password)) {
    sugerencias.push("⚠️ Tu contraseña está dominada por un tipo de carácter; mezcla más tipos.");
  }

  // Consejo adicional simple y práctico
  if (sugerencias.length === 0) {
    sugerencias.push("✅ Tu contraseña parece fuerte. Considera usar un gestor de contraseñas o una passphrase.");
  } else {
    sugerencias.push("💡 Tip: una passphrase (frase larga y memorable) es fácil de recordar y segura.");
  }

  // Renderizar
  sugerencias.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s;
    lista.appendChild(li);
  });

  container.style.display = "block";
}

// ===============================
// Actualizar medidor
// ===============================
function actualizarMedidor(password) {
  const bar = document.getElementById("strengthBar");
  const text = document.getElementById("strengthText");
  const score = calcularFuerza(password);

  const niveles = [
    { min: 0, varColor: "--strength-very-weak", label: "Muy débil" },
    { min: 2, varColor: "--strength-weak", label: "Débil" },
    { min: 4, varColor: "--strength-acceptable", label: "Aceptable" },
    { min: 5, varColor: "--strength-strong", label: "Fuerte" },
    { min: 6, varColor: "--strength-very-strong", label: "Muy fuerte" }
  ];

  // Escoger nivel
  let nivel = niveles[0];
  for (let i = niveles.length - 1; i >= 0; i--) {
    if (score >= niveles[i].min) { nivel = niveles[i]; break; }
  }

  const widthPercent = Math.min(100, Math.round((score / 7) * 100));
  bar.style.width = widthPercent + "%";
  bar.style.background = getComputedStyle(document.documentElement).getPropertyValue(nivel.varColor).trim();
  text.textContent = "Seguridad: " + nivel.label;
}

// ===============================
// Interfaz
// ===============================
function toggleHistorial() {
  const contenedor = document.getElementById("historyContainer");
  const toggleBtn = document.getElementById("toggleHistoryBtn");

  const isHidden = contenedor.style.display === "none";
  contenedor.style.display = isHidden ? "block" : "none";
  toggleBtn.textContent = isHidden ? "❌ Ocultar Historial" : "📜 Ver Historial";
}

function mostrarError(message) {
  const modal = document.getElementById("errorModal");
  document.getElementById("errorMessage").textContent = message;
  modal.style.display = "block";

  document.getElementById("closeModal").onclick = () => modal.style.display = "none";
  window.onclick = (event) => {
    if (event.target === modal) modal.style.display = "none";
  };
}

async function copiarPasswordAlPortapapeles() {
  const password = document.getElementById("passwordOutput").value;
  if (!password) {
    mostrarError("No hay contraseña para copiar.");
    return;
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(password);
      alert("✅ Contraseña copiada al portapapeles");
    } else {
      // Fallback para algunos navegadores o contexto file://
      const textarea = document.createElement("textarea");
      textarea.value = password;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        alert("✅ Contraseña copiada (método alternativo).");
      } catch (err) {
        prompt("Copia manualmente esta contraseña:", password);
      }
      textarea.remove();
    }
  } catch (err) {
    console.error("Error copiando al portapapeles:", err);
    prompt("Copia manualmente esta contraseña:", password);
  }
}

// ===============================
// Manejo formulario
// ===============================
function manejarGeneracion(event) {
  event.preventDefault();

  const length = parseInt(document.getElementById("length").value);
  const quantity = parseInt(document.getElementById("quantity").value);
  const includeUpper = document.getElementById("uppercase").checked;
  const includeLower = document.getElementById("lowercase").checked;
  const includeNumbers = document.getElementById("numbers").checked;
  const includeSymbols = document.getElementById("symbols").checked;

  const selecciones = [includeUpper, includeLower, includeNumbers, includeSymbols];

  if (!validarLongitudPassword(length)) return;
  if (!validarSeleccionMinimaCaracteres(selecciones)) return;
  if (!validarCantidadMinimaTipos(selecciones)) return;
  if (!validarCantidadContraseñas(quantity)) return;

  const ultima = generarMultiplesPasswords(quantity, length, includeUpper, includeLower, includeNumbers, includeSymbols);

  document.getElementById("passwordOutput").value = ultima;
  actualizarMedidor(ultima);
  generarSugerencias(ultima); // <-- llamada a la nueva funcionalidad
}

// ===============================
// Tema (claro / oscuro)
// ===============================
const THEME_KEY = "preferredTheme"; // "dark" o "light"

function setTheme(isLight) {
  if (isLight) {
    document.body.classList.add("light-theme");
    document.getElementById("themeToggle").checked = true;
    document.querySelector(".theme-label").textContent = "Claro";
    localStorage.setItem(THEME_KEY, "light");
  } else {
    document.body.classList.remove("light-theme");
    document.getElementById("themeToggle").checked = false;
    document.querySelector(".theme-label").textContent = "Oscuro";
    localStorage.setItem(THEME_KEY, "dark");
  }
}

function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");

  // Preferencia guardada -> aplicar
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light") {
    setTheme(true);
  } else if (saved === "dark") {
    setTheme(false);
  } else {
    // Sin preferencia: usar modo oscuro por defecto pero permitir preferencia de sistema como alternativa
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(prefersLight); // si el sistema sugiere claro, respetarlo; si no, se queda oscuro
  }

  toggle.addEventListener("change", (e) => {
    setTheme(e.target.checked);
    // actualizar medidor para forzar reaplicación de colores (si corresponde)
    const current = document.getElementById("passwordOutput").value;
    actualizarMedidor(current);
  });
}

// ===============================
// Inicialización
// ===============================
function inicializarEventos() {
  document.getElementById("passwordForm").addEventListener("submit", manejarGeneracion);
  document.getElementById("copyBtn").addEventListener("click", copiarPasswordAlPortapapeles);
  document.getElementById("toggleHistoryBtn").addEventListener("click", toggleHistorial);
  document.getElementById("exportBtn").addEventListener("click", exportarHistorial);
  document.getElementById("resetBtn").addEventListener("click", reiniciarHistorial);
  document.getElementById("passwordOutput").addEventListener("input", (e) => {
    actualizarMedidor(e.target.value);
    generarSugerencias(e.target.value);
  });

  window.onload = () => {
    cargarHistorial();
    initThemeToggle();
    // Si ya hay una contraseña (ej. al recargar), actualiza medidor y sugerencias
    const current = document.getElementById("passwordOutput").value;
    actualizarMedidor(current);
    generarSugerencias(current);
  };
}

inicializarEventos();
