"use client";
import ReactMarkdown from 'react-markdown';
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
      console.error("Failed to fetch settings.");
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
        body: JSON.stringify({ password: passInput, knowledge: knowledge }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Mochi Board updated successfully!");
        setLastUpdated(new Date().toISOString());
        setIsUnlocked(false);
        setShowAdmin(false);
        setPassInput("");
      } else {
        alert("Error: " + (data.error || "Failed to update database."));
      }
    } catch (error) {
      alert("Network error.");
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
      background: 'linear-gradient(180deg, #282B5D 0%, #000000 100%)', // GenLayer Navy to Black [cite: 242, 243]
      display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
      fontFamily: '"Inter", sans-serif', color: '#FFFFFF',
      width: '100%',
    },
    header: { width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 20px' },
    logoText: { fontSize: '22px', fontWeight: '800', letterSpacing: '2px', color: '#E37DF7', textTransform: 'uppercase' as const }, // Neon Purple Accent [cite: 120, 233]
    chatPanel: {
      width: 'calc(100% - 40px)', maxWidth: '900px', height: '60vh', marginTop: '10px', padding: '30px',
      background: 'rgba(40, 43, 93, 0.2)', backdropFilter: 'blur(25px)', border: '1px solid rgba(17, 15, 255, 0.3)', // Primary Blue Border [cite: 241]
      borderRadius: '40px', display: 'flex', flexDirection: 'column' as const, gap: '20px', overflowY: 'auto' as const,
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    },
    userBubble: { 
      alignSelf: 'flex-end', backgroundColor: '#110FFF', color: '#FFFFFF', // Electric Blue [cite: 241]
      padding: '16px 24px', borderRadius: '25px 25px 4px 25px', maxWidth: '70%', fontSize: '15px',
      boxShadow: '0 4px 15px rgba(17, 15, 255, 0.4)'
    },
    aiBubble: { 
      alignSelf: 'flex-start', backgroundColor: '#FFFFFF', color: '#000000', // White for high contrast [cite: 124, 244]
      padding: '20px 28px', borderRadius: '25px 25px 25px 4px', maxWidth: '80%', fontSize: '15px', 
      boxShadow: '0 10px 30px rgba(227, 125, 247, 0.2)', lineHeight: '1.6'
    },
    inputWrapper: { 
      width: 'calc(100% - 40px)', maxWidth: '800px', marginTop: '40px', display: 'flex', alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '100px', padding: '10px 15px 10px 35px', 
      border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
    },
    inputField: { flex: 1, border: 'none', background: 'transparent', fontSize: '16px', outline: 'none', color: '#FFFFFF', padding: '12px 0' },
    sendButton: { 
      backgroundColor: '#E37DF7', color: '#FFFFFF', width: '56px', height: '56px', borderRadius: '50%',
      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px',
      boxShadow: '0 0 20px rgba(227, 125, 247, 0.5)', transition: 'all 0.3s ease'
    },
    footer: { 
      width: '100%', 
      marginTop: 'auto', 
      padding: '40px 0', 
      textAlign: 'center' as const,
      background: 'linear-gradient(to top, rgba(227, 125, 247, 0.1), transparent)', // Subtle purple glow [cite: 233]
      borderTop: '1px solid rgba(227, 125, 247, 0.2)',
      fontSize: '11px', fontWeight: '800', color: '#E37DF7', letterSpacing: '3px', textTransform: 'uppercase' as const 
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoText}>Mochi Board</div>
        <button onClick={() => setShowAdmin(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>⚙️</button>
      </header>

      <div style={styles.chatPanel}>
        {chat.length === 0 && (
          <div style={{ textAlign: 'center', margin: 'auto' }}>
            <p style={{ color: '#E37DF7', fontWeight: '700', letterSpacing: '1px' }}>Ready to help with answers relating to GenLayer.</p>
            <p style={{ fontSize: '12px', opacity: 0.4, marginTop: '10px' }}>Ask about Intelligent Contracts, Consensus, or the Ecosystem.</p>
          </div>
        )}
        {chat.map((msg, i) => (
          <div key={i} style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
            {msg.role === 'ai' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
          </div>
        ))}
        {loading && (
          <div style={{ color: '#E37DF7', fontSize: '11px', fontWeight: '900', marginLeft: '25px', letterSpacing: '2px' }}>
            MOCHI IS COOKING...
          </div>
        )}
      </div>

      <div style={styles.inputWrapper}>
        <input 
          style={styles.inputField} 
          placeholder="Ask Mochi anything about GenLayer..." 
          value={userInput} 
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskMochi()}
        />
        <button style={styles.sendButton} onClick={handleAskMochi}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

      <footer style={styles.footer}>
        Made By Gen. Dave
      </footer>

      {showAdmin && (
        <div style={{ position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '40px', width: '90%', maxWidth: '550px', border: '1px solid #E37DF7' }}>
            {!isUnlocked ? (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#E37DF7', marginBottom: '25px' }}>Terminal Access</h2>
                <input 
                  type="password" 
                  style={{ width: '100%', padding: '18px', borderRadius: '15px', border: 'none', backgroundColor: '#0f172a', color: 'white', marginBottom: '20px', textAlign: 'center' }} 
                  placeholder="Enter Passkey" 
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)} 
                />
                <button onClick={handleAdminAuth} style={{ width: '100%', padding: '18px', borderRadius: '15px', border: 'none', backgroundColor: '#E37DF7', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Unlock Base</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#E37DF7' }}>Knowledge Core</h3>
                  {lastUpdated && <span style={{ fontSize: '10px', color: '#94a3b8' }}>SYNC: {new Date(lastUpdated).toLocaleTimeString()}</span>}
                </div>
                <textarea 
                  style={{ width: '100%', height: '300px', padding: '20px', borderRadius: '20px', border: 'none', backgroundColor: '#0f172a', color: '#e2e8f0', marginBottom: '20px', fontSize: '14px' }} 
                  value={knowledge} 
                  onChange={(e) => setKnowledge(e.target.value)} 
                />
                <button onClick={saveSettings} style={{ width: '100%', padding: '18px', borderRadius: '15px', border: 'none', backgroundColor: '#110FFF', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  {loading ? "INITIALIZING SYNC..." : "PUSH TO MAINNET"}
                </button>
              </div>
            )}
            <button onClick={() => { setShowAdmin(false); setIsUnlocked(false); }} style={{ display: 'block', margin: '25px auto 0', color: '#64748b', border: 'none', background: 'none', cursor: 'pointer' }}>Disconnect</button>
          </div>
        </div>
      )}
    </div>
  );
}
