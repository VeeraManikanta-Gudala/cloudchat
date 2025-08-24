import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
interface Message {
  sender: "user" | "bot";
  text: string;
}
import Navbar from "./Navbar";

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const msg = input;
    setMessages((prev) => [...prev, { sender: "user", text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8001/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let botText = "";

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.replace("data: ", "").trim();

              if (data === "[DONE]") {
                setLoading(false);
                return;
              }

              botText += data + "\n";
              setMessages((prev) => [
                ...prev.filter((m) => m.sender !== "bot" || m.text !== botText), // prevent duplicates
                { sender: "bot", text: botText.trim() },
              ]);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Error contacting server" },
      ]);
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <>
    <Navbar />
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-2xl h-[80vh] flex flex-col backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl shadow-2xl p-4">
        
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`max-w-[85%] p-3 rounded-2xl shadow-md whitespace-pre-wrap ${
                m.sender === "user"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white self-end ml-auto"
                  : "bg-white/70 text-gray-900 self-start"
              }`}
            >
              <div>{m.text}</div>
            </motion.div>
          ))}

          {loading && (
            <div className="bg-white/70 text-gray-900 self-start px-4 py-2 rounded-2xl inline-flex items-center space-x-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-150">●</span>
              <span className="animate-bounce delay-300">●</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex rounded-full overflow-hidden border border-white/30 shadow-md">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-2 bg-transparent placeholder-gray-200 text-white focus:outline-none"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 hover:opacity-90 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>

      </div>
    </div>
    </>
  );
}

export default Chat;
