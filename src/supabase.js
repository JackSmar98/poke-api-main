// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ekqjhntuqjnfwyxcwvqs.supabase.co/'; // [cite: 25]
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcWpobnR1cWpuZnd5eGN3dnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MTcxNjcsImV4cCI6MjA2Mjk5MzE2N30.xnyA1n-4MBXFkcNY08QK1AfNoECWphlm51IYQZ6QqZI'; // [cite: 26]

export const supabase = createClient(supabaseUrl, supabaseKey); // [cite: 26]