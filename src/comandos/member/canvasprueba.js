const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../errors/WarningError");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "chatfalso",
  description: "Genera una imagen de chat falso estilo WhatsApp",
  commands: ["chatfalso", "fakemsg"],
  usage: `${PREFIX}chatfalso`,
  handle: async ({
    sendImageFromFile,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    await sendWaitReact();

    try {
      // Mensajes de ejemplo (puedes modificarlos o hacerlos dinámicos después)
      const messages = [
        { text: "Hola! ¿Cómo están?", sender: "me", phone: "Tú", time: "10:45 AM", seen: true },
        { text: "Todo bien! ¿Y tú?", sender: "other", phone: "+34 678 901 234", time: "10:46 AM", reply: "Hola! ¿Cómo están?" },
        { text: "También bien, gracias!", sender: "me", phone: "Tú", time: "10:47 AM", seen: false },
        { text: "Genial!", sender: "other", phone: "Krampus OM", time: "10:48 AM", verified: true, reply: "Todo bien! ¿Y tú?" }
      ];

      // Crear canvas
      const canvas = createCanvas(400, messages.length * 80 + 20);
      const ctx = canvas.getContext("2d");

      // Cargar imágenes
      const checkImage = await loadImage(path.resolve(__dirname, "../../../assets/images/check.png"));
      const verifiedImage = await loadImage(path.resolve(__dirname, "../../../assets/images/verificado.png"));

      // Fondo general
      ctx.fillStyle = "#111B21";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "14px sans-serif";
      ctx.textBaseline = "top";

      for (let index = 0; index < messages.length; index++) {
        const msg = messages[index];
        const x = msg.sender === "me" ? 200 : 10;
        const y = index * 80 + 10;
        const width = 180;
        const height = msg.reply ? 70 : 50;

        // Burbuja
        ctx.fillStyle = msg.sender === "me" ? "#005C4B" : "#202C33";
        ctx.fillRect(x, y, width, height);

        // Número/Nombre + verificado
        if (msg.sender !== "me") {
          ctx.fillStyle = "#53BDEB";
          ctx.fillText(msg.phone, x + 5, y + 5);
          if (msg.verified) {
            ctx.drawImage(verifiedImage, x + ctx.measureText(msg.phone).width + 10, y + 3, 14, 14);
          }
        }

        // Respuesta
        if (msg.reply) {
          ctx.fillStyle = "#3B4A54";
          ctx.fillRect(x + 5, y + 20, width - 10, 20);
          ctx.fillStyle = "#53BDEB";
          ctx.fillText(msg.reply, x + 10, y + 25);
        }

        // Texto principal
        ctx.fillStyle = "white";
        ctx.fillText(msg.text, x + 5, y + (msg.reply ? 45 : 20));

        // Hora
        ctx.fillStyle = "gray";
        ctx.fillText(msg.time, x + width - 50, y + height - 15);

        // Check azul si es tuyo
        if (msg.sender === "me" && msg.seen) {
          ctx.drawImage(checkImage, x + width - 20, y + height - 15, 14, 14);
        }
      }

      // Guardar imagen
      const outputPath = path.join(__dirname, "chatfalso_output.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        await sendSuccessReact();
        await sendImageFromFile(outputPath, "💬 Aquí tienes tu chat falso estilo WhatsApp.\n\nKrampus OM bot");
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error("Error al generar el chat falso:", error);
      await sendErrorReply("Hubo un error al generar la imagen del chat falso.");
    }
  },
};
