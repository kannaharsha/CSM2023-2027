import React, { useState, useEffect, useRef } from 'react';
import { localDB } from '../lib/localDB';

const Gallery = () => {
  // Photos that should always appear first (in exact order)
  const girlPhotos = [
    '/images/Memory_Lane/IMG_6179.jpg',
  ];

  // Automatically detect all images in the Memory_Lane folder!
  // If you add or delete photos in the folder, this will update automatically.
  const allImageModules = import.meta.glob('/public/images/Memory_Lane/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true });
  const allImagesFromFolder = Object.keys(allImageModules).map(path => path.replace('/public', ''));

  // The rest of the images
  const otherPhotos = allImagesFromFolder.filter(img => !girlPhotos.includes(img));

  // Helper to shuffle an array
  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  // Combine them: Girls first (exact order), then the rest (randomized)
  const defaultImages = [
    ...girlPhotos,
    ...shuffle(otherPhotos)
  ];

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 600 : window.innerWidth * 0.85; 
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Clear the local browser database of any uploaded test photos
    localStorage.removeItem('mock_db_gallery');
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
        <div className="memory-lane-wrapper">
          <button 
            className="memory-nav-btn left"
            onClick={() => scroll('left')}
            aria-label="Scroll Left"
          >
            &#10094;
          </button>

          <button 
            className="memory-nav-btn right"
            onClick={() => scroll('right')}
            aria-label="Scroll Right"
          >
            &#10095;
          </button>

          <div className="memory-carousel" ref={carouselRef}>
            {images.map((imgSrc, idx) => (
            <div key={idx} className="reveal float memory-card-wrapper" style={{ animationDelay: `${(idx % 4) * 0.1}s` }}>
              <div className="glass-panel memory-card">
                <div className="memory-img-container">
                  <img src={imgSrc} alt={`Memory ${idx}`} loading="lazy" />
                  {/* Glowing inner shadow overlay */}
                  <div className="memory-img-overlay"></div>
                </div>
                
                <div className="memory-card-footer">
                  <div className="memory-card-title">
                    {idx < defaultImages.length ? 'Golden Memory ✨' : 'Batchmate Memory 📸'}
                  </div>
                  <div className="memory-card-number">
                    Memory #{idx + 1}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;

