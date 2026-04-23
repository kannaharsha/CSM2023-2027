import React, { useState, useEffect } from 'react';
import { localDB } from '../lib/localDB';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', rollNo: '', category: 'Appreciation', message: '' });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await localDB
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setMessages(data);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    
    const { data, error } = await localDB
      .from('messages')
      .insert([
        { 
          name: formData.name, 
          roll_no: formData.rollNo, 
          category: formData.category, 
          message: formData.message 
        }
      ])
      .select();

    if (!error && data) {
      const newMsg = { ...data[0], isNew: true };
      setMessages([newMsg, ...messages]);
      setFormData({ name: '', rollNo: '', category: 'Appreciation', message: '' });
      
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, isNew: false } : m));
      }, 1000);
    }
  };

  const handleLike = async (id) => {
    const msgToLike = messages.find(m => m.id === id);
    if (!msgToLike) return;

    const { error } = await localDB
      .from('messages')
      .update({ likes: (msgToLike.likes || 0) + 1 })
      .eq('id', id);

    if (!error) {
      setMessages(messages.map(msg => msg.id === id ? { ...msg, likes: (msg.likes || 0) + 1 } : msg));
    }
  };

  return (
    <section id="messages">
      <h2 className="section-title text-gradient reveal">Wall of Love</h2>
      <p className="section-subtitle reveal">Leave a piece of your heart. Share memories, jokes, and gratitude.</p>
      
      <div className="glass-panel reveal" style={{ width: '100%', maxWidth: '700px', marginBottom: '4rem', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent)', filter: 'blur(60px)', opacity: 0.3 }}></div>
        
        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
          <div className="form-grid">
            <div>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
            </div>
            <div>
              <input type="text" name="rollNo" className="form-control" value={formData.rollNo} onChange={handleChange} placeholder="Roll No (Optional)" />
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
              <option value="Appreciation">Appreciation 🌟</option>
              <option value="Funny">Funny 😂</option>
              <option value="Memory">Memory 📸</option>
            </select>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <textarea name="message" className="form-control" value={formData.message} onChange={handleChange} rows="4" placeholder="Write your message here..." required></textarea>
          </div>
          <button type="submit" className="btn primary" style={{ width: '100%' }}>Post Message</button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.5)' }}>Loading memories...</p>
        </div>
      ) : (
        <div className="masonry-grid">
          {messages.map((msg) => (
            <div key={msg.id} className={msg.isNew ? 'pop-in' : 'reveal active'} style={{ 
              breakInside: 'avoid',
              marginBottom: '2rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(244, 63, 94, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              e.currentTarget.style.borderColor = 'var(--glass-border)';
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.1rem' }}>{msg.name}</span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '20px' }}>{msg.category}</span>
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.6', color: '#e2e8f0' }}>"{msg.message}"</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>{msg.roll_no ? `#${msg.roll_no}` : 'Anonymous'}</span>
                <button onClick={() => handleLike(msg.id)} style={{ 
                  background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold'
                }}>
                  <span style={{ transform: 'scale(1.2)' }}>❤️</span> {msg.likes || 0}
                </button>
              </div>
            </div>
          ))}
          {messages.length === 0 && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', width: '100%' }}>The wall is empty. Be the first to leave a message!</p>}
        </div>
      )}
    </section>
  );
};

export default Messages;

