import React, { useState, useEffect } from 'react';
import { students } from '../data/students';
import { localDB } from '../lib/localDB';
import CustomSelect from './CustomSelect';

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
  const [showResults, setShowResults] = useState(false);

  const totalVotes = Object.values(votes).reduce((sum, categoryVotes) => {
    return sum + Object.values(categoryVotes).reduce((a, b) => a + b, 0);
  }, 0);

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

  const getTopResults = (category) => {
    if (!votes[category]) return [];
    const sorted = Object.entries(votes[category]).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([id, count]) => {
      const student = students.find(s => s.id === id);
      return student ? { ...student, count } : null;
    }).filter(Boolean);
  };

  const getStudent = (id) => students.find(s => s.id === id);

  return (
    <section id="awards">
      <h2 className="section-title text-gradient reveal">Batch Awards</h2>
      <p className="section-subtitle reveal">Vote for your friends and see the leaderboard! 🏆</p>

      {!loading && (
        <div className="reveal active" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <button 
            className="btn primary float" 
            onClick={() => setShowResults(!showResults)}
            style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
          >
            {showResults ? 'Hide Leaderboard' : 'Show Voting Results'}
          </button>
          {showResults && (
            <p className="pop-in" style={{ marginTop: '1rem', color: 'var(--secondary)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
              Total Awards Given: {totalVotes}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Counting votes...</p>
        </div>
      ) : (
        <div className="grid-container awards-grid">
          {categories.map((category, idx) => {
            const topResults = getTopResults(category);
            const mySelectedId = myVotes[category];
            const mySelectedStudent = mySelectedId ? getStudent(mySelectedId) : null;

            return (
              <div key={idx} className="glass-panel reveal float" style={{ 
                display: 'flex', flexDirection: 'column', 
                animationDelay: `${(idx % 3) * 0.2}s`,
                borderTop: '3px solid var(--secondary)',
                position: 'relative',
                zIndex: categories.length - idx
              }}>
                
                <h3 style={{ color: '#fff', textAlign: 'center', fontSize: '1.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>{category}</h3>
                
                <div className="award-flex-container">
                  {/* Results section */}
                  <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '130px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      {showResults ? 'Leaderboard' : 'Results'}
                    </p>
                    
                    {!showResults ? (
                      <div className="pop-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                        <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</span>
                        Hidden until revealed
                      </div>
                    ) : topResults.length > 0 ? (
                      <div className="pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                        {topResults.map((res, i) => (
                          <div key={res.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: i === 0 ? 1 : 0.7, fontSize: i === 0 ? '1rem' : '0.85rem' }}>
                            <span style={{ color: i === 0 ? 'gold' : i === 1 ? 'silver' : '#cd7f32' }}>
                              {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                            </span>
                            <span style={{ color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                              {res.name}
                            </span>
                            <span style={{ color: 'var(--secondary)' }}>({res.count})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                        No votes yet
                      </div>
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

                <CustomSelect 
                  options={students.map(s => ({ value: s.id, label: `${s.name} (${s.id})` }))}
                  value={mySelectedId}
                  onChange={(val) => handleVote(category, val)}
                  placeholder="Select your nominee..."
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BatchAwards;

