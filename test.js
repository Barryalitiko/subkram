const playdl = require('play-dl');
const fs = require('fs');

(async () => {
  try {
    console.log('Probando conexión a YouTube...');
    const searchResult = await playdl.search('Despacito', { limit: 1 });
    console.log('Resultado de la búsqueda:', searchResult);

    if (searchResult.length > 0) {
      const video = searchResult[0];
      console.log('Iniciando el streaming para:', video.title);

      const stream = await playdl.stream(video.url);
      console.log('Stream obtenido correctamente.');

      console.log('Convirtiendo stream a buffer...');
      const buffer = await streamToBuffer(stream.stream);
      console.log('Buffer generado, tamaño:', buffer.length);

      // Guardar el buffer como archivo para verificar
      fs.writeFileSync('despacito.mp3', buffer);
      console.log('Archivo de audio guardado como "despacito.mp3".');
    } else {
      console.log('No se encontraron resultados.');
    }
  } catch (error) {
    console.error('Error conectando a YouTube:', error);
  }
})();

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => {
      console.log('Chunk recibido, tamaño:', chunk.length);
      chunks.push(chunk);
    });
    stream.on('end', () => {
      console.log('Stream completado, generando buffer...');
      resolve(Buffer.concat(chunks));
    });
    stream.on('error', error => {
      console.error('Error en el stream:', error);
      reject(error);
    });
  });
}