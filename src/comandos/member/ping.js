const { PREFIX } = require("../../krampus");
const linkPreview = require("link-preview-js"); // Asegúrate de haber instalado esta dependencia

module.exports = {
  name: "ping",
  description: "Verificar si el bot está online",
  commands: ["ping"],
  usage: `${PREFIX}ping`,
  handle: async ({ sendReply, sendReact }) => {
    const startTime = Date.now();
    await sendReact("👻");

    // Enlace para la previsualización
    const url = "https://www.arssenasa.gob.do/index.php/planes-complementarios/";

    // Generar la previsualización del enlace
    try {
      const preview = await linkPreview.getLinkPreview(url);

      // Enviar el mensaje con la previsualización del enlace
      await sendReply(`Velocidad de respuesta: ${latency}ms\n> Krampus OM bot\n\n${preview.title}\n${preview.description}\n${url}`);
    } catch (error) {
      console.error("Error al obtener la previsualización del enlace:", error);
      await sendReply("Hubo un error al obtener la previsualización del enlace.");
    }

    const endTime = Date.now();
    const latency = endTime - startTime;
  },
};