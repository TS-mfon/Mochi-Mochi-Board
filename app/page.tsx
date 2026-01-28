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
    alert("Knowledge Base Updated! 🍡");
    setShowAdmin(false);
    setIsUnlocked(false);
    setPassInput("");
  };

  const handleAskMochi = async () => {
    if (!userInput.trim() || loading) return;
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
      setChat([...newChat, { role: 'ai', text: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  // --- Professional Web3 Inline Styles ---
  const styles = {
    container: { 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top left, #a5f3fc, #c4b5fd 40%, #93c5fd 100%)', 
      display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '20px',
      fontFamily: '"Inter", -apple-system, sans-serif', color: '#0f172a'
    },
    header: { width: '100%', maxWidth: '850px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' },
    logo: { fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '10px' },
    glassPanel: {
      width: '100%', maxWidth: '850px', height: '60vh', marginTop: '20px', padding: '30px',
      background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.5)',
      borderRadius: '32px', display: 'flex', flexDirection: 'column' as const, gap: '20px', overflowY: 'auto' as const,
      boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
    },
    userBubble: { alignSelf: 'flex-end', backgroundColor: '#7c3aed', color: 'white', padding: '14px 22px', borderRadius: '22px 22px 4px 22px', maxWidth: '75%', fontSize: '15px', lineHeight: '1.5' },
    aiBubble: { alignSelf: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '14px 22px', borderRadius: '22px 22px 22px 4px', maxWidth: '75%', fontSize: '15px', lineHeight: '1.5', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
    inputContainer: { width: '100%', maxWidth: '600px', marginTop: '30px', position: 'relative' as const },
    input: { width: '100%', padding: '20px 70px 20px 30px', borderRadius: '100px', border: 'none', background: 'white', fontSize: '16px', boxShadow: '0 10px 30px rgba(124, 58, 237, 0.1)', outline: 'none' },
    sendIcon: { position: 'absolute' as const, right: '12px', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#7c3aed', color: 'white', width: '48px', height: '48px', borderRadius: '50px', border: 'none', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    footer: { marginTop: 'auto', padding: '30px 0', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '2px', opacity: 0.6 }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>🍡 MOCHI BOARD</div>
        <button 
          onClick={() => setShowAdmin(true)} 
          style={{ background: 'rgba(255,255,255,0.3)', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          CONTROL
        </button>
      </header>

      <div style={styles.glassPanel}>
        {chat.length === 0 && (
          <div style={{ textAlign: 'center', margin: 'auto', opacity: 0.5 }}>
            <p style={{ fontSize: '40px' }}>🍡</p>
            <p style={{ fontWeight: '600' }}>The knowledge bank is online and synced.</p>
          </div>
        )}
        {chat.map((msg, i) => (
          <div key={i} style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
            {msg.text}
          </div>
        ))}
        {loading && <div style={{ color: '#7c3aed', fontSize: '13px', fontWeight: '600', animation: 'pulse 1.5s infinite' }}>Mochi is processing...</div>}
      </div>

      <div style={styles.inputContainer}>
        <input 
          style={styles.input} 
          placeholder="Ask anything about the project..." 
          value={userInput} 
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskMochi()}
        />
        <button style={styles.sendIcon} onClick={handleAskMochi}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>

      <p style={styles.footer}>Powered by GenLayer AI Framework</p>

      {/* Admin Panel Overlay */}
      {showAdmin && (
        <div style={{ position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', width: '90%', maxWidth: '500px', textAlign: 'center' }}>
            {!isUnlocked ? (
              <>
                <h2 style={{ marginBottom: '20px' }}>Secure Access</h2>
                <input 
                  type="password" 
                  style={{ width: '100%', padding: '18px', borderRadius: '16px', border: '2px solid #f1f5f9', marginBottom: '20px', outline: 'none', textAlign: 'center', fontSize: '18px' }} 
                  placeholder="••••"
                  autoFocus
                  onChange={(e) => setPassInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminAuth()}
                />
                <button onClick={handleAdminAuth} style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Unlock</button>
                <button onClick={() => setShowAdmin(false)} style={{ marginTop: '20px', color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer' }}>Close</button>
              </>
            ) : (
              <>
                <h2 style={{ marginBottom: '10px' }}>Knowledge Engine</h2>
                <textarea 
                  style={{ width: '100%', height: '300px', padding: '20px', borderRadius: '16px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '14px', marginBottom: '20px' }} 
                  value={knowledge} 
                  onChange={(e) => setKnowledge(e.target.value)}
                  placeholder="Paste your whitepaper data here..."
                />
                <button onClick={saveSettings} style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', backgroundColor: '#7c3aed', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Update Knowledge</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
