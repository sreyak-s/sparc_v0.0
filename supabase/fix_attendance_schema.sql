-- =========================================================================
-- SPARC Aerospace Portal - Supabase Attendance Schema Fix & Migration
-- Run this in your Supabase SQL Editor if you encounter attendance schema errors.
-- =========================================================================

-- 1. Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Ensure members table exists with standard columns
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 3. Ensure attendance table has correct columns & unique constraint for upsert
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  sparc_id VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'LATE', 'ABSENT', 'HOLIDAY')),
  marked_by_sparc_id VARCHAR(20) DEFAULT 'SPARC-FDR',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop duplicate constraint if any and re-add unique constraint for reliable upserts
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS unique_member_daily_attendance;
ALTER TABLE attendance ADD CONSTRAINT unique_member_daily_attendance UNIQUE (member_id, date);

-- 4. Create rapid lookup indexes
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sparc_id ON attendance(sparc_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- 5. Row Level Security policies
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select attendance" ON attendance;
CREATE POLICY "Allow select attendance" ON attendance FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service full attendance" ON attendance;
CREATE POLICY "Service full attendance" ON attendance FOR ALL USING (true);
