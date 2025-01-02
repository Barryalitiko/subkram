const { PREFIX, SECONDARY_PREFIX, OWNER_NUMBER } = require("../krampus");
const { toUserJid } = require("../utils");

// Verificar si el prefijo es válido (admite varios prefijos)
exports.verifyPrefix = (prefix) => [PREFIX, SECONDARY_PREFIX].includes(prefix);

// Verificar si existe un tipo o comando
exports.hasTypeOrCommand = ({ type, command }) => type && command;

// Detectar enlaces en un texto
exports.isLink = (text) => {
  const regex = /(https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?)/g;
  return regex.test(text);
};

// Verificar si un usuario es administrador o propietario
exports.isAdmin = async ({ remoteJid, userJid, socket }) => {
  const { participants, owner } = await socket.groupMetadata(remoteJid);

  const participant = participants.find(
    (participant) => participant.id === userJid
  );

  if (!participant) {
    return false;
  }

  const isOwner =
    participant.id === owner ||
    participant.admin === "superadmin" ||
    participant.id === toUserJid(OWNER_NUMBER);

  const isAdmin = participant.admin === "admin";

  return isOwner || isAdmin;
};