import { createClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    supabase: typeof supabase;
  }
}


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

window.supabase = supabase;
export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'employee';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FollowUpReport = {
  id: string;
  employee_id: string;
  customer_name: string;
  customer_phone: string;
  contact_date: string;
  lead_source: string;
  property_interested_in: string;
  follow_up_summary: string;
  next_action: string;
  lead_status: 'Hot' | 'Warm' | 'Cold' | 'Closed';
  created_at: string;
  updated_at: string;
};

export type ReportWithEmployee = FollowUpReport & {
  employee: {
    full_name: string;
    email: string;
  };
};
