const { PREFIX } = require("../../krampus");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  name: "perfilVideo",
  description: "Genera un video donde el PNG aparece gradualmente sobre la foto de perfil.",
  commands: ["perfilvideo", "videoperfil"],
  usage: `${PREFIX}perfilvideo @usuario`,
  handle: async ({ args, socket, remoteJid, sendReply, isReply, replyJid, senderJid }) => {
    let userJid;
    if (isReply) {
      userJid = replyJid;
    } else if (args.length < 1) {
      await sendReply("Uso incorrecto. Usa el comando así:\n" + `${PREFIX}perfilvideo @usuario`);
      return;
   
