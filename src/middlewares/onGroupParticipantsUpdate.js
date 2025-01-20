const fs = require("fs");
const { onlyNumbers } = require("../utils");
const { warningLog } = require("../utils/logger");
const path = require("path");

const welcomeConfigPath = path.resolve(__dirname, "../../assets/welcome.json");

// Función para cargar la configuración de bienvenida
function getWelcomeConfig() {
  console.log("Ruta de configuración de bienvenida:", welcomeConfigPath); // Depuración: muestra la ruta
  if (!fs.existsSync(welcomeConfigPath)) {
    console.log("Archivo de configuración no encontrado. Creando uno nuevo...");
    fs.writeFileSync(welcomeConfigPath, JSON.stringify({}));
  }
  const config = JSON.parse(fs.readFileSync(welcomeConfigPath, "utf8"));
  console.log("Configuración de bienvenida cargada:", config); // Depuración: muestra el contenido del archivo
  return config;
}

exports.onGroupParticipantsUpdate = async ({ groupParticipantsUpdate, socket }) => {
  console.log("Evento detectado:", groupParticipantsUpdate); // Depuración: muestra el evento recibido

  const remoteJid = groupParticipantsUpdate.id;
  const userJid = groupParticipantsUpdate.participants[0];
  const config = getWelcomeConfig();
  const welcomeOption = config[remoteJid] || "0"; // Predeterminado a "0" si no hay configuración
  console.log(`Configuración de bienvenida para el grupo ${remoteJid}:`, welcomeOption);

  // Verifica si la acción es "add"
  if (groupParticipantsUpdate.action === "add") {
    console.log(`Usuario agregado al grupo ${remoteJid}:`, userJid);

    try {
      // Si la bienvenida está apagada (opción 0), no se envía nada
      if (welcomeOption === "0") {
        console.log("La opción de bienvenida está apagada. No se enviará nada.");
        return;
      }

      // Si la bienvenida está configurada para enviar mensaje sin foto (opción 1)
      if (welcomeOption === "1") {
        console.log("Enviando mensaje de bienvenida sin foto...");
        await socket.sendMessage(remoteJid, {
          text: `¡𝗕𝗶𝗲𝗻𝗩𝗲𝗻𝗶𝗱@ 𝗮𝗹 𝗴𝗿𝘂𝗽𝗼! 
@${onlyNumbers(userJid)}

> Bot by Krampus OM
Oᴘᴇʀᴀᴄɪᴏɴ Mᴀʀsʜᴀʟʟ ༴༎𝙾𝙼༎
> https://t.me/krampusiano`,
          mentions: [userJid],
        });
        console.log("Mensaje enviado con éxito.");
      }

      // Si la bienvenida está configurada para enviar foto de perfil con mensaje (opción 2)
      if (welcomeOption === "2") {
        console.log("Intentando enviar mensaje de bienvenida con foto...");
        try {
          // Obtener la URL de la foto de perfil del usuario
          const profilePicUrl = await socket.profilePictureUrl(userJid, "image");
          console.log("URL de foto de perfil obtenida:", profilePicUrl);

          // Descargar la imagen
          const buffer = await socket.downloadMediaMessage(profilePicUrl);

          await socket.sendMessage(remoteJid, {
            image: buffer,
            caption: `¡𝗕𝗶𝗲𝗻𝗩𝗲𝗻𝗶𝗱@ 𝗮𝗹 𝗴𝗿𝘂𝗽𝗼!
@${onlyNumbers(userJid)}
𝘗𝘳𝘦𝘴𝘦𝘯𝘵𝘢𝘵𝘦 ᶜᵒⁿ 𝐟𝐨𝐭𝐨 y 𝐧𝐨𝐦𝐛𝐫𝐞 

> Bot by Krampus OM
Oᴘᴇʀᴀᴄɪᴏɴ Mᴀʀsʜᴀʟʟ ༴༎𝙾𝙼༎
> https://t.me/krampusiano`,
            mentions: [userJid],
          });
          console.log("Mensaje con foto enviado con éxito.");
        } catch (error) {
          console.error("Error al obtener o enviar la foto de perfil:", error);
          warningLog("No se pudo obtener o enviar la foto de perfil.");
        }
      }
    } catch (error) {
      console.error("Error al manejar la bienvenida:", error);
      warningLog(
        "👻 𝙺𝚛𝚊𝚖𝚙𝚞𝚜.𝚋𝚘𝚝 👻 No se pudo enviar el mensaje de bienvenida"
      );
    }
  } else {
    console.log(`Acción no manejada: ${groupParticipantsUpdate.action}`);
  }
};