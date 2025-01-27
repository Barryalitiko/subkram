const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { PREFIX, COMMANDS_DIR, TEMP_DIR } = require("../krampus");
const path = require("path");
const fs = require("fs");
const { writeFile } = require("fs/promises");
const readline = require("readline");
const axios = require("axios");

exports.question = (message) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(message, resolve));
};

exports.extractDataFromMessage = (webMessage) => {
  const textMessage = webMessage.message?.conversation;
  const extendedTextMessage = webMessage.message?.extendedTextMessage;
  const extendedTextMessageText = extendedTextMessage?.text;
  const imageTextMessage = webMessage.message?.imageMessage?.caption; // Texto adjunto a imagen
  const videoTextMessage = webMessage.message?.videoMessage?.caption; // Texto adjunto a video
  const imageMessage = webMessage.message?.imageMessage; // Detecta la imagen sin importar si tiene texto
  const videoMessage = webMessage.message?.videoMessage; // Detecta el video sin importar si tiene texto

  const fullMessage =
    textMessage ||
    extendedTextMessageText ||
    imageTextMessage ||
    videoTextMessage;

  if (!fullMessage && !imageMessage && !videoMessage) {
    // Si no hay texto, imagen o video, retorna vacío
    return {
      args: [],
      commandName: null,
      fullArgs: null,
      fullMessage: null,
      isReply: false,
      prefix: null,
      remoteJid: null,
      replyJid: null,
      userJid: null,
    };
  }

  const isReply =
    !!extendedTextMessage && !!extendedTextMessage.contextInfo?.quotedMessage;

  const replyJid =
    !!extendedTextMessage && !!extendedTextMessage.contextInfo?.participant
      ? extendedTextMessage.contextInfo.participant
      : null;

  const userJid = webMessage?.key?.participant?.replace(
    /:[0-9][0-9]|:[0-9]/g,
    ""
  );

  const [command, ...args] = fullMessage ? fullMessage.split(" ") : [];
  const prefix = command?.charAt(0) || null;

  const commandWithoutPrefix = command
    ? command.replace(new RegExp(`^[${PREFIX}]+`), "")
    : null;

  return {
    args: this.splitByCharacters(args.join(" "), ["\\", "|", "/"]),
    commandName: commandWithoutPrefix
      ? this.formatCommand(commandWithoutPrefix)
      : null,
    fullArgs: args.join(" "),
    fullMessage,
    isReply,
    prefix,
    remoteJid: webMessage?.key?.remoteJid,
    replyJid,
    userJid,
    hasImage: !!imageMessage, // Indica si el mensaje contiene una imagen
    hasVideo: !!videoMessage, // Indica si el mensaje contiene un video
  };
};

exports.splitByCharacters = (str, characters) => {
  characters = characters.map((char) => (char === "\\" ? "\\\\" : char));
  const regex = new RegExp(`[${characters.join("")}]`);

  return str
    .split(regex)
    .map((str) => str.trim())
    .filter(Boolean);
};

exports.formatCommand = (text) => {
  if (!text || typeof text !== "string") return ""; // Validación para text

  return this.onlyLettersAndNumbers(
    this.removeAccentsAndSpecialCharacters(text.toLocaleLowerCase().trim())
  );
};

exports.onlyLettersAndNumbers = (text) => {
  if (!text || typeof text !== "string") return ""; // Validación para text
  return text.replace(/[^a-zA-Z0-9]/g, "");
};

exports.removeAccentsAndSpecialCharacters = (text) => {
  if (!text || typeof text !== "string") return ""; // Validación para text
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

exports.baileysIs = (webMessage, context) => {
  return !!this.getContent(webMessage, context);
};

exports.getContent = (webMessage, context) => {
  return (
    webMessage.message?.[`${context}Message`] ||
    webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[
      `${context}Message`
    ]
  );
};

exports.download = async (webMessage, fileName, context, extension) => {
  const content = this.getContent(webMessage, context);

  if (!content) {
    return null;
  }

  const stream = await downloadContentFromMessage(content, context);

  let buffer = Buffer.from([]);

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  const filePath = path.resolve(TEMP_DIR, `${fileName}.${extension}`);

  await writeFile(filePath, buffer);

  return filePath;
};

exports.findCommandImport = (commandName) => {
  const command = this.readCommandImports();

  let typeReturn = "";
  let targetCommandReturn = null;

  for (const [type, commands] of Object.entries(command)) {
    if (!commands.length) {
      continue;
    }

    const targetCommand = commands.find((cmd) =>
      cmd.commands.map((cmd) => this.format
