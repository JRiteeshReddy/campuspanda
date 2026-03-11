
-- Table to track daily attendance markings (replaces localStorage)
CREATE TABLE public.attendance_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  marked_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject_id, marked_date)
);

ALTER TABLE public.attendance_marks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own marks" ON public.attendance_marks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own marks" ON public.attendance_marks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own marks" ON public.attendance_marks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Friend codes table - one per user, auto-generated
CREATE TABLE public.friend_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.friend_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own code" ON public.friend_codes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can look up codes" ON public.friend_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own code" ON public.friend_codes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Friend requests table
CREATE TABLE public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view requests they sent or received" ON public.friend_requests FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send requests" ON public.friend_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update requests they received" ON public.friend_requests FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);
CREATE POLICY "Users can delete their own requests" ON public.friend_requests FOR DELETE TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Friends table (accepted friendships)
CREATE TABLE public.friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friends" ON public.friends FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can insert friendships" ON public.friends FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete friendships" ON public.friends FOR DELETE TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);
