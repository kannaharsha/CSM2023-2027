import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [active, setActive] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section');
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 150) {
          current = section.getAttribute('id');
        }
      });
      setActive(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', name: 'Home' },
    { id: 'journey', name: 'Journey' },
    { id: 'legend', name: 'Legends' },
    { id: 'messages', name: 'Wall' },
    { id: 'awards', name: 'Awards' },
    { id: 'gallery', name: 'Memory Lane' },
    { id: 'outro', name: 'Farewell' }
  ];

  return (
    <>
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <div className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div className={`navbar-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <nav className="navbar">
          {navItems.map((item) => (
            <a 
              key={item.id} 
              href={`#${item.id}`} 
              className={`nav-link ${active === item.id ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Navbar;
