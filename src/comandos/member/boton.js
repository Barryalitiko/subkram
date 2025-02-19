const { PREFIX } = require("../../krampus");

module.exports = {
  name: "buttonTest",
  description: "Probar la función de respuesta con botones",
  commands: ["buttontest"],
  usage: `${PREFIX}buttontest`,
  handle: async ({ sendReply, sendReact, sendReplyWithButton }) => {
    // Enviar un emoji para indicar que la prueba comenzó
    await sendReact("🔘");

    // Definir los botones
    const button = {
      buttonText: "Haz clic aquí", // Texto del botón
      buttonId: "button_click",    // ID del botón
      type: 1                      // Tipo de botón
    };

    const buttons = [button]; // Puedes agregar más botones si lo deseas

    // Mensaje con los botones
    const text = "¡Hola! Este es un mensaje con un botón para probar la función sendReplyWithButton.";

    // Enviar el mensaje con los botones
    await sendReplyWithButton(text, buttons);

    console.log("Botón enviado correctamente.");
  },
};