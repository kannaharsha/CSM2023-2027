import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Journey from './components/Journey';
import Legend from './components/Legend';
import Messages from './components/Messages';
import Conference from './components/Conference';
import Gallery from './components/Gallery';
import BatchAwards from './components/BatchAwards';
import Mentors from './components/Mentors';
import Outro from './components/Outro';
import GiftPreloader from './components/GiftPreloader';

const Particles = () => {
  const particles = Array.from({ length: 30 });
  const floatingItems = ['❤️', '✨', '⭐', '💖', '💫'];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          color: 'var(--accent)',
          fontSize: `${Math.random() * 15 + 10}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: 0.25,
          animation: `floatUp ${Math.random() * 10 + 10}s infinite linear`,
          animationDelay: `${Math.random() * 10}s`
        }}>
          {floatingItems[Math.floor(Math.random() * floatingItems.length)]}
        </div>
      ))}
    </div>
  );
};

function App() {
  const [hasOpenedGift, setHasOpenedGift] = React.useState(false);

  useEffect(() => {
    if (!hasOpenedGift) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const observeElements = () => {
      const reveals = document.querySelectorAll('.reveal:not(.active)');
      reveals.forEach(reveal => observer.observe(reveal));
    };

    // Initial observe
    observeElements();

    // Re-observe periodically or on DOM changes for dynamic content like Gallery
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [hasOpenedGift]);

  return (
    <>
      {!hasOpenedGift && <GiftPreloader onOpen={() => setHasOpenedGift(true)} />}
      
      <div style={{ opacity: hasOpenedGift ? 1 : 0, transition: 'opacity 1s ease', visibility: hasOpenedGift ? 'visible' : 'hidden' }}>
        <Particles />
        <div className="bg-mesh"></div>
        <div className="bg-grid"></div>
        <Navbar />
        <Home />
        <About />
        <Journey />
        <Legend />
        <Messages />
        <Conference />
        <BatchAwards />
        <Gallery />
        <Mentors />
        <Outro />
      </div>
    </>
  );
}

export default App;
