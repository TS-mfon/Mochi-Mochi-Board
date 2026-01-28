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

  // --- GenLayer Inspired Inline Styles ---
  const styles = {
    container: { 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #a5f3fc 0%, #c4b5fd 50%, #93c5fd 100%)', 
      display: 'flex', 
      flexDirection: 'column' as const,
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: '"Inter", sans-serif',
      position: 'relative' as const,
      color: '#1e293b'
    },
    header: { width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    logoArea: { display: 'flex', alignItems: 'center', gap: '15px', fontSize: '32px', fontWeight: '800' },
    adminTrigger: { opacity: 0.5, cursor: 'pointer', border: 'none', background: 'none', fontSize: '12px' },
    chatDisplay: { 
      width: '100%', 
      maxWidth: '800px', 
      height: '50vh', 
      overflowY: 'auto' as const, 
      display: 'flex', 
      flexDirection: 'column' as const, 
      gap: '15px', 
      padding: '20px',
      marginBottom: '20px'
    },
    userBubble: { alignSelf: 'flex-end', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '12px 20px', borderRadius: '24px', maxWidth: '75%', color: '#1e293b' },
    aiBubble: { alignSelf: 'flex-start', backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '24px', maxWidth: '75%', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    inputWrapper: { width: '100%', maxWidth: '600px', position: 'relative' as const },
    inputField: { 
      width: '100%', 
      padding: '18px 60px 18px 30px', 
      borderRadius: '50px', 
      border: 'none', 
      backgroundColor: '#ffffff', 
      fontSize: '16px', 
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
      outline: 'none' 
    },
    sendBtn: { 
      position: 'absolute' as const, 
      right: '10px', 
      top: '50%', 
      transform: 'translateY(-50%)', 
      background: 'none', 
      border: 'none', 
      cursor: 'pointer',
      fontSize: '24px',
      color: '#06b6d4'
    },
    footer: { marginTop: '30px', fontSize: '12px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', letterSpacing: '0.5px' },
    modalOverlay: { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '40px', borderRadius: '32px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoArea}>
           <span>🍡</span> Mochi Board
        </div>
        <button style={styles.adminTrigger} onClick={() => setShowAdmin(true)}>⚙️ Admin</button>
      </header>

      <div style={styles.chatDisplay}>
        {chat.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '50px', opacity: 0.6 }}>
            <p style={{ fontSize: '18px', fontWeight: '500' }}>The Mochi knowledge bank is ready.</p>
          </div>
        )}
        {chat.map((msg, i) => (
          <div key={i} style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
            {msg.text}
          </div>
        ))}
        {loading && <div style={{ fontSize: '12px', color: '#fff', marginLeft: '20px' }}>Analyzing knowledge base...</div>}
      </div>

      <div style={styles.inputWrapper}>
        <input 
          style={styles.inputField} 
          placeholder="Type your message..." 
          value={userInput} 
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskMochi()}
        />
        <button style={styles.sendBtn} onClick={handleAskMochi}>➔</button>
      </div>

      <div style={styles.footer}>Powered by Mochi AI</div>

      {showAdmin && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            {!isUnlocked ? (
              <>
                <h3 style={{ marginBottom: '20px' }}>Admin Access</h3>
                <input 
                  type="password" 
                  style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px', textAlign: 'center' }} 
                  placeholder="Passkey"
                  onChange={(e) => setPassInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminAuth()}
                />
                <button 
                  style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#8b5cf6', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={handleAdminAuth}
                >
                  Unlock Board
                </button>
                <button onClick={() => setShowAdmin(false)} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Close</button>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: '10px' }}>Knowledge Base</h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px' }}>Paste Whitepaper, FAQs, or project updates here.</p>
                <textarea 
                  style={{ width: '100%', height: '250px', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} 
                  value={knowledge} 
                  onChange={(e) => setKnowledge(e.target.value)}
                />
                <button 
                  style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#06b6d4', color: '#fff', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' }}
                  onClick={saveSettings}
                >
                  Update Mochi
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
