const { PREFIX } = require("../../krampus");
const { getLinkPreview } = require('link-preview-js');

module.exports = {
  name: "ping",
  description: "Verificar si el bot está online",
  commands: ["ping"],
  usage: `${PREFIX}ping`,
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("👻");

    const link = "https://www.arssenasa.gob.do/index.php/planes-complementarios/";

    try {
      const preview = await getLinkPreview(link);

      await sendReply("Hola", {
        linkPreview: true,
        url: link,
        caption: preview.title ? preview.title : "",
        thumbnail: preview.image ? preview.image : "",
      });
    } catch (error) {
      console.error("Error al obtener la previsualización del enlace:", error);
      await sendReply("Hubo un problema al obtener la previsualización del enlace.");
    }
  },
};
