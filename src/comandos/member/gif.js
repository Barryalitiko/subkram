const { PREFIX } = require("../../krampus");  // Para acceder al prefijo
const { downloadVideo } = require("../../services/loadCommon");  // Importar la función de descarga
const axios = require('axios');  // Para realizar las peticiones HTTP

module.exports = {
  name: "sendgif",  // Nombre del comando
  description: "Envía un GIF aleatorio desde un enlace",
  commands: ["sendgif", "gif"],  // Comandos asociados
  usage: `${PREFIX}sendgif`,  // Cómo usar el comando
  cooldown: 180,  // 3 minutos de cooldown
  handle: async ({ args, sendReply, sendReact, socket, remoteJid }) => {
    try {
      // Reaccionar con ⏳ mientras se procesa
      await sendReact("⏳");

      // Enlaces de los GIFs para enviar
      const gifLinks = [
        "https://media1.tenor.com/m/YhGc7aQAI4oAAAAd/megumi-kato-kiss.gif",
        "https://media1.tenor.com/m/R6hIA6K6yg8AAAAd/kono-subarashii-sekai-ni-shukufuku-wo-gif.gif",
        // Puedes añadir más enlaces de GIFs aquí
      ];

      // Elegir un enlace aleatorio
      const randomGifUrl = gifLinks[Math.floor(Math.random() * gifLinks.length)];

      console.log(`[GIF] Enlace elegido: ${randomGifUrl}`);

      // Descargar el GIF usando la función de downloadVideo
      const downloadPath = await downloadVideo(randomGifUrl, 'gif');

      console.log("[GIF] GIF descargado con éxito");

      // Enviar el GIF descargado
      await socket.sendMessage(remoteJid, {
        video: { url: downloadPath },  // Enviar el archivo como video
        caption: "Aquí tienes tu GIF!",
        mimetype: 'video/mp4',  // Mimetype de video, aunque sea un GIF, se envía como video
      });

      // Confirmar que el proceso se completó con éxito
      console.log("[GIF] GIF enviado con éxito");

    } catch (error) {
      console.error("[GIF] Error al enviar el GIF:", error);
      await sendReply("❌ Hubo un error al intentar enviar el GIF.");
      await sendReact("❌");  // Reaccionar con error
    }
  },
};