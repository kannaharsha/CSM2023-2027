import React, { useState, useEffect, useRef } from 'react';

const GiftPreloader = ({ onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [textStep, setTextStep] = useState(0);
  const [score, setScore] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer1 = setTimeout(() => setTextStep(1), 2500);
    const timer2 = setTimeout(() => setTextStep(2), 5000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  useEffect(() => {
    if (textStep === 2 && score < 3) {
      const interval = setInterval(() => {
        setTargetPos({
          x: Math.random() * 200 - 100,
          y: Math.random() * 150 - 75
        });
      }, 900); // Moves every 900ms
      return () => clearInterval(interval);
    }
  }, [textStep, score]);

  const handleTargetClick = () => {
    if (score < 3) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= 3) {
        setIsOpening(true);
        setTimeout(() => {
          onOpen();
        }, 1200); 
      }
    }
  };

  const floatingItems = ['❤️', '✨', '⭐', '💖', '💫'];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      background: 'radial-gradient(circle at center, #1a1025 0%, #020204 100%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'opacity 1s ease, transform 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      opacity: isOpening ? 0 : 1,
      transform: isOpening ? 'scale(2)' : 'scale(1)',
      pointerEvents: isOpening ? 'none' : 'all',
      overflow: 'hidden'
    }}>
      
      {/* Floating Animations */}
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          color: 'var(--accent)',
          fontSize: `${Math.random() * 20 + 10}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: 0.4,
          animation: `floatUp ${Math.random() * 5 + 5}s infinite linear`,
          animationDelay: `${Math.random() * 5}s`
        }}>
          {floatingItems[Math.floor(Math.random() * floatingItems.length)]}
        </div>
      ))}

      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)', filter: 'blur(50px)', animation: 'pulse-bg 3s infinite alternate' }}></div>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '600px', padding: '0 2rem' }}>
        
        <div style={{ height: '80px', marginBottom: '1rem' }}>
          <p style={{ 
            fontSize: '1.4rem', color: '#e2e8f0', fontStyle: 'italic', fontFamily: 'var(--font-display)',
            opacity: textStep === 0 ? 1 : 0, transition: 'opacity 1s ease', position: 'absolute', width: '100%', left: 0
          }}>
            "Four years. A thousand memories..."
          </p>
          <p style={{ 
            fontSize: '1.4rem', color: '#e2e8f0', fontStyle: 'italic', fontFamily: 'var(--font-display)',
            opacity: textStep === 1 ? 1 : 0, transition: 'opacity 1s ease', position: 'absolute', width: '100%', left: 0
          }}>
            "Countless laughs and endless nights..."
          </p>
          <p style={{ 
            fontSize: '1.6rem', color: 'var(--secondary)', fontWeight: 'bold', fontFamily: 'var(--font-display)',
            opacity: textStep === 2 ? 1 : 0, transition: 'opacity 1s ease', position: 'absolute', width: '100%', left: 0
          }}>
            One unforgettable journey.
          </p>
        </div>
        
        {/* Game Area */}
        <div style={{ position: 'relative', width: '300px', height: '200px', margin: '0 auto' }}>
          {textStep === 2 && score < 3 && (
            <div 
              onClick={handleTargetClick}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: `translate(calc(-50% + ${targetPos.x}px), calc(-50% + ${targetPos.y}px))`,
                transition: 'transform 0.4s ease-out',
                fontSize: '5rem',
                cursor: 'pointer',
                filter: 'drop-shadow(0 0 20px var(--primary))',
                zIndex: 10,
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #fff, var(--secondary), var(--primary))',
                boxShadow: '0 0 20px var(--primary), 0 0 40px var(--secondary)',
                animation: 'pulse-bg 1s infinite alternate'
              }}></div>
            </div>
          )}
          {score >= 3 && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(2)', fontSize: '5rem', transition: 'transform 0.5s ease', opacity: isOpening ? 0 : 1 }}>
              ✨
            </div>
          )}
        </div>
        
        <p style={{ 
          marginTop: '1rem', fontSize: '1.2rem', color: 'var(--primary)', letterSpacing: '2px', 
          textTransform: 'uppercase', fontWeight: 'bold', opacity: textStep === 2 ? 1 : 0, transition: 'opacity 1s ease' 
        }}>
          {score < 3 ? `Catch the glowing orb to unlock! (${score}/3)` : "Unlocked!"}
        </p>
      </div>

    </div>
  );
};

export default GiftPreloader;
