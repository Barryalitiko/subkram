const playdl = require("play-dl");
const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus"); // Ajusta la ruta según tu proyecto
const os = require("os");

module.exports = {
  name: "música",
  description: "Descarga y envía música desde YouTube",
  commands: ["m", "pp"],
  usage: `${PREFIX}música <nombre de la canción o URL de YouTube>`,
  handle: async ({ args, remoteJid, sendReply, socket }) => {
    console.log("Comando música recibido con argumentos:", args);
    await handleMusicCommand(args, sendReply, socket, remoteJid);
  },
};

// Función principal para manejar el comando de música
async function handleMusicCommand(args, sendReply, socket, remoteJid) {
  const query = args.join(" ");
  console.log("Consulta recibida:", query);

  try {
    // Buscar el video
    const searchResult = await playdl.search(query, { limit: 1 });
    if (searchResult.length === 0) {
      console.log("No se encontraron resultados para:", query);
      await sendReply("No se encontró ningún video para la consulta.");
      return;
    }

    const video = searchResult[0];
    console.log("Video encontrado:", video);

    // Notificar que la música está siendo descargada
    await sendReply(`Descargando música: ${video.title}`);
    console.log("Iniciando la descarga de audio desde:", video.url);

    // Obtener el stream de audio
    const stream = await playdl.stream(video.url);
    console.log("Stream de audio obtenido. Preparando para guardar...");

    // Guardar temporalmente el archivo en el escritorio
    const tempFilePath = path.join(
      os.homedir(),
      "Desktop",
      `${video.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`
    );
    console.log("Archivo temporal será guardado en:", tempFilePath);

    const writeStream = fs.createWriteStream(tempFilePath);

    stream.stream.pipe(writeStream);

    // Depuración de datos en el stream
    stream.stream.on("data", (chunk) => {
      console.log(`Chunk recibido, tamaño: ${chunk.length}`);
    });

    // Esperar a que el stream termine de escribir
    await new Promise((resolve, reject) => {
      writeStream.on("finish", () => {
        console.log("El archivo debería estar guardado aquí:", tempFilePath);
        resolve();
      });
      writeStream.on("error", (error) => {
        console.error("Error al escribir el archivo:", error);
        reject(error);
      });
    });

    console.log("Archivo guardado exitosamente:", tempFilePath);

    // Leer el archivo y enviarlo
    const audioBuffer = fs.readFileSync(tempFilePath);
    console.log("Buffer de audio leído, tamaño:", audioBuffer.length);

    // Enviar el archivo
    await socket.sendMessage(remoteJid, {
      audio: audioBuffer,
      mimetype: "audio/mp3",
      ptt: false,
    });
    console.log("Audio enviado exitosamente.");

    // Eliminar el archivo temporal (puedes descomentar después de depuración)
    // fs.unlinkSync(tempFilePath);
    console.log("Archivo temporal eliminado:", tempFilePath);

  } catch (error) {
    console.error("Error manejando el comando de música:", error);
    await sendReply("Hubo un error al intentar obtener la música.");
  }
}