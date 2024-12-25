const readline = require('readline');

// Crear una interfaz de lectura de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para hacer preguntas
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Función para asegurarse de que la entrada solo contenga números
function onlyNumbers(input) {
  return input.replace(/\D/g, ''); // Elimina todo lo que no sea un número
}

// Exportar las funciones
module.exports = {
  question,
  onlyNumbers
};
