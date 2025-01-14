const { PREFIX } = require("../../krampus");
const { downloadVideo } = require("../../services/videoService"); // Usamos el servicio de la API para obtener el video
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "send-video",
  description: "Enviar el video desde la API",
  commands: ["send-video", "video"],
  usage: `${PREFIX}send-video`,
  handle: async ({
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
    sendVideoFromURL,
    args,
  }) => {
    // Verificamos si hay argumentos, aunque no los necesitamos para este comando
    if (args.length) {
      console.log("Error: Este comando no requiere argumentos.");
      throw new InvalidParameterError(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Este comando no requiere argumentos."
      );
    }

    console.log("Comando recibido para enviar el video.");
    await sendWaitReact();

    try {
      // Llamamos al servicio de la API para obtener el video
      console.log("Obteniendo el video desde la API...");
      const videoStream = await downloadVideo();
      console.log("Video stream obtenido:", videoStream);

      if (!videoStream) {
        console.log("Error: No se pudo obtener el video.");
        await sendErrorReply("👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 No se pudo obtener el video.");
        return;
      }

      console.log("Video obtenido exitosamente.");

      await sendSuccessReact();
      console.log("Video preparado para envío.");

      // Enviar el video usando el stream de la API
      console.log("Enviando el video...");
      await sendVideoFromURL(videoStream);
      console.log("Video enviado con éxito.");
    } catch (error) {
      console.error("Error en el manejo del comando:", error.message);
      await sendErrorReply(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜B𝚘𝚝 👻 Error al procesar la solicitud de video."
      );
    }
  },
};