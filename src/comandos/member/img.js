const { PREFIX } = require("../../krampus");
const { Hercai } = require("hercai");
const { WarningError } = require("../../errors/WarningError");

module.exports = {
  name: "imagen",
  description: "Genera imágenes",
  commands: ["jpg", "img", "imagen"],
  usage: `${PREFIX}imagen <descripcion>`,
  handle: async ({
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendImageFromURL,
  }) => {
    if (!fullArgs.length) {
      throw new WarningError(
        "Vaya...\nAñade una descripción para generar la imagen\n> Krampus OM bot"
      );
    }

    const herc = new Hercai();
    await sendWaitReact();

    try {
      const response = await herc.drawImage({
        model: "simurg",
        prompt: `Generate a realistic image, 
        without deviating from the proposed theme below (attention, it may come in Portuguese, 
        translate it into English first):
        
        ${fullArgs}`,
        negative_prompt: "nude, explicit, adult, nsfw",
      });

      console.log("Respuesta de Hercai:", response);

      if (!response || !response.url) {
        throw new WarningError("No se pudo obtener la imagen. Intenta con otra descripción.");
      }

      await sendSuccessReact();
      await sendImageFromURL(response.url);
    } catch (error) {
      console.error("Error en la generación de imagen:", error);
      throw new WarningError(`Error generando la imagen: ${error.message}`);
    }
  },
};
