import React from 'react';

const About = () => {
  const stories = [
    { title: "Academic Excellence", desc: "Late night study sessions, complex algorithms, and conquering the hardest subjects together.", icon: "✨" },
    { title: "Lifelong Friendships", desc: "From strangers in the first year to a family by the final year. Bonds that will never break.", icon: "🤝" },
    { title: "Future Ready", desc: "Equipped with the knowledge and skills to take on the world and innovate the future.", icon: "🚀" }
  ];

  return (
    <section id="about">
      <h2 className="section-title text-gradient reveal">Our Stories</h2>
      <p className="reveal" style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '4rem', fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>
        These four years were more than just exams and lectures. They were about finding our potential, building a community, and creating a legacy.
      </p>

      <div className="grid-container" style={{ gap: '3rem', maxWidth: '1200px', width: '100%' }}>
        {stories.map((story, idx) => (
          <div key={idx} className="glass-panel reveal" style={{ 
            transitionDelay: `${idx * 0.2}s`, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="float" style={{ 
              fontSize: '3.5rem', 
              marginBottom: '1.5rem',
              background: 'rgba(255,255,255,0.05)',
              width: '100px', height: '100px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(168,85,247,0.3)'
            }}>
              {story.icon}
            </div>
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--secondary)' }}>{story.title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: '1.6' }}>{story.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;
