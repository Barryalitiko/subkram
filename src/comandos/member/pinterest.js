const { PREFIX } = require("../../krampus");
const PinterestScraper = require('pinterest-scraper');

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

    const scraper = new PinterestScraper();
    const query = fullArgs.join(' ');
    const results = await scraper.search(query);

    if (!results || results.length === 0) {
      throw new WarningError("No se encontraron resultados");
    }

    const imageUrl = results[0].image;
    await sendSuccessReact();
    await sendImageFromURL(imageUrl);
  }
};
