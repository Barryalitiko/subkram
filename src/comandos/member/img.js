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
    if (!fullArgs.trim()) {
      throw new WarningError("Por favor, proporciona una descripción válida para generar la imagen.");
    }

    const herc = new Hercai();
    await sendWaitReact();

    try {
      console.log("Prompt enviado a Hercai:", fullArgs);

      const response = await herc.drawImage({
        model: "simurg", // Cambia este modelo si sigue fallando
        prompt: fullArgs,
        negative_prompt: "nude, explicit, adult, nsfw",
      });

      console.log("Respuesta de Hercai:", response);

      if (!response || response.status !== 200 || !response.url) {
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
