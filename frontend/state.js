// frontend/state.js

// Estado compartido de la aplicación
export let currentProfile = null;

// Función "setter" para modificar el estado de forma controlada
export function setCurrentProfile(profile) {
    currentProfile = profile;
}