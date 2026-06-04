-- Planner App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum-like types via check constraints for simplicity with Supabase
CREATE TABLE IF NOT EXISTS calendar_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('task', 'event', 'meeting')),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast queries by user and date
CREATE INDEX IF NOT EXISTS idx_calendar_items_user_date
    ON calendar_items(user_id, start_date);

-- Enable Row Level Security
ALTER TABLE calendar_items ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own items
CREATE POLICY "Users can view own items" ON calendar_items
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: users can insert only their own items
CREATE POLICY "Users can insert own items" ON calendar_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: users can update only their own items
CREATE POLICY "Users can update own items" ON calendar_items
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: users can delete only their own items
CREATE POLICY "Users can delete own items" ON calendar_items
    FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calendar_items_updated_at
    BEFORE UPDATE ON calendar_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for calendar_items
BEGIN;
    DROP PUBLICATION IF EXISTS supabase_realtime;
    CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE calendar_items;
