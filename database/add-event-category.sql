-- Add event_category column to events table
-- This allows categorizing events as "Own Event", "Rental Event", or "Others"

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS event_category text DEFAULT 'Own Event';
