import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key-replace-me",
);

export type Event = {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
  source: string;
  source_url: string;
  significance: number;
  created_at: string;
};
