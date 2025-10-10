// CÓDIGO CORREGIDO
const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * Realiza una llamada genérica a la API, manejando errores comunes.
 * @param {string} endpoint - El endpoint de la API (ej. '/perfiles').
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE).
 * @param {object|null} body - El cuerpo de la solicitud para POST/PUT.
 * @returns {Promise<any>} - La respuesta JSON de la API.
 * @throws {Error} - Si la respuesta de la red no es OK.
 */
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido en la API' }));
        throw new Error(errorData.error || `Error HTTP ${response.status}`);
    }

    // DELETE puede no devolver contenido
    if (response.status === 204 || method === 'DELETE') {
        return { success: true };
    }
    
    return response.json();
}
// Funciones exportadas para cada operación CRUD

export function getProfiles() {
    return apiCall('/perfiles');
}

export function getProfileById(id) {
    return apiCall(`/perfiles/${id}`);
}

export function createProfile(data) {
    return apiCall('/perfiles', 'POST', data);
}

export function updateProfile(id, data) {
    return apiCall(`/perfiles/${id}`, 'PUT', data);
}

export function deleteProfile(id) {
    return apiCall(`/perfiles/${id}`, 'DELETE');
}
