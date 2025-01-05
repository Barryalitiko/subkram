const axios = require('axios');
const fs = require('fs');
const { PREFIX } = require("../../krampus"); // Asegúrate de que este archivo tiene el prefijo configurado
const { sendVideoFromURL } = require("./baileys-functions"); // Asegúrate de que esta función esté bien definida

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
      console.log(`[GIF] URL aleatorio seleccionado: ${randomGifUrl}`);

      // Descargar el archivo GIF
      console.log("[GIF] Iniciando descarga del GIF...");
      const response = await axios.get(randomGifUrl, { responseType: 'arraybuffer' });
      const gifBuffer = Buffer.from(response.data, 'binary');
      console.log("[GIF] GIF descargado correctamente, tamaño del archivo:", gifBuffer.length);

      // Guardar el GIF en un archivo temporal
      const tempFilePath = './tempGif.gif';
      fs.writeFileSync(tempFilePath, gifBuffer);
      console.log("[GIF] GIF guardado en archivo temporal:", tempFilePath);

      // Enviar el GIF como un video (WhatsApp lo mostrará como un GIF)
      console.log("[GIF] Enviando GIF...");
      await sendVideoFromURL(socket, remoteJid, tempFilePath, "Aquí tienes un GIF");
      console.log("[GIF] GIF enviado correctamente");

      // Eliminar el archivo temporal después de enviarlo
      fs.unlinkSync(tempFilePath);
      console.log("[GIF] Archivo temporal eliminado:", tempFilePath);
      
    } catch (error) {
      console.error("[GIF] Error en el proceso:", error.message);
      await sendReply("❌ Hubo un error al intentar enviar el GIF.");
    }
  }
};