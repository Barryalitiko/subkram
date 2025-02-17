const { PREFIX } = require("../../krampus");
const { Pinterest } = require('pinterest-scraper');

module.exports = {
name: 'pinterest',
description: 'Buscar imágenes en Pinterest',
commands: ["pinterest", "pin"],
usage: `${PREFIX}pinterest <palabras clave>`,
handle: async ({ fullArgs, sendWaitReact, sendSuccessReact, sendImageFromURL }) => {
if (!fullArgs.length) {
throw new WarningError("Vaya...\nañade palabras clave para buscar imágenes en Pinterest\n> Krampus OM bot");
}

await sendWaitReact();

const pinterest = new Pinterest();
const query = fullArgs.join(' ');
const results = await pinterest.search(query);

if (!results || results.length === 0) {
  throw new WarningError("No se encontraron resultados");
}

const imageUrl = results[0].image;
await sendSuccessReact();
await sendImageFromURL(imageUrl);

}
};


