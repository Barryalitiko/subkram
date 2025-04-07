socket.ev.once("connection.update", async (update) => {
  const { connection, lastDisconnect } = update;

  if (connection === "open") {
    successLog("Operacion Marshall");

    // Solo pedimos el código si está conectado
    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
    sayLog(`Código de Emparejamiento: ${code}`);
  }

  if (connection === "close") {
    const statusCode = lastDisconnect?.error?.output?.statusCode;
    switch (statusCode) {
      case DisconnectReason.loggedOut:
        errorLog("Kram desconectado!");
        break;
      case DisconnectReason.badSession:
        warningLog("Sesion no válida!");
        break;
      case DisconnectReason.connectionClosed:
        warningLog("Conexion cerrada!");
        break;
      case DisconnectReason.connectionLost:
        warningLog("Conexion perdida!");
        break;
      case DisconnectReason.connectionReplaced:
        warningLog("Conexion de reemplazo!");
        break;
      case DisconnectReason.multideviceMismatch:
        warningLog("Dispositivo incompatible!");
        break;
      case DisconnectReason.forbidden:
        warningLog("Conexion prohibida!");
        break;
      case DisconnectReason.restartRequired:
        infoLog('Krampus reiniciado! Reinicia con "npm start".');
        break;
      case DisconnectReason.unavailableService:
        warningLog("Servicio no disponible!");
        break;
      default:
        errorLog("Desconocido, intenta nuevamente.");
        break;
    }

    // Reconectar automáticamente
    const newSocket = await connect();
    load(newSocket);
  } else {
    infoLog("Cargando datos...");
  }
});
