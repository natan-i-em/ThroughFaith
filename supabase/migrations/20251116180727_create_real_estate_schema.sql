/*
  # Real Estate Follow-Up Reporting System Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `role` (text) - 'admin' or 'employee'
      - `is_active` (boolean) - for deactivating accounts
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `follow_up_reports`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references profiles)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `contact_date` (date)
      - `lead_source` (text)
      - `property_interested_in` (text)
      - `follow_up_summary` (text)
      - `next_action` (text)
      - `lead_status` (text) - 'Hot', 'Warm', 'Cold', 'Closed'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Profiles:
      - Users can read their own profile
      - Admins can read all profiles
      - Only admins can update profiles
    - Follow-up Reports:
      - Employees can insert their own reports
      - Employees can read only their own reports
      - Admins can read all reports
      - NO ONE can update or delete reports (write-once)

  3. Important Notes
    - Reports are write-once: employees cannot edit after submission
    - Admins have read-only access to reports (for integrity)
    - Role-based access control enforced at database level
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'employee')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create follow_up_reports table
CREATE TABLE IF NOT EXISTS follow_up_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  contact_date date NOT NULL,
  lead_source text NOT NULL,
  property_interested_in text NOT NULL,
  follow_up_summary text NOT NULL,
  next_action text NOT NULL,
  lead_status text NOT NULL CHECK (lead_status IN ('Hot', 'Warm', 'Cold', 'Closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

-- Follow-up reports policies
CREATE POLICY "Employees can insert own reports"
  ON follow_up_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Employees can read own reports"
  ON follow_up_reports FOR SELECT
  TO authenticated
  USING (
    auth.uid() = employee_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follow_up_reports_employee_id ON follow_up_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_reports_lead_status ON follow_up_reports(lead_status);
CREATE INDEX IF NOT EXISTS idx_follow_up_reports_contact_date ON follow_up_reports(contact_date);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'employee')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();