
-- Drop the existing permissive INSERT policy
DROP POLICY "Users can insert friendships" ON public.friends;

-- Create a new INSERT policy that requires an accepted friend_request
CREATE POLICY "Users can insert friendships with accepted request"
ON public.friends FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.friend_requests
    WHERE status = 'accepted'
      AND (
        (sender_id = auth.uid() AND receiver_id = friend_id)
        OR (sender_id = friend_id AND receiver_id = auth.uid())
      )
  )
);
