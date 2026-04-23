import React, { useEffect, useState } from 'react';

const Outro = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('outro');
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2) {
          setTimeout(() => setShowButton(true), 3000);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="outro" style={{ padding: '6rem 2rem 6rem 2rem', textAlign: 'center', display: 'flex', justifyContent: 'center', position: 'relative' }}>
      
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.05) 0%, transparent 40%)', zIndex: 0 }}></div>

      <div className="glass-panel float" style={{ position: 'relative', zIndex: 1, maxWidth: '600px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem', background: 'rgba(10, 10, 15, 0.6)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(15px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        
        <div className="reveal" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '30px', height: '2px', background: 'var(--primary)' }}></div>
          <p style={{ fontSize: '0.9rem', color: 'var(--primary)', letterSpacing: '3px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', margin: 0, fontWeight: 'bold' }}>
            Chapter Closed
          </p>
          <div style={{ width: '30px', height: '2px', background: 'var(--primary)' }}></div>
        </div>

        <h2 className="reveal text-gradient" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: '800', transitionDelay: '0.2s', lineHeight: '1.2' }}>
          Until We Meet Again.
        </h2>
        
        <p className="reveal" style={{ fontSize: '1rem', color: '#e2e8f0', lineHeight: '1.8', transitionDelay: '0.4s' }}>
          From day one confusions to final degree conclusions, we've lived a thousand lives together. The late assignments and endless lectures made us who we are.
        </p>
        
        <div className="reveal" style={{ background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.05), rgba(139, 92, 246, 0.05))', padding: '1.5rem', borderRadius: '12px', borderLeft: '3px solid var(--accent)', transitionDelay: '0.6s' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--secondary)', fontStyle: 'italic', margin: 0, fontFamily: 'var(--font-display)' }}>
            "We survived the exams and the canteen food... we can survive absolutely anything."
          </p>
        </div>
        
        <p className="reveal" style={{ fontSize: '1.1rem', color: '#fff', transitionDelay: '0.8s', fontWeight: 'bold', marginTop: '0.5rem' }}>
          The buildings stay behind, but the bond travels with us forever.<br/>
          <span style={{ color: 'var(--primary)', display: 'inline-block', marginTop: '0.5rem', fontSize: '1.2rem' }}>Farewell, Class of 2023-2027. 🚀</span>
        </p>

        <div style={{ opacity: showButton ? 1 : 0, transform: showButton ? 'translateY(0)' : 'translateY(20px)', transition: 'all 1s ease', marginTop: '1.5rem' }}>
          <button className="btn primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ fontSize: '0.85rem', padding: '0.8rem 2rem' }}>
            BACK TO TOP
          </button>
        </div>

      </div>
    </section>
  );
};

export default Outro;
