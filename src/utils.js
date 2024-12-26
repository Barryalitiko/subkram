const readline = require('readline');

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

const onlyNumbers = (str) => str.replace(/\D/g, '');

module.exports = { question, onlyNumbers };
