
-- Allow friends to view each other's subjects (for attendance data)
CREATE POLICY "Friends can view friend subjects"
ON public.subjects FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.friends
    WHERE (friends.user_id = auth.uid() AND friends.friend_id = subjects.user_id)
       OR (friends.friend_id = auth.uid() AND friends.user_id = subjects.user_id)
  )
);

-- Allow friends to view each other's timetable
CREATE POLICY "Friends can view friend timetable"
ON public.timetable FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.friends
    WHERE (friends.user_id = auth.uid() AND friends.friend_id = timetable.user_id)
       OR (friends.friend_id = auth.uid() AND friends.user_id = timetable.user_id)
  )
);
