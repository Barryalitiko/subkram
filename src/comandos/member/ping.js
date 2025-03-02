const { PREFIX } = require("../../krampus");
const linkPreview = require('link-preview-js');

module.exports = {
  name: "sendLink",
  description: "Enviar enlace con previsualización",
  commands: ["sendlink"],
  usage: `${PREFIX}sendlink <url>`,
  handle: async ({ sendReply, sendReact, args, remoteJid }) => {
    const url = args[0];
    if (!url) {
      return await sendReply("Por favor, envíame un enlace para procesar.");
    }

    try {
      // Obtener previsualización del enlace usando link-preview-js
      const preview = await linkPreview.getLinkPreview(url);

      // Si no se puede obtener la previsualización, muestra un mensaje
      if (!preview) {
        return await sendReply("No pude obtener la previsualización del enlace.");
      }

      // Extraer título y descripción de la previsualización
      const title = preview.title || "Enlace sin título";
      const description = preview.description || "No hay descripción disponible";
      const image = preview.images && preview.images.length > 0 ? preview.images[0] : null;

      // Crear mensaje con la previsualización
      let message = `*Título:* ${title}\n*Descripción:* ${description}\n*Enlace:* ${url}`;

      if (image) {
        message += `\n*Imagen de previsualización:* ${image}`;
      }

      // Enviar el mensaje con la previsualización
      await sock.sendMessage(remoteJid, {
        text: message,
      });

      await sendReply("Enlace enviado con previsualización.");
    } catch (error) {
      console.error("Error al procesar el enlace:", error);
      await sendReply("Hubo un problema al obtener la previsualización del enlace.");
    }
  },
};