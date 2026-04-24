import React, { useState, useMemo, useEffect } from 'react';
import { localDB } from '../lib/localDB';

const Legend = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const { data } = await localDB.from('students').select('*');
      if (data) setStudents(data);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, students]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  
  const currentStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  return (
    <section id="legend">
      <h2 className="section-title text-gradient reveal">The Legends</h2>
      <p className="section-subtitle reveal">The brilliant minds of our batch. Search and explore.</p>

      <div className="reveal" style={{ width: '100%', maxWidth: '600px', marginBottom: '3rem' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search by Name or Roll No..." 
          value={searchTerm}
          onChange={handleSearch}
          style={{ 
            fontSize: '1.1rem', 
            borderRadius: '50px', 
            padding: '1rem 2rem',
            textAlign: 'center',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
          }}
        />
      </div>

      <div className="grid-container legend-grid">
        {currentStudents.map((student, idx) => (
          <div key={student.id} className="glass-panel pop-in" style={{ padding: '1.2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="portrait-wrapper" style={{ marginBottom: '1rem' }}>
              <img src={student.image} alt={student.name} loading="lazy" />
            </div>
            <h4 style={{ color: 'var(--secondary)', fontSize: '1.2rem', marginBottom: '0.2rem', fontFamily: 'var(--font-display)' }}>{student.name}</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>#{student.id}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '2rem', textAlign: 'center' }}>Loading legends from database...</p>
      ) : filteredStudents.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '2rem', textAlign: 'center' }}>No legends found matching your search.</p>
      ) : null}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem', alignItems: 'center' }}>
          <button 
            className="btn" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ padding: '0.5rem 1rem', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Prev
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{currentPage} / {totalPages}</span>
          <button 
            className="btn" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ padding: '0.5rem 1rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default Legend;
