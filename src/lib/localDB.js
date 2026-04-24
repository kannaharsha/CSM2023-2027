import { createClient } from '@supabase/supabase-js';
import { students, mentors } from '../data/students';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Create the real Supabase client
export const localDB = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } }) 
  : {
      from: () => ({
        select: async () => ({ data: [], error: 'Missing Supabase Keys' }),
        insert: async () => ({ data: null, error: 'Missing Supabase Keys' }),
        update: async () => ({ data: null, error: 'Missing Supabase Keys' }),
        upsert: async () => ({ data: null, error: 'Missing Supabase Keys' }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: { message: 'Missing Supabase Keys' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      }
    };

// We keep the glob here so Vite can analyze it statically, using ?url to prevent warnings
const allImageModules = import.meta.glob('/public/images/Memory_Lane/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, query: '?url' });

// Auto-seed function: Run this once when Supabase is connected to populate default data
export const seedDatabase = async () => {
  if (!supabaseUrl || !supabaseKey) return;

  try {
    // 1. Seed Students
    const { data: dbStudents } = await localDB.from('students').select('id').limit(1);
    if (dbStudents && dbStudents.length === 0) {
      console.log("Seeding Students...");
      await localDB.from('students').insert(students);
    }

    // 2. Seed Mentors
    const { data: dbMentors } = await localDB.from('mentors').select('name').limit(1);
    if (dbMentors && dbMentors.length === 0) {
      console.log("Seeding Mentors...");
      await localDB.from('mentors').insert(mentors);
    }

    // 3. Seed Base Gallery Memories
    const { data: dbGallery } = await localDB.from('gallery').select('id').limit(1);
    if (dbGallery && dbGallery.length === 0) {
      console.log("Seeding Memory Lane...");
      const baseMemories = Object.keys(allImageModules).map((path, idx) => {
        const imgPath = path.replace('/public', '');
        return {
          image_url: imgPath,
          created_at: new Date(Date.now() - idx * 1000).toISOString(),
          type: imgPath.includes('IMG_6179.jpg') ? 'fixed' : 'golden'
        };
      });
      
      // Insert in chunks if too large, but 70 items is small enough for one batch
      await localDB.from('gallery').insert(baseMemories);
    }
    
    console.log("Database synced and seeded!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Auto-trigger seeding on load (will safely do nothing if already populated)
seedDatabase();

