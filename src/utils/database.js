const path = require("path");
const fs = require("fs");

const databasePath = path.resolve(__dirname, "..", "..", "database");

const INACTIVE_GROUPS_FILE = "inactive-groups";
const ANTI_LINK_GROUPS_FILE = "anti-link-groups";
const WELCOME_MODE_GROUPS_FILE = "welcome-mode-groups";


function createIfNotExists(fullPath) {
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, JSON.stringify({}));
  }
}

function readJSON(jsonFile) {
  const fullPath = path.resolve(databasePath, `${jsonFile}.json`);
  createIfNotExists(fullPath);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function writeJSON(jsonFile, data) {
  const fullPath = path.resolve(databasePath, `${jsonFile}.json`);
  createIfNotExists(fullPath);
  fs.writeFileSync(fullPath, JSON.stringify(data));
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

// Manejo del modo de bienvenida
exports.setWelcomeMode = (groupId, mode) => {
  const welcomeModes = readJSON(WELCOME_MODE_GROUPS_FILE);
  welcomeModes[groupId] = mode;
  writeJSON(WELCOME_MODE_GROUPS_FILE, welcomeModes);
};

exports.getWelcomeMode = (groupId) => {
  const welcomeModes = readJSON(WELCOME_MODE_GROUPS_FILE);
  return welcomeModes[groupId] || "1"; // Por defecto, modo desactivado
};

// Manejo del anti-link
exports.activateAntiLinkGroup = (groupId) => {
  const antiLinkGroups = readJSON(ANTI_LINK_GROUPS_FILE);
  if (!antiLinkGroups.includes(groupId)) {
    antiLinkGroups.push(groupId);
    writeJSON(ANTI_LINK_GROUPS_FILE, antiLinkGroups);
  }
};

exports.deactivateAntiLinkGroup = (groupId) => {
  const antiLinkGroups = readJSON(ANTI_LINK_GROUPS_FILE);
  const index = antiLinkGroups.indexOf(groupId);

  if (index !== -1) {
    antiLinkGroups.splice(index, 1);
    writeJSON(ANTI_LINK_GROUPS_FILE, antiLinkGroups);
  }
};

exports.isActiveAntiLinkGroup = (groupId) => {
  const antiLinkGroups = readJSON(ANTI_LINK_GROUPS_FILE);
  return antiLinkGroups.includes(groupId);
};
