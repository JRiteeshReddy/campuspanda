import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, handleError } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FriendWithInfo {
  id: string;
  friend_id: string;
  display_name: string;
  friend_code: string;
  created_at: string;
}

const Friends = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [friendCode, setFriendCode] = useState('');
  const [friends, setFriends] = useState<FriendWithInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      fetchFriends();
    }
  }, [user, authLoading]);

  const fetchFriends = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Get friends where current user is user_id
      const { data: myFriends, error: e1 } = await supabase
        .from('friends')
        .select('id, friend_id, created_at')
        .eq('user_id', user.id);

      // Get friends where current user is friend_id
      const { data: theirFriends, error: e2 } = await supabase
        .from('friends')
        .select('id, user_id, created_at')
        .eq('friend_id', user.id);

      if (e1) throw e1;
      if (e2) throw e2;

      const allFriendIds = [
        ...(myFriends || []).map(f => ({ id: f.id, friendUserId: f.friend_id, created_at: f.created_at })),
        ...(theirFriends || []).map(f => ({ id: f.id, friendUserId: f.user_id, created_at: f.created_at })),
      ];

      // Get friend codes to get emails (we'll use friend_codes table which has user_id)
      // We need to look up emails - but we can't query auth.users directly
      // Let's get friend codes for these users to at least show their code
      const friendUserIds = allFriendIds.map(f => f.friendUserId);
      
      if (friendUserIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      const { data: codes } = await supabase
        .from('friend_codes')
        .select('user_id, code')
        .in('user_id', friendUserIds);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', friendUserIds);

      const codeMap = new Map((codes || []).map(c => [c.user_id, c.code]));
      const usernameMap = new Map((profiles || []).map(p => [p.user_id, p.username]));

      setFriends(allFriendIds.map(f => {
        const uname = usernameMap.get(f.friendUserId);
        const code = codeMap.get(f.friendUserId) || 'Unknown';
        return {
          id: f.id,
          friend_id: f.friendUserId,
          display_name: uname || `Friend Code: ${code}`,
          friend_code: code,
          created_at: f.created_at,
        };
      }));
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!user || !friendCode.trim()) return;
    
    try {
      setSending(true);
      const code = friendCode.trim().toLowerCase();

      // Look up the friend code
      const { data: codeData, error: codeError } = await supabase
        .from('friend_codes')
        .select('user_id')
        .eq('code', code)
        .maybeSingle();

      if (codeError) throw codeError;
      if (!codeData) {
        toast.error('Invalid friend code. Please check and try again.');
        return;
      }

      if (codeData.user_id === user.id) {
        toast.error("You can't add yourself as a friend!");
        return;
      }

      // Check if already friends
      const { data: existing } = await supabase
        .from('friends')
        .select('id')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${codeData.user_id}),and(user_id.eq.${codeData.user_id},friend_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        toast.error('You are already friends!');
        return;
      }

      // Check for any existing request in either direction
      const { data: existingReqs } = await supabase
        .from('friend_requests')
        .select('id, status')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${codeData.user_id}),and(sender_id.eq.${codeData.user_id},receiver_id.eq.${user.id})`);

      const pendingReq = (existingReqs || []).find(r => r.status === 'pending');
      if (pendingReq) {
        toast.error('Friend request already sent!');
        return;
      }

      // Delete any old non-pending requests so we can send a fresh one
      const oldReqs = (existingReqs || []).filter(r => r.status !== 'pending');
      for (const old of oldReqs) {
        await supabase.from('friend_requests').delete().eq('id', old.id);
      }

      // Send friend request
      const { error } = await supabase
        .from('friend_requests')
        .insert({ sender_id: user.id, receiver_id: codeData.user_id });

      if (error) throw error;

      toast.success('Friend request sent!');
      setFriendCode('');
    } catch (error) {
      handleError(error);
    } finally {
      setSending(false);
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      toast.success('Friend removed');
      fetchFriends();
    } catch (error) {
      handleError(error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={30} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 animate-fade-in">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
              <Users size={28} />
              Friends
            </h1>
            <p className="text-muted-foreground">
              Add friends using their friend code and stay connected.
            </p>
          </header>

          {/* Add friend section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus size={20} />
                Add a Friend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter friend code (e.g. a1b2c3d4)"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value)}
                  maxLength={8}
                  className="flex-1"
                />
                <Button onClick={sendFriendRequest} disabled={sending || !friendCode.trim()}>
                  {sending ? <Loader2 size={16} className="animate-spin" /> : 'Send Request'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Friends list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Friends</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-muted-foreground" />
                </div>
              ) : friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Users size={14} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{friend.display_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Added {new Date(friend.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFriend(friend.id)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No friends yet. Share your friend code and add friends!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Friends;
