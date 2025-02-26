const { PREFIX, TEMP_DIR } = require("../../krampus");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

function wrapText(text, maxWidth) {
const words = text.split(' ');
const lines = [];
let currentLine = '';

for (const word of words) {
if (currentLine.length + word.length + 1 > maxWidth) {
lines.push(currentLine);
currentLine = word;
} else {
currentLine += (currentLine ? ' ' : '') + word;
}
}

lines.push(currentLine);
return lines.join('\n');
}

module.exports = {
name: "textosticker",
description: "Convierte texto a sticker",
commands: ["textosticker", "ts"],
usage: `${PREFIX}textosticker <texto>`,
handle: async ({ args, sendStickerFromFile }) => {
const texto = args.join(' ');
const textoProcesado = wrapText(texto, 30);
const outputPath = path.resolve(TEMP_DIR, "output.webp");

exec(
  `ffmpeg -f lavfi -i color=c=white:s=512x512 -vf drawtext="fontsize=48:fontcolor=black:text='${textoProcesado}':x=(w-tw)/2:y=(h-th)/2" -c:v libwebp -fs 0.99M ${outputPath}`,
  async (error) => {
    if (error) {
      console.error(error);
      throw new Error(error);
    }
    await sendStickerFromFile(outputPath);
    fs.unlinkSync(outputPath);
  }
);
},
};