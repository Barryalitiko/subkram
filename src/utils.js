const readline = require('readline');

// Función para hacer preguntas
const question = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
};

// Función para permitir solo números
const onlyNumbers = (str) => str.replace(/\D/g, '');

module.exports = { question, onlyNumbers };
