const { PREFIX } = require("../../krampus");
const { Canvas } = require("canvas");
const fs = require("fs");

module.exports = {
  name: "graffiti",
  description: "Crea un grafiti a partir de una palabra",
  commands: ["graffiti", "graff"],
  usage: `${PREFIX}graffiti <palabra>`,
  handle: async ({ args, sendWaitReact, sendSuccessReact, sendImageFromFile }) => {
    if (!args.length) {
      throw new WarningError("Debes proporcionar una palabra para crear el grafiti");
    }

    await sendWaitReact();

    const palabra = args.join(" ");
    const canvas = new Canvas(800, 600);
    const ctx = canvas.getContext("2d");

    ctx.font = "80px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(palabra, 400, 300);

    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(1, "blue");

    ctx.fillStyle = gradient;
    ctx.fillText(palabra, 400, 300);

    const buffer = canvas.toBuffer("image/png");
    const archivoTemporal = "graffiti.png";
    fs.writeFileSync(archivoTemporal, buffer);

    await sendSuccessReact();
    await sendImageFromFile(archivoTemporal);
  },
};
