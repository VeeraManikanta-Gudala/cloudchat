"use client";

import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";

function XTerminal() {
  const terminalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. create terminal
    const term = new Terminal({
      fontSize: 14,
      rows: 30,
      cols: 100,
      theme: {
        background: "#1e1e1e",
        foreground: "#ffffff",
      },
    });

    if (terminalRef.current) {
      term.open(terminalRef.current);
      term.focus();
    }

    // 2. connect once
    const socket = new WebSocket("ws://localhost:5001");

    socket.onopen = () => {
      console.log("✅ WS connected");
    };

    socket.onclose = () => {
      console.log("❌ WS closed");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "data") {
        term.write(data.data);
      }
    };

    // 3. send keystrokes
    term.onData((data) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "command", data }));
      }
    });

    // 4. cleanup
    return () => {
      socket.close();
      term.dispose();
    };
  }, []);

  return <div ref={terminalRef} className="h-screen w-screen bg-black" />;
}

export default XTerminal;
