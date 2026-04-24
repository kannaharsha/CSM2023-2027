import React, { useState, useEffect, useRef } from 'react';
import { localDB } from '../lib/localDB';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  // Helper to shuffle an array
  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 600 : window.innerWidth * 0.85; 
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    
    // 1. Get Local Images (Baseline)
    const localImages = [
      "20260313_183031.jpg", "20260314_153741.jpg", "20260314_153835.jpg", "20260314_175406.jpg",
      "IMG-20231014-WA0001.jpg", "IMG-20231014-WA0003.jpg", "IMG-20231014-WA0078.jpg", "IMG-20231130-WA0014.jpg",
      "IMG-20240210-WA0021.jpg", "IMG-20240430-WA0189.jpg", "IMG-20240430-WA0328.jpg", "IMG-20240920-WA0006.jpg",
      "IMG-20240920-WA0078.jpg", "IMG-20240921-WA0040.jpg", "IMG-20240921-WA0081.jpg", "IMG-20240921-WA0095.jpg",
      "IMG-20240921-WA0108.jpg", "IMG-20240921-WA0116.jpg", "IMG-20240922-WA0013.jpg", "IMG-20240922-WA0017.jpg",
      "IMG-20241231-WA0003.jpg", "IMG-20250301-WA0253.jpg", "IMG-20250302-WA0013.jpg", "IMG-20260312-WA0014.jpg",
      "IMG-20260314-WA0328.jpg", "IMG-20260315-WA0096.jpg", "IMG-20260315-WA0121.jpg", "IMG-20260315-WA0151.jpg",
      "IMG-20260315-WA0155.jpg", "IMG-20260315-WA0158.jpg", "IMG-20260315-WA0168.jpg", "IMG-20260315-WA0169.jpg",
      "IMG_20231121_131746_649.jpg", "IMG_20231121_131750_542.jpg", "IMG_20250726_162133069_HDR_AE.jpg",
      "IMG_20260312_115949055~2.jpg", "IMG_2443.jpg", "IMG_6179.jpg"
    ].map(name => `/images/Memory_Lane/${name}`);

    // 2. Fetch from Database
    const { data, error } = await localDB.from('gallery').select('*');
    
    if (data && data.length > 0) {
      // Get DB images
      const uploaded = data.filter(d => d.type === 'uploaded').sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).map(d => d.image_url);
      const dbFixedAndGolden = data.filter(d => d.type !== 'uploaded').map(d => d.image_url);
      
      // Combine and remove duplicates using a Set
      const allOtherImages = [...new Set([...dbFixedAndGolden, ...localImages])];
      
      setImages([...uploaded, ...shuffle(allOtherImages)]);
    } else {
      setImages(shuffle(localImages));
    }
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    
    // 1. Upload to Supabase Storage Bucket 'memories'
    const fileName = `${Date.now()}-${file.name}`;
    const { data: storageData, error: storageError } = await localDB.storage
      .from('memories')
      .upload(fileName, file);

    if (storageError) {
      alert("Storage Error: " + storageError.message + "\n\n(Make sure you have created a PUBLIC bucket named 'memories' in Supabase!)");
      setLoading(false);
      return;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = localDB.storage
      .from('memories')
      .getPublicUrl(fileName);

    // 3. Save reference to Database
    const { error: dbError } = await localDB.from('gallery').insert([{ 
      image_url: publicUrl,
      type: 'uploaded'
    }]);

    if (!dbError) {
      alert("✅ Memory successfully saved to cloud storage!");
      fetchGallery();
    } else {
      alert("Database Error: " + dbError.message + "\n\n(Memory uploaded to storage, but failed to save to table!)");
    }
    
    setLoading(false);
  };

  return (
    <section id="gallery">
      <h2 className="section-title text-gradient reveal">Memory Lane</h2>
      <p className="section-subtitle reveal">A visual journey through our best moments. Add your own memories to the wall!</p>
      
      <div className="reveal active" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ 
          marginBottom: '1rem', 
          fontSize: '1.2rem', 
          fontFamily: 'var(--font-mono)', 
          color: 'var(--secondary)',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>📸</span>
          <span>{images.length} Captured Moments</span>
        </div>
        
        <label className="btn primary" style={{ cursor: 'pointer', padding: '1rem 3rem', fontSize: '1.1rem' }}>
          + Add Your Memory
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
                    {idx === 0 ? 'Golden Memory ✨' : 'Batchmate Memory 📸'}
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

