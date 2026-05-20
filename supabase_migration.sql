-- ============================================================
-- Hospital Management System - Supabase Migration
-- Run this in your Supabase SQL Editor to create all tables
-- ============================================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL CHECK (char_length(first_name) >= 3),
  last_name TEXT NOT NULL CHECK (char_length(last_name) >= 3),
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL CHECK (char_length(phone) = 10),
  nic TEXT NOT NULL CHECK (char_length(nic) = 7),
  dob DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Patient', 'Doctor', 'Admin')),
  doctor_department TEXT,
  doc_avatar_public_id TEXT,
  doc_avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL CHECK (char_length(first_name) >= 3),
  last_name TEXT NOT NULL CHECK (char_length(last_name) >= 3),
  email TEXT NOT NULL,
  phone TEXT NOT NULL CHECK (char_length(phone) = 10),
  nic TEXT NOT NULL CHECK (char_length(nic) >= 7),
  dob DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  appointment_date TEXT NOT NULL,
  department TEXT NOT NULL,
  doctor_first_name TEXT NOT NULL,
  doctor_last_name TEXT NOT NULL,
  has_visited BOOLEAN DEFAULT FALSE,
  address TEXT NOT NULL,
  doctor_id UUID REFERENCES users(id),
  patient_id UUID REFERENCES users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL CHECK (char_length(first_name) >= 3),
  last_name TEXT NOT NULL CHECK (char_length(last_name) >= 3),
  email TEXT NOT NULL,
  phone TEXT NOT NULL CHECK (char_length(phone) = 10),
  message TEXT NOT NULL CHECK (char_length(message) >= 10),
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- Disable RLS since auth is handled by JWT in the backend
-- ============================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
