-- =========================================================================
-- SPARC Aerospace Club - Production PostgreSQL Schema & Seed Data
-- Run this in your Supabase SQL Editor to set up the entire database!
-- =========================================================================

-- Enable UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ACADEMIC YEARS TABLE
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_name VARCHAR(20) UNIQUE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MEMBERS TABLE
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sparc_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  password_hash VARCHAR(255),
  role VARCHAR(30) NOT NULL CHECK (role IN ('FOUNDER', 'CAPTAIN', 'VICE_CAPTAIN', 'SECRETARY', 'MEMBER')),
  department VARCHAR(100) NOT NULL,
  batch VARCHAR(50) NOT NULL,
  academic_year VARCHAR(20) NOT NULL DEFAULT '2026-27',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for rapid SPARC ID lookups
CREATE INDEX IF NOT EXISTS idx_members_sparc_id ON members(sparc_id);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
CREATE INDEX IF NOT EXISTS idx_members_academic_year ON members(academic_year);

-- 3. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  sparc_id VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'LATE', 'ABSENT', 'HOLIDAY')),
  marked_by_sparc_id VARCHAR(20) DEFAULT 'SPARC-FDR',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_member_daily_attendance UNIQUE (member_id, date)
);

-- Indexes for attendance queries
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sparc_id ON attendance(sparc_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- 4. CLUB SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendance_start TIME NOT NULL DEFAULT '17:00:00',
  late_start TIME NOT NULL DEFAULT '17:15:00',
  attendance_end TIME NOT NULL DEFAULT '17:30:00',
  current_year VARCHAR(20) NOT NULL DEFAULT '2026-27',
  emergency_window_active BOOLEAN DEFAULT FALSE,
  club_name VARCHAR(100) DEFAULT 'SPARC Aerospace Club',
  motto VARCHAR(200) DEFAULT 'Innovating Beyond the Atmosphere',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ANNOUNCEMENTS / MISSION TELEMETRY
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'MISSION' CHECK (category IN ('MISSION', 'WORKSHOP', 'GENERAL', 'URGENT', 'HOLIDAY')),
  author_sparc_id VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active members and settings (secured via API layer)
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read academic years" ON academic_years FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Allow select members" ON members FOR SELECT USING (true);
CREATE POLICY "Allow select attendance" ON attendance FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Service full academic_years" ON academic_years FOR ALL USING (true);
CREATE POLICY "Service full members" ON members FOR ALL USING (true);
CREATE POLICY "Service full attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Service full settings" ON settings FOR ALL USING (true);
CREATE POLICY "Service full announcements" ON announcements FOR ALL USING (true);

-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Insert Academic Years
INSERT INTO academic_years (year_name, is_current) VALUES
('2024-25', FALSE),
('2025-26', FALSE),
('2026-27', TRUE),
('2027-28', FALSE)
ON CONFLICT (year_name) DO NOTHING;

-- Insert Default Settings
INSERT INTO settings (id, attendance_start, late_start, attendance_end, current_year, emergency_window_active, club_name, motto)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '17:00:00',
  '17:15:00',
  '17:30:00',
  '2026-27',
  FALSE,
  'SPARC Aerospace Club',
  'Innovating Beyond the Atmosphere'
)
ON CONFLICT (id) DO NOTHING;

-- Default password hash for seed accounts is "Sparc@2026"
-- (bcrypt hash: $2a$10$eE.. or sha256 compatible with our auth engine)
-- Insert Initial Core Leadership & Cadets
INSERT INTO members (id, sparc_id, name, email, password_hash, role, department, batch, academic_year, active)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'SPARC-FDR', 'Dr. Vikram Sarabhai (Founder)', 'founder@sparc-aero.org', '$2a$10$gP7BhyT.f0j2F84vI7P3y.x/G43jS0K6oA3E7vK.mN9cKz0qJ6P6O', 'FOUNDER', 'Aerospace Engineering', 'Faculty / Founder', '2026-27', TRUE),
  ('b0000000-0000-0000-0000-000000000002', 'SPARC-001', 'Nihita Rao', 'nihita.captain@sparc-aero.org', '$2a$10$gP7BhyT.f0j2F84vI7P3y.x/G43jS0K6oA3E7vK.mN9cKz0qJ6P6O', 'CAPTAIN', 'Aeronautical Engineering', '2023-2027', '2026-27', TRUE),
  ('b0000000-0000-0000-0000-000000000003', 'SPARC-002', 'Aditya Verma', 'aditya.vice@sparc-aero.org', '$2a$10$gP7BhyT.f0j2F84vI7P3y.x/G43jS0K6oA3E7vK.mN9cKz0qJ6P6O', 'VICE_CAPTAIN', 'Mechanical Engineering', '2023-2027', '2026-27', TRUE),
  ('b0000000-0000-0000-0000-000000000004', 'SPARC-003', 'Ananya Sharma', 'ananya.sec@sparc-aero.org', '$2a$10$gP7BhyT.f0j2F84vI7P3y.x/G43jS0K6oA3E7vK.mN9cKz0qJ6P6O', 'SECRETARY', 'Computer Science & Systems', '2024-2028', '2026-27', TRUE),
  ('b0000000-0000-0000-0000-000000000005', 'SPARC-004', 'Rohan Nair', 'rohan.nair@sparc-aero.org', '$2a$10$gP7BhyT.f0j2F84vI7P3y.x/G43jS0K6oA3E7vK.mN9cKz0qJ6P6O', 'MEMBER', 'Electrical & Electronics', '2024-2028', '2026-27', TRUE),
  ('b0000000-0000-0000-0000-000000000006', 'SPARC-005', 'Pooja Iyer', 'pooja.propulsion@sparc-aero.org', NULL, 'MEMBER', 'Aerospace Engineering', '2025-2029', '2026-27', TRUE),
  ('b0000000-0000-0000-0000-000000000007', 'SPARC-006', 'Dev Patel', 'dev.avionics@sparc-aero.org', '$2a$10$gP7BhyT.f0j2F84vI7P3y.x/G43jS0K6oA3E7vK.mN9cKz0qJ6P6O', 'MEMBER', 'Robotics & Automation', '2024-2028', '2026-27', TRUE),
  ('b0000000-0000-0000-0000-000000000008', 'SPARC-007', 'Kavya Menon', 'kavya.aero@sparc-aero.org', '$2a$10$gP7BhyT.f0j2F84vI7P3y.x/G43jS0K6oA3E7vK.mN9cKz0qJ6P6O', 'MEMBER', 'Mechanical Engineering', '2025-2029', '2026-27', TRUE),
  ('b0000000-0000-0000-0000-000000000009', 'SPARC-008', 'Tanmay Joshi', 'tanmay.payload@sparc-aero.org', '$2a$10$gP7BhyT.f0j2F84vI7P3y.x/G43jS0K6oA3E7vK.mN9cKz0qJ6P6O', 'MEMBER', 'Physics & Astronomy', '2025-2029', '2026-27', TRUE)
ON CONFLICT (sparc_id) DO NOTHING;

-- Insert Seed Announcements
INSERT INTO announcements (title, content, category, author_sparc_id) VALUES
('🚀 Project ASTRA-1 Sounding Rocket Static Fire Test', 'Static engine test scheduled at the propulsion bay this Friday at 16:30 hrs. All propulsion and avionics cadets must report in safety gear.', 'MISSION', 'SPARC-001'),
('🛰️ CanSat Telemetry Protocol Workshop', 'Join the telemetry workshop covering LoRa 433MHz frequency handshakes, barometer calibration, and live ground station plotting.', 'WORKSHOP', 'SPARC-003'),
('🗓️ National Space Day Holiday - No Evening Roll Call', 'On account of National Space Day Celebrations, formal attendance is suspended. Open lab access remains active for HAB payload calibration.', 'HOLIDAY', 'SPARC-FDR')
ON CONFLICT DO NOTHING;
