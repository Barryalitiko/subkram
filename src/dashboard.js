const http = require("http");

let metrics = {
  totalMessages: 0,
  totalCommands: 0,
  activeUsers: new Set(),
  errors: 0,
};

function startDashboard(socket) {
  // Escuchar eventos del bot para actualizar métricas
  socket.ev.on("messages.upsert", (message) => {
    metrics.totalMessages++;
    const user = message.messages[0]?.key?.participant || message.messages[0]?.key?.remoteJid;
    if (user) metrics.activeUsers.add(user);

    // Comandos
    const text = message.messages[0]?.message?.conversation || "";
    if (text.startsWith("!")) metrics.totalCommands++; // Reemplaza "!" por tu prefijo
  });

  socket.ev.on("error", () => {
    metrics.errors++;
  });

  // Crear servidor HTTP para mostrar el dashboard
  const server = http.createServer((req, res) => {
    if (req.url === "/metrics") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        totalMessages: metrics.totalMessages,
        totalCommands: metrics.totalCommands,
        activeUsers: metrics.activeUsers.size,
        errors: metrics.errors,
      }));
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <h1>Krampus Dashboard</h1>
        <ul>
          <li><strong>Total Messages:</strong> ${metrics.totalMessages}</li>
          <li><strong>Total Commands:</strong> ${metrics.totalCommands}</li>
          <li><strong>Active Users:</strong> ${metrics.activeUsers.size}</li>
          <li><strong>Errors:</strong> ${metrics.errors}</li>
        </ul>
      `);
    }
  });

  server.listen(3000, () => {
    console.log("Dashboard running at http://localhost:3000");
  });
}

module.exports = { startDashboard };