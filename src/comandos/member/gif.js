const axios = require('axios');
const fs = require('fs');
const { PREFIX } = require("../../krampus"); // Asegúrate de que este archivo tiene el prefijo configurado

module.exports = {
  name: "gif",
  description: "Enviar un GIF aleatorio",
  commands: [`${PREFIX}gif`], // Incluye el prefijo en el comando
  usage: `${PREFIX}gif`,
  cooldown: 180, // 3 minutos de cooldown
  handle: async ({ socket, sendReply, remoteJid }) => {
    const gifs = [
      "https://media1.tenor.com/m/YhGc7aQAI4oAAAAd/megumi-kato-kiss.gif"
      // Puedes agregar más enlaces de GIFs aquí
    ];

    try {
      // Elegir un enlace aleatorio de la lista de GIFs
      const randomGifUrl = gifs[Math.floor(Math.random() * gifs.length)];

      // Descargar el archivo GIF
      const response = await axios.get(randomGifUrl, { responseType: 'arraybuffer' });
      const gifBuffer = Buffer.from(response.data, 'binary');

      // Guardar el GIF en un archivo temporal
      const tempFilePath = './tempGif.gif';
      fs.writeFileSync(tempFilePath, gifBuffer);

      // Enviar el GIF como un video (WhatsApp lo mostrará como un GIF)
      await sendVideoFromURL(socket, remoteJid, tempFilePath, "Aquí tienes un GIF");

      // Eliminar el archivo temporal después de enviarlo
      fs.unlinkSync(tempFilePath);
      
      console.log("[GIF] GIF enviado con éxito");
    } catch (error) {
      console.error("[GIF] Error al descargar o enviar el GIF:", error);
      await sendReply("❌ Hubo un error al intentar enviar el GIF.");
    }
  }
};