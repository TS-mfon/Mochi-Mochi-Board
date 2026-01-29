"use client";
import React, { useState, useEffect } from 'react';

export default function MochiBoard() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [knowledge, setKnowledge] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch the current knowledge and timestamp when Admin is unlocked
  useEffect(() => {
    if (showAdmin && isUnlocked) {
      fetchSettings();
    }
  }, [showAdmin, isUnlocked]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/chat'); 
      const data = await response.json();
      if (data.knowledge) {
        setKnowledge(data.knowledge);
        setLastUpdated(data.updated_at);
      }
    } catch (error) {
      console.error("Failed to fetch current settings.");
    }
  };

  const handleAdminAuth = () => {
    if (passInput === "daveeee") setIsUnlocked(true);
    else alert("Invalid access code.");
  };

  const saveSettings = async () => {
    if (!knowledge.trim()) return alert("Knowledge cannot be empty!");
    
    setLoading(true);
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password: passInput, 
          knowledge: knowledge 
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Mochi Board updated successfully! 🍡");
        setLastUpdated(new Date().toISOString());
        setIsUnlocked(false);
        setShowAdmin(false);
        setPassInput("");
      } else {
        alert("Error: " + (data.error || "Failed to update database."));
      }
    } catch (error) {
      alert("Network error. Check your API paths.");
    } finally {
      setLoading(false);
    }
  };

  const handleAskMochi = async () => {
    if (!userInput.trim() || loading) return;
    const newChat = [...chat, { role: 'user' as const, text: userInput }];
    setChat(newChat);
    setUserInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }), 
      });
      const data = await response.json();
      setChat([...newChat, { role: 'ai', text: data.text }]);
    } catch (error) {
      setChat([...newChat, { role: 'ai', text: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #a5f3fc 0%, #c4b5fd 50%, #93c5fd 100%)', 
      display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '20px',
      fontFamily: '"Inter", sans-serif', color: '#0f172a'
    },
    header: { width: '100%', maxWidth: '850px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' },
    logo: { fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '10px' },
    chatPanel: {
      width: '100%', maxWidth: '850px', height: '55vh', marginTop: '20px', padding: '30px',
      background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '32px', display: 'flex', flexDirection: 'column' as const, gap: '20px', overflowY: 'auto' as const,
    },
    userBubble: { alignSelf: 'flex-end', backgroundColor: 'rgba(255, 255, 255, 0.3)', padding: '14px 22px', borderRadius: '22px 22px 4px 22px', maxWidth: '75%', fontSize: '15px' },
    aiBubble: { alignSelf: 'flex-start', backgroundColor: '#ffffff', padding: '14px 22px', borderRadius: '22px 22px 22px 4px', maxWidth: '75%', fontSize: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    inputWrapper: { 
      width: '100%', maxWidth: '750px', marginTop: '40px', display: 'flex', alignItems: 'center',
      backgroundColor: '#ffffff', borderRadius: '100px', padding: '8px 12px 8px 30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    },
    inputField: { flex: 1, border: 'none', background: 'transparent', fontSize: '16px', outline: 'none', color: '#475569', padding: '12px 0' },
    sendButton: { 
      backgroundColor: '#8b5cf6', color: 'white', width: '52px', height: '52px', borderRadius: '50%',
      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px'
    },
    footer: { marginTop: '20px', fontSize: '12px', fontWeight: '700', opacity: 0.7, letterSpacing: '1px' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>🍡 MOCHI BOARD</div>
        <button onClick={() => setShowAdmin(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>⚙️</button>
      </header>

      <div style={styles.chatPanel}>
        {chat.length === 0 && (
          <div style={{ textAlign: 'center', margin: 'auto', opacity: 0.5 }}>
            <p>Ready to help with your crypto project details.</p>
          </div>
        )}
        {chat.map((msg, i) => (
          <div key={i} style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
            {msg.text}
          </div>
        ))}
        {loading && <div style={{ color: '#8b5cf6', fontSize: '12px', fontWeight: 'bold', marginLeft: '20px' }}>Thinking...</div>}
      </div>

      <div style={styles.inputWrapper}>
        <input 
          style={styles.inputField} 
          placeholder="Ask anything about the project..." 
          value={userInput} 
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskMochi()}
        />
        <button style={styles.sendButton} onClick={handleAskMochi}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

      <p style={styles.footer}>POWERED BY GENLAYER AI</p>

      {showAdmin && (
        <div style={{ position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', width: '90%', maxWidth: '500px' }}>
            {!isUnlocked ? (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px' }}>Admin Login</h2>
                <input 
                  type="password" 
                  style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px', textAlign: 'center' }} 
                  placeholder="Passkey" 
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)} 
                />
                <button onClick={handleAdminAuth} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Unlock</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                  <h2 style={{ margin: 0 }}>Knowledge Engine</h2>
                  {lastUpdated && (
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>
                      LAST SYNC: {new Date(lastUpdated).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <textarea 
                  style={{ width: '100%', height: '300px', padding: '20px', borderRadius: '16px', border: '1px solid #eee', marginBottom: '20px' }} 
                  value={knowledge} 
                  onChange={(e) => setKnowledge(e.target.value)} 
                />
                <button onClick={saveSettings} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#8b5cf6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  {loading ? "Syncing..." : "Save & Sync"}
                </button>
              </div>
            )}
            <button onClick={() => { setShowAdmin(false); setIsUnlocked(false); }} style={{ display: 'block', margin: '20px auto 0', color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
