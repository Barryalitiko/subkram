const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");
const { WarningError } = require("../../../errors/WarningError");

module.exports = {
  name: "canvaschat",
  description: "Genera un chat falso al estilo WhatsApp",
  commands: ["chatfalso", "fakechats"],
  usage: `${PREFIX}chatfalso`,
  handle: async ({
    sendImageFromFile,
    sendSuccessReact,
    sendErrorReply,
    sendWaitReact,
  }) => {
    await sendWaitReact();

    try {
      const messages = [
        { text: "Hola! ¿Cómo están?", sender: "me", phone: "Tú", time: "10:45", seen: true },
        { text: "Todo bien! ¿Y tú?", sender: "other", phone: "+34 678 901 234", time: "10:46", reply: "Hola! ¿Cómo están?" },
        { text: "También bien, gracias!", sender: "me", phone: "Tú", time: "10:47", seen: false },
        { text: "Genial!", sender: "other", phone: "Krampus OM", time: "10:48", verified: true, reply: "Todo bien! ¿Y tú?" }
      ];

      const canvas = createCanvas(1080, messages.length * 140);
      const ctx = canvas.getContext("2d");

      // Cargar iconos PNG
      const checkPath = path.resolve(__dirname, "../../../assets/images/checkpng.png");
      const verifiedPath = path.resolve(__dirname, "../../../assets/images/verificado.png");

      const checkImg = await loadImage(checkPath);
      const verifiedImg = await loadImage(verifiedPath);

      // Fondo del chat
      ctx.fillStyle = "#111B21";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textBaseline = "top";

      ctx.font = "18px 'Segoe UI', Arial, sans-serif";

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const x = msg.sender === "me" ? canvas.width - 650 : 50;
        const y = i * 140 + 40;
        const bubbleWidth = 600;
        const padding = 20;

        // Burbujas
        ctx.fillStyle = msg.sender === "me" ? "#005C4B" : "#202C33";
        ctx.beginPath();
        ctx.moveTo(x + 20, y);
        ctx.lineTo(x + bubbleWidth - 20, y);
        ctx.quadraticCurveTo(x + bubbleWidth, y, x + bubbleWidth, y + 20);
        ctx.lineTo(x + bubbleWidth, y + 100);
        ctx.quadraticCurveTo(x + bubbleWidth, y + 120, x + bubbleWidth - 20, y + 120);
        ctx.lineTo(x + 20, y + 120);
        ctx.quadraticCurveTo(x, y + 120, x, y + 100);
        ctx.lineTo(x, y + 20);
        ctx.quadraticCurveTo(x, y, x + 20, y);
        ctx.closePath();
        ctx.fill();

        let currentY = y + padding;

        // Nombre del remitente
        if (msg.sender === "other") {
          ctx.fillStyle = "#53BDEB";
          ctx.fillText(msg.phone, x + padding, currentY);
          if (msg.verified) {
            ctx.drawImage(verifiedImg, x + padding + ctx.measureText(msg.phone).width + 10, currentY, 18, 18);
          }
          currentY += 28;
        }

        // Texto de respuesta
        if (msg.reply) {
          ctx.fillStyle = "#3B4A54";
          ctx.fillRect(x + padding, currentY, bubbleWidth - 2 * padding, 28);
          ctx.fillStyle = "#53BDEB";
          ctx.fillText(msg.reply, x + padding + 5, currentY + 5);
          currentY += 35;
        }

        // Texto del mensaje
        ctx.fillStyle = "white";
        ctx.fillText(msg.text, x + padding, currentY);
        currentY += 32;

        // Hora
        ctx.fillStyle = "#B0B3B5";
        ctx.font = "14px 'Segoe UI', Arial";
        ctx.fillText(msg.time, x + bubbleWidth - 70, y + 95);

        // Checks
        if (msg.sender === "me" && msg.seen) {
          ctx.drawImage(checkImg, x + bubbleWidth - 30, y + 95, 18, 18);
        }

        ctx.font = "18px 'Segoe UI', Arial, sans-serif"; // Reset font size
      }

      const outputPath = path.resolve(__dirname, "../../../assets/temp/chat.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on("finish", async () => {
        await sendSuccessReact();
        await sendImageFromFile(outputPath, "Aquí tienes tu chat falso estilo WhatsApp.");
        fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error("Error al generar el chat falso:", err);
      await sendErrorReply("Error al generar el chat falso.");
    }
  },
};
