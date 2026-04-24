import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Load environment variables directly from .env file
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const run = async () => {
  console.log("🚀 Starting Automatic Database Sync...");

  // 1. Process Students (Legends)
  console.log("Scanning /public/images/Class_members for Students...");
  if (fs.existsSync('./public/images/Class_members')) {
    const studentFiles = fs.readdirSync('./public/images/Class_members').filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
    const newStudents = studentFiles.map(file => {
      const id = file.split('.')[0]; // e.g. "23331A4201"
      return { id, name: id, image: `/images/Class_members/${file}` };
    });

    if (newStudents.length > 0) {
      const { error } = await supabase.from('students').upsert(newStudents, { onConflict: 'id' });
      if (error) console.error("❌ Error uploading students:", error.message);
      else console.log(`✅ Successfully uploaded/updated ${newStudents.length} Students!`);
    }
  } else {
    console.log("⚠️ Folder /public/images/Class_members not found. Skipping students.");
  }

  // 2. Process Mentors
  console.log("Scanning /public/images/Mentors for Mentors...");
  if (fs.existsSync('./public/images/Mentors')) {
    const mentorFiles = fs.readdirSync('./public/images/Mentors').filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
    const newMentors = mentorFiles.map(file => {
      const name = file.split('.')[0];
      return { name, role: 'Mentor', image: `/images/Mentors/${file}` };
    });

    if (newMentors.length > 0) {
      await supabase.from('mentors').delete().neq('name', '0');
      const { error } = await supabase.from('mentors').insert(newMentors);
      if (error) console.error("❌ Error uploading mentors:", error.message);
      else console.log(`✅ Successfully uploaded/updated ${newMentors.length} Mentors!`);
    }
  } else {
    console.log("⚠️ Folder /public/images/Mentors not found. Skipping mentors.");
  }

  // 3. Process Gallery (Memory Lane)
  console.log("Scanning /public/images/Memory_Lane for Gallery...");
  if (fs.existsSync('./public/images/Memory_Lane')) {
    const galleryFiles = fs.readdirSync('./public/images/Memory_Lane').filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
    const newGallery = galleryFiles.map((file, idx) => {
      return {
        image_url: `/images/Memory_Lane/${file}`,
        created_at: new Date(Date.now() - idx * 1000).toISOString(),
        type: file.includes('IMG_6179.jpg') ? 'fixed' : 'golden'
      };
    });

    if (newGallery.length > 0) {
      await supabase.from('gallery').delete().neq('image_url', '0');
      const { error } = await supabase.from('gallery').insert(newGallery);
      if (error) console.error("❌ Error uploading gallery:", error.message);
      else console.log(`✅ Successfully uploaded/updated ${newGallery.length} Memory Lane photos!`);
    }
  } else {
    console.log("⚠️ Folder /public/images/Memory_Lane not found. Skipping gallery.");
  }

  console.log("🎉 Database Sync Complete! Please refresh your website.");
};

run();
