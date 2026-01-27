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
    alert("Mochi Board Updated! 🍡");
    setShowAdmin(false);
    setIsUnlocked(false);
    setPassInput("");
  };

  const handleAskMochi = async () => {
    if (!userInput.trim()) return;
    if (!knowledge) return alert("Knowledge base empty! Visit Admin.");

    const newChat = [...chat, { role: 'user' as const, text: userInput }];
    setChat(newChat);
    setUserInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, knowledge }),
      });
      const data = await response.json();
      setChat([...newChat, { role: 'ai', text: data.text }]);
    } catch (error) {
      setChat([...newChat, { role: 'ai', text: "Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  // --- Inline Styles ---
  const styles = {
    container: { minHeight: '100 screen', backgroundColor: '#fafaf9', padding: '20px', fontFamily: 'sans-serif' },
    nav: { maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #fed7aa' },
    logo: { fontSize: '24px', fontWeight: 'bold', color: '#ea580c' },
    adminBtn: { fontSize: '12px', color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer', textTransform: 'uppercase' as const },
    chatBox: { maxWidth: '800px', margin: '40px auto', height: '60vh', overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const, gap: '15px' },
    userMsg: { alignSelf: 'flex-end', backgroundColor: '#ea580c', color: 'white', padding: '12px 18px', borderRadius: '20px 20px 0 20px', maxWidth: '80%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
    aiMsg: { alignSelf: 'flex-start', backgroundColor: 'white', border: '1px solid #fed7aa', padding: '12px 18px', borderRadius: '20px 20px 20px 0', maxWidth: '80%', color: '#475569' },
    inputArea: { maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '10px', position: 'relative' as const },
    input: { flex: 1, padding: '16px 24px', borderRadius: '15px', border: '1px solid #fed7aa', outline: 'none', fontSize: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' },
    sendBtn: { backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '0 25px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' },
    modal: { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    modalContent: { backgroundColor: 'white', padding: '40px', borderRadius: '30px', width: '90%', maxWidth: '500px', textAlign: 'center' as const },
    textarea: { width: '100%', height: '200px', marginTop: '20px', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.logo}>🍡 The Mochi Board</div>
        <button style={styles.adminBtn} onClick={() => setShowAdmin(true)}>Manage</button>
      </nav>

      <main style={styles.chatBox}>
        {chat.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '100px', color: '#94a3b8' }}>
            <h1 style={{ fontSize: '50px' }}>🍡</h1>
            <p>I'm Mochi. Ask me about the project!</p>
          </div>
        )}
        {chat.map((msg, i) => (
          <div key={i} style={msg.role === 'user' ? styles.userMsg : styles.aiMsg}>
            {msg.text}
          </div>
        ))}
        {loading && <div style={{ color: '#fb923c', fontSize: '12px', fontWeight: 'bold' }}>Mochi is thinking...</div>}
      </main>

      <div style={styles.inputArea}>
        <input 
          style={styles.input} 
          placeholder="What's the tokenomics?" 
          value={userInput} 
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskMochi()}
        />
        <button style={styles.sendBtn} onClick={handleAskMochi}>Ask</button>
      </div>

      {showAdmin && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            {!isUnlocked ? (
              <>
                <h2>Admin Unlock</h2>
                <input 
                  type="password" 
                  style={{...styles.input, width: '100%', margin: '20px 0', textAlign: 'center'}} 
                  placeholder="Passkey"
                  onChange={(e) => setPassInput(e.target.value)}
                />
                <button style={{...styles.sendBtn, width: '100%', padding: '15px'}} onClick={handleAdminAuth}>Enter</button>
                <button style={{marginTop: '15px', border: 'none', background: 'none', color: '#94a3b8'}} onClick={() => setShowAdmin(false)}>Cancel</button>
              </>
            ) : (
              <>
                <h2>Knowledge Base</h2>
                <textarea 
                  style={styles.textarea} 
                  value={knowledge} 
                  onChange={(e) => setKnowledge(e.target.value)}
                  placeholder="Paste whitepaper here..."
                />
                <button style={{...styles.sendBtn, width: '100%', padding: '15px', marginTop: '20px'}} onClick={saveSettings}>Sync Mochi</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
