const { PREFIX } = require("../../krampus");
const { downloadVideo } = require("../../services/yt-dpl"); // Servicio de descarga
const ytSearch = require("yt-search");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "descargar-video",
  description: "Busca y descarga un video de YouTube y lo envía.",
  commands: ["descargar-video", "video"],
  usage: `${PREFIX}descargar-video <término de búsqueda>`,
  handle: async ({
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
    sock, // Objeto del cliente de Baileys
    remoteJid, // ID del chat o grupo donde se ejecuta el comando
    args,
  }) => {
    console.log("Comando recibido para descargar un video.");

    // Verificar que el usuario haya proporcionado un término de búsqueda
    if (!args.length) {
      console.log("Error: No se proporcionó un término de búsqueda.");
      throw new InvalidParameterError(
        `👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Por favor, proporciona un término de búsqueda. Ejemplo: \`${PREFIX}descargar-video never gonna give you up\``
      );
    }

    const searchQuery = args.join(" ");
    console.log(`Término de búsqueda recibido: "${searchQuery}"`);
    await sendWaitReact();

    try {
      // Buscar video en YouTube
      console.log("Realizando búsqueda en YouTube...");
      const searchResults = await ytSearch(searchQuery);
      const video = searchResults.videos[0]; // Tomar el primer resultado relevante

      if (!video) {
        console.log("No se encontró ningún video para el término:", searchQuery);
        await sendErrorReply(
          "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 No se encontró ningún video relacionado con tu búsqueda."
        );
        return;
      }

      console.log("Video encontrado:", {
        title: video.title,
        url: video.url,
        duration: video.timestamp,
        author: video.author.name,
      });

      // Mostrar detalles del video encontrado al usuario
      await sendSuccessReact();
      await sendErrorReply(`📹 *${video.title}*\nDuración: ${video.timestamp}\nSubido por: ${video.author.name}\n\nDescargando el video...`);

      // Descargar el video usando la URL encontrada
      console.log("Iniciando descarga del video:", video.url);
      const downloadedPath = await downloadVideo(video.url);
      console.log("Descarga completada. Ruta del archivo:", downloadedPath);

      // Enviar el video usando Baileys
      console.log("Enviando el video...");
      await sock.sendMessage(remoteJid, {
        video: { url: downloadedPath },
        caption: `📹 *${video.title}*\nDuración: ${video.timestamp}\nSubido por: ${video.author.name}`,
      });
      console.log("Video enviado con éxito.");
    } catch (error) {
      console.error("Error en el manejo del comando:", error.message);
      await sendErrorReply(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Error al procesar la solicitud de descarga de video."
      );
    }
  },
};