import React, { useState, useEffect } from 'react';
import { localDB } from '../lib/localDB';

const Gallery = () => {
  const defaultImages = [
    '/images/Class_members/23331A4201.jpeg',
    '/images/Class_members/23331A4202.jpeg',
    '/images/Class_members/23331A4203.jpeg',
    '/images/Class_members/23331A4204.jpg',
    '/images/Class_members/23331A4205.jpeg',
    '/images/Class_members/23331A4206.jpeg',
    '/images/Class_members/23331A4207.jpg',
    '/images/Class_members/23331A4208.png',
    '/images/Class_members/23331A4209.png',
    '/images/Class_members/23331A4210.jpeg',
    '/images/Class_members/23331A4211.jpeg',
    '/images/Class_members/23331A4212.jpeg'
  ];

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    const { data, error } = await localDB
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const dbImages = data.map(item => item.image_url);
      setImages([...defaultImages, ...dbImages]);
    } else {
      setImages(defaultImages);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. In a real app, you'd upload to Supabase Storage first
    // For now, we'll convert to Base64 and store in DB (for smaller images)
    // NOTE: It's better to use Supabase Storage for larger files.
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const base64String = canvas.toDataURL('image/jpeg', 0.7);

        // Save to Database
        const { data, error } = await localDB
          .from('gallery')
          .insert([{ image_url: base64String, caption: 'New Memory' }])
          .select();

        if (!error && data) {
          setImages([...defaultImages, data[0].image_url, ...images.slice(defaultImages.length)]);
        } else {
          console.error("Supabase Error:", error);
          alert("Failed to save memory to database.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <section id="gallery">
      <h2 className="section-title text-gradient reveal">Memory Lane</h2>
      <p className="section-subtitle reveal">A visual journey through our best moments. Add your own memories to the wall!</p>
      
      <div className="reveal" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'center' }}>
        <label className="btn primary" style={{ cursor: 'pointer', padding: '1rem 2rem' }}>
          + Add Memory
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {loading ? (
         <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Developing photos...</p>
         </div>
      ) : (
        <div className="grid-container gallery-grid">
          {images.map((imgSrc, idx) => (
            <div key={idx} className="reveal float" style={{ animationDelay: `${(idx % 4) * 0.1}s` }}>
              <div className="glass-panel" style={{ 
                padding: '1rem', 
                background: '#fff', 
                borderRadius: '8px',
                transform: `rotate(${Math.random() * 6 - 3}deg)`,
                transition: 'transform 0.4s ease',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(0deg)'}
              onMouseOut={(e) => e.currentTarget.style.transform = `rotate(${Math.random() * 6 - 3}deg)`}
              >
                <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#000' }}>
                  <img src={imgSrc} alt={`Memory ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
                <div style={{ padding: '1rem 0 0.5rem 0', textAlign: 'center', color: '#333', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  {idx < defaultImages.length ? 'Classic Memory' : 'Added by Batchmate'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Gallery;

