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

      // Íconos como PNG Base64 para evitar el error de SVG
      const checkPNG = await loadImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAb1BMVEUAAACZmZn///+ZmZl4eHiZmZn5+flvb2+UlJTZ2dnPz8+ZmZnPz8/6+vqUlJTZ2dn7+/vT09OcnJzq6ur09PReXl5vb2+jo6OJioqjo6PKysqGhobY2NiampqDg4OYmJjT09Ozs7ODg4NjY2MSEhKSkpLZCWmAAAAMHRSTlMAB7H0GPvAvBf79e7d/wCAQeTOmS3lpaimgr+loJ91fHx7enZ0c3BfVFHAvLuqqGZcYGEYIcoAAAB6SURBVBjTbc/bDoMwDAXQBCBqCCFFpH79/38y6lwVrdzvTeRNiU7vAvVtkI2+uYmw63u3aKNmI3vLs2ymU9HiIGEk7xFboQnSR5iCRxPwiWkMsA3VkqJLDKSPtjHw7gM4xSzFDfNs3BvUalAOAA4TwS7qxVXIAAAAASUVORK5CYII=");
      const verifiedPNG = await loadImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAZlBMVEUAAABVVVUAAAD///+qqqr///////9UVFT///+tra3///////+goKBgYGD///+6urrMzMzb29uDg4O2trbm5ub///+kpKS2trZ/f3+Ojo7Dw8Pj4+Nubm6cnJwXFxeZmZnf398gICB+fn5JSUllZWW/v78uLi4iIiIRERGR2QBPAAAALHRSTlMAIQQJERo1Q0xvfoGCrbK3x8nKzdDg5Ofr7fLz+Pn6+/z9/pHXv7lEAAAAiUlEQVQY042P2w7CMBBF3yYyBLNDXNWn+/7/TUwlgz9fQL0KnkuUZo5SRPRLhV+TsyJYdyuqEKNqVQOJCPGKdDJQtgP3ULmOY+Hni5dAIxgBT7wEBxyKzrABdCCUg6nYK52gKUsDbSCkp8RPgaV3oJ5AkD3A7AZTzFKZJgAAAABJRU5ErkJggg==");

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
            ctx.drawImage(verifiedPNG, x + 5 + ctx.measureText(msg.phone).width + 8, y + 3, 14, 14);
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
          ctx.drawImage(checkPNG, x + width - 20, y + height - 17, 14, 14);
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
      console.error("Error al generar el chat falso con PNG:", error);
      await sendErrorReply("Ocurrió un error al generar el chat.");
    }
  },
};
