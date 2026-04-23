import React from 'react';
import { mentors } from '../data/students';

const Mentors = () => {
  return (
    <section id="mentors">
      <h2 className="section-title text-gradient reveal">Our Mentors</h2>
      <p className="reveal" style={{ textAlign: 'center', marginBottom: '3rem', color: 'rgba(255,255,255,0.7)' }}>
        Guiding us towards a brighter future.
      </p>

      <div className="grid-container mentor-grid">
        {mentors.map((mentor, idx) => (
          <div key={idx} className="reveal glass-panel" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="avatar-wrapper" style={{ width: '100px', height: '100px', minWidth: '100px', minHeight: '100px', marginBottom: '1.5rem', border: '3px solid var(--primary)' }}>
              <img src={mentor.image} alt={mentor.name} />
            </div>
            <h3 style={{ color: 'var(--secondary)' }}>{mentor.name}</h3>
            <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{mentor.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Mentors;
