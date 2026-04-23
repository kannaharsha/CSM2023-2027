import React, { useState, useEffect } from 'react';
import { students } from '../data/students';
import { localDB } from '../lib/localDB';

const BatchAwards = () => {
  const categories = [
    "Most Likely to Become Famous 🌟", "Class Clown 🤡", "Most Athletic 🏃‍♂️", 
    "Biggest Dreamer 💭", "Most Creative 🎨", "Future CEO 💼", 
    "Bookworm 📚", "Tech Genius 💻", "Class Comedian 😂", 
    "Mass Bunk Leader 😎", "Class Crush ❤️", "Most Mysterious 🤐"
  ];

  const [votes, setVotes] = useState({});
  const [myVotes, setMyVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [voterId, setVoterId] = useState('');

  useEffect(() => {
    // Initialize Voter ID
    let vid = localStorage.getItem('voter_id');
    if (!vid) {
      vid = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('voter_id', vid);
    }
    setVoterId(vid);

    // Load user's local choices
    const savedMyVotes = JSON.parse(localStorage.getItem('my_batch_votes')) || {};
    setMyVotes(savedMyVotes);

    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    setLoading(true);
    const { data, error } = await localDB
      .from('votes')
      .select('*');

    if (!error && data) {
      // Aggregate votes: { category: { studentId: count } }
      const aggregated = data.reduce((acc, vote) => {
        if (!acc[vote.category]) acc[vote.category] = {};
        if (!acc[vote.category][vote.student_id]) acc[vote.category][vote.student_id] = 0;
        acc[vote.category][vote.student_id] += 1;
        return acc;
      }, {});
      setVotes(aggregated);
    }
    setLoading(false);
  };

  const handleVote = async (category, studentId) => {
    if (!studentId) return;
    
    // Update local state for immediate feedback
    const newMyVotes = { ...myVotes, [category]: studentId };
    setMyVotes(newMyVotes);
    localStorage.setItem('my_batch_votes', JSON.stringify(newMyVotes));

    // Update Supabase
    // We try to delete existing vote for this user in this category first (if we had voter_id)
    // For simplicity, we just insert. If we want unique votes per user, we need a unique constraint in DB.
    
    // Note: The schema.sql I provided has a UNIQUE(category, voter_id) constraint.
    // So we should use upsert or delete then insert.
    
    const { error } = await localDB
      .from('votes')
      .upsert({ 
        category, 
        student_id: studentId, 
        voter_id: voterId 
      }, { onConflict: 'category,voter_id' });

    if (!error) {
      fetchVotes();
    }
  };

  const getWinner = (category) => {
    if (!votes[category]) return null;
    let max = 0;
    let winnerId = null;
    for (const [id, count] of Object.entries(votes[category])) {
      if (count > max) {
        max = count;
        winnerId = id;
      }
    }
    if (max === 0 || !winnerId) return null;
    const winner = students.find(s => s.id === winnerId);
    return winner ? { ...winner, count: max } : null;
  };

  const getStudent = (id) => students.find(s => s.id === id);

  return (
    <section id="awards">
      <h2 className="section-title text-gradient reveal">Batch Awards</h2>
      <p className="section-subtitle reveal">Vote for your friends and see the live leaderboard! 🏆</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Counting votes...</p>
        </div>
      ) : (
        <div className="grid-container awards-grid">
          {categories.map((category, idx) => {
            const winner = getWinner(category);
            const mySelectedId = myVotes[category];
            const mySelectedStudent = mySelectedId ? getStudent(mySelectedId) : null;

            return (
              <div key={idx} className="glass-panel reveal float" style={{ 
                display: 'flex', flexDirection: 'column', 
                animationDelay: `${(idx % 3) * 0.2}s`,
                borderTop: '3px solid var(--secondary)',
                position: 'relative'
              }}>
                
                <h3 style={{ color: '#fff', textAlign: 'center', fontSize: '1.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>{category}</h3>
                
                <div className="award-flex-container">
                  {/* Current Leader */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 'bold' }}>Current Leader</p>
                    {winner ? (
                      <div className="pop-in">
                        <div className="avatar-wrapper" style={{ width: '75px', height: '75px', minWidth: '75px', minHeight: '75px', border: '2px solid rgba(255,215,0,0.8)', boxShadow: '0 0 10px rgba(255,215,0,0.4)', background: 'rgba(0,0,0,0.3)' }}>
                          <img src={winner.image} alt={winner.name} style={{ borderRadius: '50%' }} />
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#fff' }}>{winner.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'gold' }}>{winner.count} votes</p>
                      </div>
                    ) : (
                      <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>No votes yet</div>
                    )}
                  </div>

                  <div className="award-divider"></div>

                  {/* Your Vote */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Vote</p>
                    {mySelectedStudent ? (
                      <div className="pop-in">
                        <div className="avatar-wrapper" style={{ width: '75px', height: '75px', minWidth: '75px', minHeight: '75px', border: '2px solid var(--primary)', background: 'rgba(0,0,0,0.3)' }}>
                          <img src={mySelectedStudent.image} alt={mySelectedStudent.name} style={{ borderRadius: '50%' }} />
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#fff' }}>{mySelectedStudent.name}</p>
                      </div>
                    ) : (
                      <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>None selected</div>
                    )}
                  </div>
                </div>

                <select 
                  className="form-control" 
                  value={mySelectedId || ""}
                  onChange={(e) => handleVote(category, e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="" disabled>Select your nominee...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BatchAwards;

