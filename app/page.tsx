"use client";
import React, { useState, useEffect } from 'react';

export default function MochiBoard() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [knowledge, setKnowledge] = useState("");
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mochi_knowledge_base");
    if (saved) setKnowledge(saved);
  }, []);

  const handleAdminAuth = () => {
    if (passInput === "daveeee") setIsUnlocked(true);
    else alert("Invalid access code.");
  };

  const saveSettings = () => {
    localStorage.setItem("mochi_knowledge_base", knowledge);
    alert("Mochi's brain has been updated! 🍡");
    setShowAdmin(false);
    setIsUnlocked(false);
    setPassInput("");
  };

  const handleAskMochi = async () => {
    if (!userInput.trim()) return;
    if (!knowledge) return alert("Please set up the Knowledge Base in Admin first!");

    const newChat = [...chat, { role: 'user' as const, text: userInput }];
    setChat(newChat);
    setUserInput("");
    setLoading(true);

    try {
      // SECURE CALL: We call our own API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, knowledge }),
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setChat([...newChat, { role: 'ai', text: data.text }]);
    } catch (error) {
      setChat([...newChat, { role: 'ai', text: "Mochi's connection is lagging. Try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-800 p-4">
      {/* Navigation */}
      <nav className="max-w-3xl mx-auto flex justify-between items-center py-6 border-b border-orange-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl text-orange-500">🍡</span>
          <h1 className="text-xl font-bold text-orange-600 tracking-tight">The Mochi Board</h1>
        </div>
        <button onClick={() => setShowAdmin(true)} className="text-xs font-bold text-slate-400 hover:text-orange-500 tracking-widest uppercase">Admin</button>
      </nav>

      {/* Chat Area */}
      <main className="max-w-3xl mx-auto mt-8 flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
          {chat.length === 0 && (
            <div className="text-center py-20 opacity-30">
              <p className="text-6xl mb-4">🍡</p>
              <p className="text-lg">Ask me about the project's whitepaper or roadmap.</p>
            </div>
          )}
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm border ${
                msg.role === 'user' ? 'bg-orange-500 text-white border-transparent rounded-br-none' : 'bg-white border-orange-100 rounded-tl-none text-slate-700'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-xs text-orange-400 animate-pulse font-bold">Mochi is thinking...</div>}
        </div>

        {/* Input Bar */}
        <div className="relative">
          <input 
            className="w-full bg-white border border-orange-200 rounded-2xl py-4 pl-6 pr-16 shadow-lg focus:ring-2 focus:ring-orange-400 outline-none"
            placeholder="Type a question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskMochi()}
          />
          <button onClick={handleAskMochi} className="absolute right-3 top-2.5 bg-orange-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors">
            →
          </button>
        </div>
      </main>

      {/* Admin Modal */}
      {showAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
            {!isUnlocked ? (
              <div className="text-center">
                <h2 className="text-xl font-bold mb-6">Mochi Control Center</h2>
                <input 
                  type="password"
                  className="w-full border-2 border-slate-100 rounded-xl p-4 text-center mb-4 focus:border-orange-500 outline-none"
                  placeholder="Enter Passkey"
                  onChange={(e) => setPassInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminAuth()}
                />
                <button onClick={handleAdminAuth} className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold">Unlock</button>
                <button onClick={() => setShowAdmin(false)} className="mt-4 text-slate-400 text-sm">Cancel</button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-4">Update Knowledge Base</h2>
                <textarea 
                  className="w-full h-64 border-2 border-slate-100 rounded-2xl p-4 focus:border-orange-500 outline-none mb-6 text-sm"
                  placeholder="Paste your crypto project details here..."
                  value={knowledge}
                  onChange={(e) => setKnowledge(e.target.value)}
                />
                <div className="flex gap-4">
                  <button onClick={() => setIsUnlocked(false)} className="flex-1 py-4 bg-slate-100 rounded-xl font-bold">Back</button>
                  <button onClick={saveSettings} className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600">Sync & Save</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
