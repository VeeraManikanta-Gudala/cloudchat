import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
// import { useState } from "react";
import S3FileManager from "./comonents/S3FileManager";
import Chat from "./comonents/Chat";
import Navbar from "./comonents/Navbar";
import TerminalPage from "./comonents/TerminalPage";
function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
          CloudEase
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8 drop-shadow-sm">
          Making cloud access easy, fast, and intuitive. Manage files, chat with agents, and control your cloud resources—all in one place.
        </p>
        <button
          onClick={() => navigate("/chat")}
          className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition"
        >
          Start Chat
        </button>
      </div>

      {/* Footer or optional section */}
      <footer className="text-white/70 text-sm text-center py-4">
        © 2025 CloudEase. All rights reserved.
      </footer>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/file-manager" element={<S3FileManager />} />
        <Route path="/terminal" element={<TerminalPage />} />
      </Routes>
    </Router>
  );
}

export default App;
