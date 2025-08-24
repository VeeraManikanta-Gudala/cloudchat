import { WebSocketServer } from "ws";
import { spawn } from "node-pty";

const port = 5001;
const wss = new WebSocketServer({ port });

wss.on("connection", (ws) => {
  console.log("✅ New client connected");

  const shell = process.platform === "win32" ? "powershell.exe" : "bash";
  const pty = spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  // 👉 directly run your script
  pty.write("./connect.sh\n");

  pty.onData((data) => {
    ws.send(JSON.stringify({ type: "data", data }));
  });

  ws.on("message", (msg) => {
    const parsed = JSON.parse(msg.toString());
    if (parsed.type === "command") {
      pty.write(parsed.data);
    }
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
    pty.kill();
  });
});

console.log(`🚀 Terminal server running at ws://localhost:${port}`);
