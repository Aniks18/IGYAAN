import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vfaoqkiwsjtnuukmrkel.supabase.co";
const supabaseAnonKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmYW9xa2l3c2p0bnV1a21ya2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDE2NzUsImV4cCI6MjA3Njg3NzY3NX0.yAcVgYp8cCCIm7dlHYXbETVSbqciXbdSuJiZ6r_MLAs";

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Keep existing callers on the configured project client. The Supabase factory
// requires URL and key arguments, so exporting it directly made createClient() fail.
export const createClient = () => supabase;
