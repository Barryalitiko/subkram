const path = require("path");
const fs = require("fs");

const databasePath = path.resolve(__dirname, "..", "..", "database");

const INACTIVE_GROUPS_FILE = "inactive-groups";
const NOT_WELCOME_GROUPS_FILE = "not-welcome-groups";
const ANTI_LINK_GROUPS_FILE = "anti-link-groups";

function createIfNotExists(fullPath) {
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, JSON.stringify([]));
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

exports.activateWelcomeGroup = (groupId) => {
  const notWelcomeGroups = readJSON(NOT_WELCOME_GROUPS_FILE);
  const index = notWelcomeGroups.indexOf(groupId);

  if (index !== -1) {
    notWelcomeGroups.splice(index, 1);
    writeJSON(NOT_WELCOME_GROUPS_FILE, notWelcomeGroups);
  }
};

exports.deactivateWelcomeGroup = (groupId) => {
  const notWelcomeGroups = readJSON(NOT_WELCOME_GROUPS_FILE);
  if (!notWelcomeGroups.includes(groupId)) {
    notWelcomeGroups.push(groupId);
    writeJSON(NOT_WELCOME_GROUPS_FILE, notWelcomeGroups);
  }
};

exports.isActiveWelcomeGroup = (groupId) => {
  const notWelcomeGroups = readJSON(NOT_WELCOME_GROUPS_FILE);
  return !notWelcomeGroups.includes(groupId);
};

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

