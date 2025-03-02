const { PREFIX } = require("../../krampus");
const { getLinkPreview } = require('link-preview-js');

module.exports = {
  name: "ping",
  description: "Verificar si el bot está online",
  commands: ["ping"],
  usage: `${PREFIX}ping`,
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("👻");

    // El enlace que deseas previsualizar
    const link = "https://www.arssenasa.gob.do/index.php/planes-complementarios/";

    try {
      // Obtener la previsualización del enlace
      const preview = await getLinkPreview(link);

      // Enviar el mensaje con la previsualización cargada
      await sendReply(`Mira esta página:`, {
        linkPreview: true,  // Indicar que se debe generar la previsualización
        url: link,  // El enlace real
        caption: preview.title ? preview.title : "",  // Opcional: Título del enlace
        thumbnail: preview.image ? preview.image : "", // Opcional: Imagen de previsualización
      });
    } catch (error) {
      console.error("Error al obtener la previsualización del enlace:", error);
      await sendReply("Hubo un problema al obtener la previsualización del enlace.");
    }
  },
};