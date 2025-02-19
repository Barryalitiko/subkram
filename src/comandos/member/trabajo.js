const fs = require("fs");
const path = require("path");
const { PREFIX } = require("../../krampus");

const commandStatusFilePath = path.resolve(process.cwd(), "assets/monedas.json");
const usageStatsFilePath = path.resolve(process.cwd(), "assets/usageStats.json");
const krFilePath = path.resolve(process.cwd(), "assets/kr.json");
const jobsFilePath = path.resolve(process.cwd(), "assets/trabajos.json");

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error al escribir en el archivo ${filePath}: ${error.message}`);
  }
};

// Lista de trabajos disponibles
const trabajos = {
  abogado: "Defendiendo casos en la corte.",
  chef: "Preparando deliciosos platillos.",
  taxista: "Llevando pasajeros a su destino.",
  programador: "Escribiendo código sin descanso.",
  limpiador: "Dejando todo reluciente.",
  cantante: "Dando un concierto increíble.",
  mecanico: "Reparando autos en el taller.",
  artista: "Pintando una obra maestra.",
  fotografo: "Tomando fotos profesionales.",
  carpintero: "Construyendo muebles resistentes.",
};

module.exports = {
  name: "trabajo",
  description: "Selecciona un trabajo y recibe un pago después de 10 minutos.",
  commands: ["trabajo"],
  usage: `${PREFIX}trabajo [nombre del trabajo]`,

  handle: async ({ sendReply, userJid, args }) => {
    const commandStatus = readData(commandStatusFilePath);
    if (commandStatus.commandStatus !== "on") {
      await sendReply("❌ El sistema de trabajos está desactivado.");
      return;
    }

    let trabajosActivos = readData(jobsFilePath);

    // Si el usuario no especificó un trabajo, mostrar la lista
    if (args.length === 0) {
      let lista = "📋 *Trabajos disponibles:*\n";
      for (const trabajo in trabajos) {
        lista += `➤ *${trabajo}* – ${trabajos[trabajo]}\n`;
      }
      await sendReply(lista);
      return;
    }

    const trabajoSeleccionado = args[0].toLowerCase();

    // Verificar si el trabajo existe
    if (!trabajos[trabajoSeleccionado]) {
      await sendReply("❌ Ese trabajo no existe. Usa *#trabajo* para ver la lista.");
      return;
    }

    // Verificar si el usuario ya tiene un trabajo activo
    if (trabajosActivos[userJid]) {
      await sendReply("❌ Ya tienes un trabajo en curso. Espera a que termine para elegir otro.");
      return;
    }

    // Guardar el trabajo en el registro
    trabajosActivos[userJid] = {
      trabajo: trabajoSeleccionado,
      tiempoInicio: Date.now(),
    };
    writeData(jobsFilePath, trabajosActivos);

    await sendReply(`✅ Ahora eres *${trabajoSeleccionado}*. ${trabajos[trabajoSeleccionado]}.\n⌛ Tu pago llegará en 10 minutos.`);

    // Esperar 10 minutos (600,000 ms)
    setTimeout(async () => {
      // Leer nuevamente los datos en caso de cambios
      trabajosActivos = readData(jobsFilePath);
      
      // Si el usuario sigue en el trabajo, pagarle
      if (trabajosActivos[userJid]) {
        const pago = [8, 10, 15][Math.floor(Math.random() * 3)]; // Pago aleatorio
        let krData = readData(krFilePath);
        let userKr = krData.find(entry => entry.userJid === userJid);

        if (!userKr) {
          userKr = { userJid, kr: 0 };
          krData.push(userKr);
        }

        userKr.kr += pago;
        krData = krData.map(entry => (entry.userJid === userJid ? userKr : entry));
        writeData(krFilePath, krData);

        // Eliminar el trabajo del usuario
        delete trabajosActivos[userJid];
        writeData(jobsFilePath, trabajosActivos);

        await sendReply(`✅ *Tu trabajo como ${trabajoSeleccionado} ha terminado.*\n💰 *Recibiste ${pago} monedas.*`);
      }
    }, 600000);
  },
};