import React, { useState, useEffect } from 'react';
import { localDB } from '../lib/localDB';

const Conference = () => {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [animatingId, setAnimatingId] = useState(null);

  useEffect(() => {
    fetchConfessions();
  }, []);

  const fetchConfessions = async () => {
    setLoading(true);
    const { data, error } = await localDB
      .from('confessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setConfessions(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;
    
    const { data, error } = await localDB
      .from('confessions')
      .insert([{ 
        message: text 
      }])
      .select();

    if (!error && data) {
      const newConfession = data[0];
      setConfessions([newConfession, ...confessions]);
      setText('');
      setAnimatingId(newConfession.id);
      setTimeout(() => setAnimatingId(null), 1000);
    } else if (error) {
      alert("Error dropping confession: " + error.message + "\n\n(If it says RLS violated, please disable Row Level Security for 'confessions' in Supabase!)");
    }
  };

  return (
    <section id="conference">
      <h2 className="section-title text-gradient reveal">Anonymous Confessions</h2>
      <p className="reveal" style={{ textAlign: 'center', marginBottom: '3rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>
        Say what you never could — entirely anonymously. Keep it fun, keep it respectful! 🤫
      </p>

      <div className="glass-panel reveal float-delayed" style={{ width: '100%', maxWidth: '600px', marginBottom: '4rem', border: '2px solid rgba(6, 182, 212, 0.3)' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea 
              className="form-control" 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              rows="4" 
              placeholder="I always thought that..." 
              required
              style={{ fontSize: '1.1rem', backgroundColor: 'rgba(0,0,0,0.5)' }}
            ></textarea>
          </div>
          <button type="submit" className="btn" style={{ width: '100%', background: 'linear-gradient(45deg, #111, #333)', color: 'var(--secondary)', border: '1px solid var(--secondary)' }}>Drop Confession</button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
           <p style={{ color: 'rgba(255,255,255,0.5)' }}>Shhh... loading secrets...</p>
        </div>
      ) : (
        <div className="grid-container" style={{ width: '100%' }}>
          {confessions.map(c => (
            <div key={c.id} className={`glass-panel ${c.id === animatingId ? 'pop-in' : 'reveal active'}`} style={{ 
              background: 'rgba(10, 10, 15, 0.8)', 
              borderLeft: '4px solid var(--secondary)',
              boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
            }}>
              <p style={{ fontFamily: 'monospace', fontSize: '1.2rem', marginBottom: '1.5rem', color: '#e0e0e0' }}>"{c.message}"</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', textAlign: 'right', fontWeight: 'bold' }}>
                {new Date(c.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {confessions.length === 0 && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', gridColumn: '1/-1' }}>No confessions yet. Be brave!</p>}
        </div>
      )}
    </section>
  );
};

export default Conference;

