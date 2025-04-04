const { PREFIX } = require("../../krampus");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "chatfalso",
  description: "Genera un chat falso tipo WhatsApp",
  commands: ["chatfalso", "fakechat"],
  usage: `${PREFIX}chatfalso`,
  handle: async ({ sendImageFromFile, sendWaitReact, sendSuccessReact, sendErrorReply }) => {
    await sendWaitReact();

    try {
      const messages = [
        { text: "Hola! ¿Cómo están?", sender: "me", phone: "Tú", time: "10:45 AM", seen: true },
        { text: "Todo bien! ¿Y tú?", sender: "other", phone: "+34 678 901 234", time: "10:46 AM", reply: "Hola! ¿Cómo están?" },
        { text: "También bien, gracias!", sender: "me", phone: "Tú", time: "10:47 AM", seen: false },
        { text: "Genial!", sender: "other", phone: "Krampus OM", time: "10:48 AM", verified: true, reply: "Todo bien! ¿Y tú?" }
      ];

      const checkSVG = await loadImage("data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='blue'><path d='M9 19l-5-5 1.41-1.41L9 16.17l9.59-9.58L20 8'/></svg>`));

      const verifiedSVG = await loadImage("data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='cyan'><path d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z'/></svg>`));

      const canvas = createCanvas(400, messages.length * 80 + 20);
      const ctx = canvas.getContext("2d");

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

        ctx.fillStyle = msg.sender === "me" ? "#005C4B" : "#202C33";
        ctx.fillRect(x, y, width, height);

        if (msg.sender !== "me") {
          ctx.fillStyle = "#53BDEB";
          ctx.fillText(msg.phone, x + 5, y + 5);
          if (msg.verified) {
            ctx.drawImage(verifiedSVG, x + 5 + ctx.measureText(msg.phone).width + 8, y + 3, 14, 14);
          }
          ctx.fillStyle = "white";
        }

        if (msg.reply) {
          ctx.fillStyle = "#3B4A54";
          ctx.fillRect(x + 5, y + 20, width - 10, 20);
          ctx.fillStyle = "#53BDEB";
          ctx.fillText(msg.reply, x + 10, y + 25);
        }

        ctx.fillStyle = "white";
        ctx.fillText(msg.text, x + 5, y + (msg.reply ? 45 : 20));

        ctx.fillStyle = "gray";
        ctx.fillText(msg.time, x + width - 50, y + height - 15);

        if (msg.sender === "me" && msg.seen) {
          ctx.drawImage(checkSVG, x + width - 20, y + height - 17, 14, 14);
        }
      }

      const fileName = `chatfalso_${Date.now()}.png`;
      const outputPath = path.join(__dirname, fileName);
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        await sendSuccessReact();
        await sendImageFromFile(outputPath, "Aquí tienes tu chat falso generado.\n\nKrampus OM bot");
        fs.unlinkSync(outputPath);
      });

    } catch (error) {
      console.error("Error al generar el chat falso con SVG:", error);
      await sendErrorReply("Ocurrió un error al generar el chat.");
    }
  },
};
