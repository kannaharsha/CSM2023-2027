import React from 'react';

const Journey = () => {
  const milestones = [
    { year: "Year 1", title: "The Beginning", desc: "Fresh faces, new campus, infinite possibilities. We wrote our first 'Hello World'." },
    { year: "Year 2", title: "The Grind", desc: "Core subjects, countless assignments, and the realization that engineering is tough but we are tougher." },
    { year: "Year 3", title: "The Hustle", desc: "Projects, internships, and finding our true passions. The bond grew stronger." },
    { year: "Year 4", title: "The Legacy", desc: "Placements, final year projects, and preparing to leave the nest. Memories that last forever." }
  ];

  return (
    <section id="journey" style={{ position: 'relative' }}>
      <h2 className="section-title text-gradient reveal">The Voyage</h2>
      <p className="section-subtitle reveal">Four levels of our epic campaign.</p>
      
      <div style={{ maxWidth: '900px', width: '100%', position: 'relative', margin: '0 auto', padding: '2rem 0' }}>
        {/* Glowing center line */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--primary), var(--secondary), var(--accent))', zIndex: 0, borderRadius: '2px', boxShadow: '0 0 15px var(--primary)' }}></div>
        
        {milestones.map((item, idx) => (
          <div key={idx} className="reveal" style={{ 
            display: 'flex', 
            justifyContent: idx % 2 === 0 ? 'flex-start' : 'flex-end',
            marginBottom: '4rem',
            position: 'relative',
            zIndex: 1,
            width: '100%'
          }}>
            {/* Glowing dot on the line */}
            <div style={{ 
              position: 'absolute', top: '20px', left: '50%', transform: 'translate(-50%, 0)',
              width: '20px', height: '20px', background: 'var(--bg-color)', border: '4px solid #fff', borderRadius: '50%',
              boxShadow: '0 0 10px #fff', zIndex: 2
            }}></div>

            <div className="glass-panel" style={{ 
              width: '42%', 
              background: 'rgba(10,10,15,0.8)',
              borderLeft: idx % 2 === 0 ? 'none' : '4px solid var(--secondary)',
              borderRight: idx % 2 === 0 ? '4px solid var(--primary)' : 'none',
              transform: 'perspective(1000px) rotateY(0deg)',
              transition: 'transform 0.5s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = `perspective(1000px) rotateY(${idx % 2 === 0 ? '-5deg' : '5deg'}) scale(1.05)`}
            onMouseOut={(e) => e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) scale(1)'}
            >
              <span style={{ fontFamily: 'var(--font-mono)', color: idx % 2 === 0 ? 'var(--primary)' : 'var(--secondary)', fontSize: '1.2rem', fontWeight: 'bold' }}>{item.year}</span>
              <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0', color: '#fff' }}>{item.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Journey;
