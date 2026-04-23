import React from 'react';

const Home = () => {
  return (
    <section id="home" style={{ textAlign: 'center', overflow: 'hidden' }}>
      
      {/* Dynamic graphic orb */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0, animation: 'pulse-bg 4s infinite alternate' }}></div>

      <div className="reveal active" style={{ zIndex: 1, position: 'relative' }}>
        <p style={{ fontFamily: 'var(--font-mono)', letterSpacing: '4px', color: 'var(--secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>
          Welcome to the End Game
        </p>
        
        <h1 className="glitch" data-text="CLASS OF 2023 - 2027" style={{ 
          fontSize: 'clamp(3rem, 8vw, 7rem)', 
          lineHeight: '1.1',
          marginBottom: '1rem',
          color: '#fff',
          textShadow: '0 0 20px rgba(255,255,255,0.2)'
        }}>
          CLASS OF 2023 - 2027
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.4rem)', 
          margin: '2rem auto 4rem auto', 
          color: 'rgba(255,255,255,0.7)',
          maxWidth: '600px'
        }}>
          A vivid journey through our best moments. Four years that shaped us, changed us, and made us legendary.
        </p>

        <a href="#journey" className="btn primary float" style={{ textDecoration: 'none', display: 'inline-flex', gap: '0.8rem', padding: '1.2rem 3rem', fontSize: '1.1rem', boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}>
          ENTER THE JOURNEY
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '-150px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
          <span style={{ writingMode: 'vertical-rl', letterSpacing: '4px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>SCROLL</span>
          <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, #fff, transparent)', marginTop: '1rem' }}></div>
        </div>
      </div>
    </section>
  );
};

export default Home;
