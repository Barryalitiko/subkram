async function processNumberFor(phoneNumber, numberPath, pairingCodePath, authPath) {
  const subbot = {
    phoneNumber,
    authPath: path.join(authPath, phoneNumber),
    tempFilePath: numberPath,
    codeFilePath: pairingCodePath,
  };

  let connected = false;
  const waitTime = 30000;        // 30 segundos de espera para la conexión

  try {
    const { state, saveCreds } = await useMultiFileAuthState(subbot.authPath);
    const { version } = await fetchLatestBaileysVersion();
    const socket = makeWASocket({
      version,
      logger: pino({ level: "error" }),
      printQRInTerminal: false,
      defaultQueryTimeoutMs: 60 * 1000,
      auth: state,
      shouldIgnoreJid: (jid) =>
        isJidBroadcast(jid) ||
        isJidStatusBroadcast(jid) ||
        isJidNewsletter(jid),
      keepAliveIntervalMs: 60 * 1000,
      markOnlineOnConnect: true,
      msgRetryCounterCache,
      shouldSyncHistoryMessage: () => false,
      getMessage,
    });

    // Solicitar código de emparejamiento solo una vez
    if (!fs.existsSync(pairingCodePath)) {
      console.log(`[connect] Solicitando código para ${phoneNumber}`);
      try {
        const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
        fs.writeFileSync(pairingCodePath, code, "utf8");
        console.log(`[connect] Código de emparejamiento generado: ${code}`);
      } catch (err) {
        console.error(`[connect] Error solicitando código para ${phoneNumber}:`, err);
        return; // Terminar proceso si no se obtiene el código
      }
    }

    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "open") {
        console.log(`[connect] Subbot ${phoneNumber} conectado exitosamente!`);
        connected = true;
        // Limpieza tras conexión exitosa
        if (fs.existsSync(numberPath)) fs.unlinkSync(numberPath);
        if (fs.existsSync(pairingCodePath)) fs.unlinkSync(pairingCodePath);
      }
      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.warn(`[connect] Conexión cerrada para ${phoneNumber} con código: ${statusCode}`);
        switch (statusCode) {
          case DisconnectReason.loggedOut:
            console.warn(`[connect] Sesión cerrada para ${phoneNumber}`);
            cleanUpSubbotFiles(subbot);
            break;
          case DisconnectReason.badSession:
            console.warn(`[connect] Sesión inválida para ${phoneNumber}`);
            break;
        }
      }
    });

    socket.ev.on("creds.update", saveCreds);

    console.log(
      `[connect] Esperando ${waitTime / 1000} segundos para que ${phoneNumber} se conecte...`
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    if (connected) {
      console.log(
        `[connect] Conectado exitosamente para ${phoneNumber}`
      );
    } else {
      console.log(
        `[connect] No se logró conectar para ${phoneNumber}`
      );
    }

  } catch (err) {
    console.error(`[connect] Error en el proceso para ${phoneNumber}:`, err);
  }

  // Siempre eliminar el archivo number.txt al final para evitar reintentos con un número ya procesado
  if (fs.existsSync(numberPath)) {
    fs.unlinkSync(numberPath);
    console.log(`[connect] Archivo number.txt eliminado para ${phoneNumber}`);
  }
}
