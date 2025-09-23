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
  return maxGroup / password.length > 0.8;
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
// Actualizar medidor
// ===============================
function actualizarMedidor(password) {
  const bar = document.getElementById("strengthBar");
  const text = document.getElementById("strengthText");
  const score = calcularFuerza(password);

  const niveles = [
    { min: 0, color: "red", label: "Muy débil" },
    { min: 2, color: "orange", label: "Débil" },
    { min: 4, color: "yellow", label: "Aceptable" },
    { min: 5, color: "lightgreen", label: "Fuerte" },
    { min: 6, color: "green", label: "Muy fuerte" }
  ];

  const nivel = niveles.reverse().find(n => score >= n.min) || niveles[0];

  bar.style.width = (score / 7) * 100 + "%";
  bar.style.background = nivel.color;
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

function copiarPasswordAlPortapapeles() {
  const password = document.getElementById("passwordOutput").value;
  if (password) {
    navigator.clipboard.writeText(password);
    alert("✅ Contraseña copiada al portapapeles");
  }
}

// ===============================
// Flujo principal
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
  document.getElementById("passwordOutput").addEventListener("input", (e) => actualizarMedidor(e.target.value));
  window.onload = cargarHistorial;
}

inicializarEventos();
