import React, { useState, useEffect } from 'react';
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
  const [students, setStudents] = useState([]);

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

    fetchStudents();
    fetchVotes();
  }, []);

  const fetchStudents = async () => {
    const { data } = await localDB.from('students').select('*');
    if (data) setStudents(data);
  };

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

  const handleVote = (category, studentId) => {
    if (!studentId) return;
    
    // Only update local state for immediate feedback
    const newMyVotes = { ...myVotes, [category]: studentId };
    setMyVotes(newMyVotes);
    localStorage.setItem('my_batch_votes', JSON.stringify(newMyVotes));
  };

  const submitAllVotes = async () => {
    setLoading(true);
    
    let hasError = false;
    let errorMessage = '';

    // Insert all current votes into Supabase
    for (const [category, studentId] of Object.entries(myVotes)) {
      const { error } = await localDB
        .from('votes')
        .upsert({ 
          category, 
          student_id: studentId, 
          voter_id: voterId 
        }, { onConflict: 'category,voter_id' });

      if (error) {
        hasError = true;
        errorMessage = error.message;
      }
    }

    if (hasError) {
      alert("Error saving your votes: " + errorMessage + "\n\n(If it says RLS violated, please disable Row Level Security for 'votes' in Supabase!)");
    } else {
      alert("✅ All your votes have been successfully submitted!");
      fetchVotes(); // Refresh leaderboard
    }
    setLoading(false);
  };

  const getTopResults = (category) => {
    if (!votes[category]) return [];
    const sorted = Object.entries(votes[category]).sort((a, b) => b[1] - a[1]);
    
    // Slice to top 1 as requested
    const top1 = sorted.slice(0, 1);
    
    return top1.map(([id, count]) => {
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
            className="btn primary float results-toggle-btn" 
            onClick={() => setShowResults(!showResults)}
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
                
                <h3 className="award-card-title">{category}</h3>
                
                <div className="award-results-container">
                  {/* Your Vote Summary (Top) */}
                  <div className="your-vote-header">
                    <p className="mini-label">Your Vote</p>
                    {mySelectedStudent ? (
                      <div className="mini-vote-badge pop-in">
                        <div className="mini-avatar">
                          <img src={mySelectedStudent.image} alt={mySelectedStudent.name} />
                        </div>
                        <span className="mini-name">{mySelectedStudent.name}</span>
                      </div>
                    ) : (
                      <span className="none-text">None selected</span>
                    )}
                  </div>

                  {/* Leaderboard section (Only shown when results are requested) */}
                  {showResults && (
                    <div className="leaderboard-section pop-in">
                      <p className="mini-label">Current Winner 👑</p>
                      
                      {topResults.length > 0 ? (
                        <div className="winner-card pop-in">
                          {topResults.map((result, i) => (
                            <div key={i} className="leaderboard-item winner pop-in">
                              <div className="item-left">
                                <div className="item-avatar winner-avatar">
                                  <img src={result.image} alt={result.name} />
                                </div>
                                <div className="item-info">
                                  <div className="item-name winner-name">{result.name}</div>
                                  <div className="item-id">#{result.id}</div>
                                </div>
                              </div>
                              <div className="vote-count winner-count">
                                {result.count} <span className="vote-text">votes</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-votes-placeholder">No votes yet</div>
                      )}
                    </div>
                  )}
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

      {!loading && !showResults && Object.keys(myVotes).length > 0 && (
        <div className="reveal active" style={{ textAlign: 'center', marginTop: '4rem' }}>
          <button 
            className="btn btn-submit-premium" 
            onClick={submitAllVotes}
            disabled={loading}
          >
            <span className="btn-text">Submit All Votes</span>
            <span className="btn-icon">🚀</span>
            <div className="btn-glow"></div>
          </button>
          <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            Ready to crown the legends?
          </p>
        </div>
      )}
    </section>
  );
};

export default BatchAwards;

