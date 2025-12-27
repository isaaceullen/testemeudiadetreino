
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabaseUrl = 'https://mgptmutsjsnlfagnzqew.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ncHRtdXRzanNubGZhZ256cWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3OTA5ODUsImV4cCI6MjA4MjM2Njk4NX0.hAwdv7TYslu08B9cuNmBCXXQcOgBwlGrueRWPsL-Cl4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
