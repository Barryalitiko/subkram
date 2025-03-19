const { PREFIX } = require("../../krampus");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const filePath = path.resolve(__dirname, "../../usuarios.json");
const tempPath = path.resolve(__dirname, "../../temp");

module.exports = {
  name: "personaje",
  description: "Muestra el rostro del usuario con los objetos comprados.",
  commands: ["personaje"],
  usage: `${PREFIX}personaje`,
  handle: async ({ socket, remoteJid }) => {
    // Verificar si el archivo de usuarios existe
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
    }

    let usuarios = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!usuarios[remoteJid]) {
      usuarios[remoteJid] = { objetos: [] };
      fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), "utf8");
    }

    // Rutas de imágenes base
    const rostroPath = path.resolve(__dirname, "../../../assets/images/cara.png");
    const gafasPath = path.resolve(__dirname, "../../../assets/images/gafas.png");
    const lentesPath = path.resolve(__dirname, "../../../assets/images/lentes.png");

    // Rutas de los objetos del grupo A (ojos)
    const objetosA = {
      ojos: path.resolve(__dirname, "../../../assets/images/ojos.png"),
      naruto: path.resolve(__dirname, "../../../assets/images/naruto.png"),
      sasuke: path.resolve(__dirname, "../../../assets/images/sasuke.png"),
      rinesharingan: path.resolve(__dirname, "../../../assets/images/rinesharingan.png"),
      rinegan: path.resolve(__dirname, "../../../assets/images/rinegan.png"),
      remolino: path.resolve(__dirname, "../../../assets/images/remolino.png"),
    };

    // Rutas de los objetos del grupo B (bocas)
    const objetosB = {
      labios: path.resolve(__dirname, "../../../assets/images/labios.png"),
      bocamorada: path.resolve(__dirname, "../../../assets/images/bocamorada.png"),
      bocaroja: path.resolve(__dirname, "../../../assets/images/bocaroja.png"),
      bocaalegre: path.resolve(__dirname, "../../../assets/images/bocaalegre.png"),
      labiosnormales: path.resolve(__dirname, "../../../assets/images/labiosnormales.png"),
    };

    // Cargar la imagen base del rostro
    const rostro = await loadImage(rostroPath);
    const canvas = createCanvas(rostro.width, rostro.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(rostro, 0, 0, rostro.width, rostro.height);

    // Dibujar los objetos A (ojos)
    const objetoA = usuarios[remoteJid].objetos.find(obj => objetosA[obj]);

    if (objetoA) {
      const objetoImagen = await loadImage(objetosA[objetoA]);
      ctx.drawImage(objetoImagen, 178, 250, 140, 40); // Posición ojos
    }

    // Dibujar gafas/lentes (A1) encima de los ojos
    if (usuarios[remoteJid].objetos.includes("gafas") || usuarios[remoteJid].objetos.includes("lentes")) {
      let objetoImagen = usuarios[remoteJid].objetos.includes("gafas") ? await loadImage(gafasPath) : await loadImage(lentesPath);
      ctx.drawImage(objetoImagen, 174, 247, 146, 53);
    }

    // Dibujar la boca (Grupo B)
    const objetoB = usuarios[remoteJid].objetos.find(obj => objetosB[obj]);

    if (objetoB) {
      const bocaImagen = await loadImage(objetosB[objetoB]);

      // **NUEVAS COORDENADAS AJUSTADAS PARA LA BOCA**
      const bocaX = 211; // Límite izquierdo
      const bocaY = 338; // Límite superior
      const bocaAncho = 72; // Máximo ancho dentro del límite
      const bocaAlto = bocaImagen.height * (bocaAncho / bocaImagen.width); // Escalar proporcionalmente

      ctx.drawImage(bocaImagen, bocaX, bocaY, bocaAncho, bocaAlto);
    }

    // Asegurar que la carpeta temporal exista
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    // Guardar la imagen generada
    const outputPath = path.resolve(tempPath, `personaje_${remoteJid}.png`);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    // Enviar la imagen al usuario
    await socket.sendMessage(remoteJid, {
      image: fs.readFileSync(outputPath),
      caption: "Aquí está tu personaje.",
    });

    console.log(`✅ [DEBUG] ${remoteJid} ha visto su personaje con:`, usuarios[remoteJid].objetos);
  },
};