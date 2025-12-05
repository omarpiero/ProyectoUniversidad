// frontend/dom.js

/**
 * Almacena todas las referencias a los elementos del DOM en un solo lugar.
 * Esto evita consultas repetitivas y centraliza la gestión de selectores.
 */
export default {
    // Perfiles
    profileSelector: document.getElementById('profileSelector'),
    createProfileBtn: document.getElementById('createProfileBtn'),
    deleteProfileBtn: document.getElementById('deleteProfileBtn'),
    newProfileNameInput: document.getElementById('newProfileName'),
    newProfileEmailInput: document.getElementById('newProfileEmail'),
    profileInfoDiv: document.getElementById('profile-info'),
    loadingIndicator: document.getElementById('loading-indicator'),

    // Generador
    generatorContainer: document.getElementById('generator-container'),
    passwordForm: document.getElementById('passwordForm'),
    passwordOutput: document.getElementById('passwordOutput'),
    copyBtn: document.getElementById('copyBtn'),
    qrBtn: document.getElementById('qrBtn'),
    qrContainer: document.getElementById('qrContainer'),
    qrCanvas: document.getElementById('qrCanvas'),

    // Opciones del Generador
    lengthInput: document.getElementById('length'),
    uppercaseCheck: document.getElementById('uppercase'),
    lowercaseCheck: document.getElementById('lowercase'),
    numbersCheck: document.getElementById('numbers'),
    symbolsCheck: document.getElementById('symbols'),

    // Fortaleza y Sugerencias
    strengthBar: document.getElementById('strengthBar'),
    strengthText: document.getElementById('strengthText'),
    suggestionsContainer: document.getElementById('suggestionsContainer'),
    suggestionsList: document.getElementById('suggestionsList'),

    // Historial
    historyContainer: document.getElementById('history-container'),
    historyList: document.getElementById('historyList'),
    passwordCount: document.getElementById('passwordCount'),
    exportBtn: document.getElementById('exportBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),

    // UI General
    themeToggle: document.getElementById('themeToggle'),
    feedbackModal: document.getElementById('feedbackModal'),
    feedbackMessage: document.getElementById('feedbackMessage'),
    closeModalBtn: document.getElementById('closeModal'),

    // Action Log -- Nueva funcionalidad
    actionLogContainer: document.getElementById('action-log-container'),
    actionLogList: document.getElementById('actionLogList'),
    clearActionLogBtn: document.getElementById('clearActionLogBtn'),
};
