-- Add is_playing_dj column to event_staff table
-- This allows marking if a DJ Operator is actually playing the DJ for an event

ALTER TABLE public.event_staff
ADD COLUMN IF NOT EXISTS is_playing_dj boolean DEFAULT false;
