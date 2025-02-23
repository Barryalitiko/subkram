const path = require("path");
const fs = require("fs");

const databasePath = path.resolve(__dirname, "..", "..", "database");

const INACTIVE_GROUPS_FILE = "inactive-groups";
const ANTI_LINK_GROUPS_FILE = "anti-link-groups";
const WELCOME_GROUPS_FILE = "welcome-groups";
const GOODBYE_GROUPS_FILE = "goodbye-groups"; // Archivo para gestionar la despedida
const SPAM_DETECTION_FILE = "spam-detection";
const MUTE_GROUPS_FILE = "mute-groups";
const ONLY_ADMIN_GROUPS_FILE = "only-admin-groups"; // Archivo para manejar los grupos con solo administradores

// Crear las carpetas necesarias si no existen
function createIfNotExists(fullPath) {
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // Crear las carpetas necesarias
    }
    if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, JSON.stringify({})); // Crear archivo vacío si no existe
    }
}

// Leer un archivo JSON
function readJSON(jsonFile) {
    const fullPath = path.resolve(databasePath, `${jsonFile}.json`);
    createIfNotExists(fullPath);
    try {
        return JSON.parse(fs.readFileSync(fullPath, "utf8"));
    } catch (err) {
        console.error(`Error al leer el archivo ${jsonFile}:`, err);
        return {}; // Retornar un objeto vacío en caso de error
    }
}

// Escribir datos en un archivo JSON
function writeJSON(jsonFile, data) {
    const fullPath = path.resolve(databasePath, `${jsonFile}.json`);
    createIfNotExists(fullPath);
    try {
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error al escribir en el archivo ${jsonFile}:`, err);
    }
}

// Manejo del estado general de los grupos
exports.activateGroup = (groupId) => {
    const inactiveGroups = readJSON(INACTIVE_GROUPS_FILE);
    const index = inactiveGroups.indexOf(groupId);
    if (index !== -1) {
        inactiveGroups.splice(index, 1);
        writeJSON(INACTIVE_GROUPS_FILE, inactiveGroups);
    }
};

exports.deactivateGroup = (groupId) => {
    const inactiveGroups = readJSON(INACTIVE_GROUPS_FILE);
    if (!inactiveGroups.includes(groupId)) {
        inactiveGroups.push(groupId);
        writeJSON(INACTIVE_GROUPS_FILE, inactiveGroups);
    }
};

exports.isActiveGroup = (groupId) => {
    const inactiveGroups = readJSON(INACTIVE_GROUPS_FILE);
    return !inactiveGroups.includes(groupId);
};

// Manejo de la configuración de bienvenida
exports.activateWelcomeGroup = (groupId) => {
    const welcomeGroups = readJSON(WELCOME_GROUPS_FILE);
    welcomeGroups[groupId] = { enabled: true, mode: "1" };
    writeJSON(WELCOME_GROUPS_FILE, welcomeGroups);
};

exports.deactivateWelcomeGroup = (groupId) => {
    const welcomeGroups = readJSON(WELCOME_GROUPS_FILE);
    delete welcomeGroups[groupId];
    writeJSON(WELCOME_GROUPS_FILE, welcomeGroups);
};

exports.setWelcomeMode = (groupId, mode) => {
    const welcomeGroups = readJSON(WELCOME_GROUPS_FILE);
    if (welcomeGroups[groupId]) {
        welcomeGroups[groupId].mode = mode;
        writeJSON(WELCOME_GROUPS_FILE, welcomeGroups);
    }
};

exports.getWelcomeMode = (groupId) => {
    const welcomeGroups = readJSON(WELCOME_GROUPS_FILE);
    return welcomeGroups[groupId] ? welcomeGroups[groupId].mode : null;
};

exports.isActiveWelcomeGroup = (groupId) => {
    const welcomeGroups = readJSON(WELCOME_GROUPS_FILE);
    return welcomeGroups[groupId] && welcomeGroups[groupId].enabled;
};

// Manejo de la configuración de despedida
exports.activateGoodbyeGroup = (groupId) => {
    const goodbyeGroups = readJSON(GOODBYE_GROUPS_FILE); // Crear archivo goodbye-groups si no existe
    goodbyeGroups[groupId] = { enabled: true, mode: "1" };
    writeJSON(GOODBYE_GROUPS_FILE, goodbyeGroups);
};

exports.deactivateGoodbyeGroup = (groupId) => {
    const goodbyeGroups = readJSON(GOODBYE_GROUPS_FILE);
    delete goodbyeGroups[groupId];
    writeJSON(GOODBYE_GROUPS_FILE, goodbyeGroups);
};

exports.setGoodbyeMode = (groupId, mode) => {
    const goodbyeGroups = readJSON(GOODBYE_GROUPS_FILE);
    if (goodbyeGroups[groupId]) {
        goodbyeGroups[groupId].mode = mode;
        writeJSON(GOODBYE_GROUPS_FILE, goodbyeGroups);
    }
};

exports.getGoodbyeMode = (groupId) => {
    const goodbyeGroups = readJSON(GOODBYE_GROUPS_FILE);
    return goodbyeGroups[groupId] ? goodbyeGroups[groupId].mode : null;
};

exports.isActiveGoodbyeGroup = (groupId) => {
    const goodbyeGroups = readJSON(GOODBYE_GROUPS_FILE);
    return goodbyeGroups[groupId] && goodbyeGroups[groupId].enabled;
};

// Manejo del anti-link
exports.activateAntiLinkGroup = (groupId, mode = "1") => {
    const filename = ANTI_LINK_GROUPS_FILE;
    const antiLinkGroups = readJSON(filename);
    antiLinkGroups[groupId] = { enabled: true, mode };
    writeJSON(filename, antiLinkGroups);
};

exports.deactivateAntiLinkGroup = (groupId) => {
    const filename = ANTI_LINK_GROUPS_FILE;
    const antiLinkGroups = readJSON(filename);
    delete antiLinkGroups[groupId];
    writeJSON(filename, antiLinkGroups);
};

exports.setAntiLinkMode = (groupId, mode) => {
    const filename = ANTI_LINK_GROUPS_FILE;
    const antiLinkGroups = readJSON(filename);
    if (antiLinkGroups[groupId]) {
        antiLinkGroups[groupId].mode = mode;
        writeJSON(filename, antiLinkGroups);
    }
};

exports.getAntiLinkMode = (groupId) => {
    const filename = ANTI_LINK_GROUPS_FILE;
    const antiLinkGroups = readJSON(filename);
    return antiLinkGroups[groupId] ? antiLinkGroups[groupId].mode : null;
};

exports.isActiveAntiLinkGroup = (groupId) => {
    const filename = ANTI_LINK_GROUPS_FILE;
    const antiLinkGroups = readJSON(filename);
    return antiLinkGroups[groupId] && antiLinkGroups[groupId].enabled;
};

// Manejo de la detección de spam
exports.activateSpamDetection = (groupId) => {
    const spamDetection = readJSON(SPAM_DETECTION_FILE);
    spamDetection[groupId] = true;
    writeJSON(SPAM_DETECTION_FILE, spamDetection);
};

exports.deactivateSpamDetection = (groupId) => {
    const spamDetection = readJSON(SPAM_DETECTION_FILE);
    delete spamDetection[groupId];
    writeJSON(SPAM_DETECTION_FILE, spamDetection);
};

exports.isSpamDetectionActive = (groupId) => {
    const spamDetection = readJSON(SPAM_DETECTION_FILE);
    return !!spamDetection[groupId];
};

// Agregar usuario a la lista de muteados
exports.muteUser = (groupId, userId, expirationTime) => {
    const muteGroups = readJSON(MUTE_GROUPS_FILE);
    if (!muteGroups[groupId]) {
        muteGroups[groupId] = {};
    }
    muteGroups[groupId][userId] = expirationTime;
    writeJSON(MUTE_GROUPS_FILE, muteGroups);
};

// Eliminar usuario de la lista de muteados
exports.unmuteUser = (groupId, userId) => {
    const muteGroups = readJSON(MUTE_GROUPS_FILE);
    if (muteGroups[groupId] && muteGroups[groupId][userId]) {
        delete muteGroups[groupId][userId];
        writeJSON(MUTE_GROUPS_FILE, muteGroups);
    }
};

// Verificar si un usuario está muteado y si el muteo sigue activo
exports.isUserMuted = (groupId, userId) => {
    const muteGroups = readJSON(MUTE_GROUPS_FILE);
    const userMute = muteGroups[groupId] && muteGroups[groupId][userId];
    return userMute && userMute > Date.now(); // Verifica si el muteo sigue activo
};

// Obtener el tiempo de expiración del muteo
exports.getMuteExpiration = (groupId, userId) => {
    const muteGroups = readJSON(MUTE_GROUPS_FILE);
    return muteGroups[groupId] ? muteGroups[groupId][userId] : null;
};

// Crear las funciones para activar y desactivar el modo solo admin
exports.setOnlyAdmin = (groupId) => {
    const onlyAdminGroups = readJSON(ONLY_ADMIN_GROUPS_FILE);
    onlyAdminGroups[groupId] = true;
    writeJSON(ONLY_ADMIN_GROUPS_FILE, onlyAdminGroups);
};

exports.removeOnlyAdmin = (groupId) => {
    const onlyAdminGroups = readJSON(ONLY_ADMIN_GROUPS_FILE);
    delete onlyAdminGroups[groupId];
    writeJSON(ONLY_ADMIN_GROUPS_FILE, onlyAdminGroups);
};

exports.isOnlyAdminGroup = (groupId) => {
    const onlyAdminGroups = readJSON(ONLY_ADMIN_GROUPS_FILE);
    return !!onlyAdminGroups[groupId]; // Retorna true si el grupo tiene activado el modo solo admin
};