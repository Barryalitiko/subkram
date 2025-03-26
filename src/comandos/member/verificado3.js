const { PREFIX } = require("../../krampus");
const axios = require("axios");

module.exports = {
  name: "mensajes_varios",
  description: "Envía diferentes tipos de mensajes con previsualización especial.",
  commands: ["mensajes"],
  usage: `${PREFIX}mensajes`,
  handle: async ({ sendReply, socket, remoteJid }) => {
    try {
      let imageUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";
      let response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      let imageBuffer = Buffer.from(response.data, "binary");
      
      // 📁 Documento PDF
      let documento = {
        key: { fromMe: false, participant: "0@s.whatsapp.net" },
        message: {
          documentMessage: {
            title: "Archivo Importante",
            fileName: "krampus?.pdf",
            mimetype: "application/pdf",
            jpegThumbnail: imageBuffer,
          }
        }
      };
      await socket.sendMessage(remoteJid, { document: imageBuffer, mimetype: "application/pdf", fileName: "OM.pdf" }, { quoted: documento });
      
      // 📍 Ubicación
      let ubicacion = {
        key: { fromMe: false, participant: "0@s.whatsapp.net" },
        message: {
          locationMessage: {
            degreesLatitude: 37.7749,
            degreesLongitude: -122.4194,
            name: "Krampus OM",
            address: "California, USA",
            jpegThumbnail: imageBuffer,
          }
        }
      };
      await socket.sendMessage(remoteJid, { location: { degreesLatitude: 37.7749, degreesLongitude: -122.4194 } }, { quoted: ubicacion });
      
      // 📞 Llamada perdida
      let llamada = {
        key: { fromMe: false, participant: "0@s.whatsapp.net" },
        message: {
          callLogMessage: {
            callType: 1, // 1 = Audio, 2 = Video
            status: 2, // 2 = Perdida, 1 = Recibida
          }
        }
      };
      await socket.sendMessage(remoteJid, { text: "Llamada perdida 📞" }, { quoted: llamada });
      
      // 🎭 Texto con previa especial (como si fuera un enlace)
      let textoPrevio = {
        key: { fromMe: false, participant: "0@s.whatsapp.net" },
        message: {
          extendedTextMessage: {
            text: "MONDONGO",
            title: "Krampus Web",
            description: "Los mejores bots de WhatsApp",
            jpegThumbnail: imageBuffer,
          }
        }
      };
      await socket.sendMessage(remoteJid, { text: "OM" }, { quoted: textoPrevio });

      // 🎭 Sticker con previsualización
      let sticker = {
        key: { fromMe: false, participant: "0@s.whatsapp.net" },
        message: {
          stickerMessage: {
            mimetype: "image/webp",
            jpegThumbnail: imageBuffer,
          }
        }
      };
      await socket.sendMessage(remoteJid, { sticker: imageBuffer }, { quoted: sticker });

    } catch (error) {
      console.error("❌ Error enviando los mensajes:", error);
      sendReply("⚠️ Ocurrió un error al enviar los mensajes.");
    }
  },
};
