
-- Add timetable visibility columns to profiles
ALTER TABLE public.profiles
ADD COLUMN timetable_visible boolean NOT NULL DEFAULT true,
ADD COLUMN visible_to_friend_ids uuid[] NOT NULL DEFAULT '{}';
