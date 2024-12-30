const playdl = require('play-dl');

(async () => {
  try {
    console.log('Probando conexión a YouTube...');
    const searchResult = await playdl.search('Despacito', { limit: 1 });
    console.log('Resultado de la búsqueda:', searchResult);

    if (searchResult.length > 0) {
      const stream = await playdl.stream(searchResult[0].url);
      console.log('Stream obtenido correctamente:', stream);
    } else {
      console.log('No se encontraron resultados.');
    }
  } catch (error) {
    console.error('Error conectando a YouTube:', error);
  }
})();