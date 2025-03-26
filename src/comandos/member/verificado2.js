const { PREFIX } = require("../../krampus");
const axios = require("axios");

module.exports = {
  name: "contacto",
  description: "Envía un mensaje con previsualización de contacto 📇",
  commands: ["contacto"],
  usage: `${PREFIX}contacto`,
  handle: async ({ sendReply, socket, remoteJid }) => {
    try {
      // URL de la imagen para la prueba
      let imageUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";

      // Descargar la imagen como buffer
      let response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      let imageBuffer = Buffer.from(response.data, "binary");

      // Texto que irá en el mensaje principal
      let mensajePrincipal = "Aquí tienes el contacto de Krampus Support 📞";

      // Información del contacto
      let contactName = "Krampus Support";
      let contactNumber = "+57 318 216 5511";
      let contactVcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL;waid=573182165511:${contactNumber}\nEND:VCARD`;

      // Construcción del mensaje con la previsualización de contacto
      let estilo = {
        key: {
          fromMe: false,
          participant: "573182165511@s.whatsapp.net",
        },
        message: {
          contactMessage: {
            displayName: contactName,
            vcard: contactVcard,
          }
        }
      };

      // Enviar el mensaje principal con imagen, pero citando el contacto como previsualización
      await socket.sendMessage(remoteJid, { text: mensajePrincipal }, { quoted: estilo });

      console.log("✅ Mensaje con previsualización de contacto enviado correctamente.");
    } catch (error) {
      console.error("❌ Error enviando el mensaje con contacto:", error);
      sendReply("⚠️ Ocurrió un error al enviar el mensaje con previsualización de contacto.");
    }
  },
};
