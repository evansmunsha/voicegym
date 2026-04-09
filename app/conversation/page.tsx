"use client";

import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { speakText } from "@/lib/speech";

export default function ConversationPage() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    { role: "ai", text: "Hello! Let's practice English conversation. Say something to start." },
  ]);
  const [input, setInput] = useState("");
  const [isAITalking, setIsAITalking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Start speech recognition
  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  // Send user message
  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", text: input }]);
    setInput("");
    // Call AI API
    const res = await fetch("/api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, { role: "user", text: input }] }),
    });
    const data = await res.json();
    setMessages((msgs) => [...msgs, { role: "ai", text: data.reply }]);
    setIsAITalking(true);
    await speakText(data.reply, 1.0);
    setIsAITalking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar title="Conversation AI" />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow mb-6">
          <h1 className="text-2xl font-bold mb-2">Real-Time Conversation</h1>
          <p className="text-gray-700 mb-4">Talk to the AI tutor. Speak or type your message. The AI will reply with voice.</p>
          <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`p-3 rounded-xl ${msg.role === "user" ? "bg-blue-100 text-right ml-16" : "bg-green-100 text-left mr-16"}`}>
                <span className="block font-semibold">{msg.role === "user" ? "You" : "AI"}</span>
                <span>{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={startRecognition}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
              disabled={isAITalking}
            >
              🎤 Speak
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
              placeholder="Say or type something..."
              disabled={isAITalking}
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
              disabled={isAITalking || !input.trim()}
            >
              ➤ Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
