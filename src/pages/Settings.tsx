import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Mail, Key, Shield, Eye, EyeOff, User, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/use-document-title';

interface FriendInfo {
  id: string;
  friend_id: string;
  display_name: string;
}

const Settings = () => {
  useDocumentTitle();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [usernameLoading, setUsernameLoading] = useState(false);

  // Timetable visibility
  const [timetableVisible, setTimetableVisible] = useState(true);
  const [visibleToFriendIds, setVisibleToFriendIds] = useState<string[]>([]);
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [visibilityLoading, setVisibilityLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUsername();
      fetchVisibilitySettings();
      fetchFriends();
    }
  }, [user]);

  const fetchUsername = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data?.username) {
      setCurrentUsername(data.username);
      setUsername(data.username);
    }
  };

  const fetchVisibilitySettings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('timetable_visible, visible_to_friend_ids')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setTimetableVisible(data.timetable_visible ?? true);
      setVisibleToFriendIds(data.visible_to_friend_ids || []);
    }
  };

  const fetchFriends = async () => {
    if (!user) return;
    try {
      setFriendsLoading(true);
      const { data: myFriends } = await supabase
        .from('friends')
        .select('id, friend_id')
        .eq('user_id', user.id);

      const { data: theirFriends } = await supabase
        .from('friends')
        .select('id, user_id')
        .eq('friend_id', user.id);

      const allFriendIds = [
        ...(myFriends || []).map(f => ({ id: f.id, friendUserId: f.friend_id })),
        ...(theirFriends || []).map(f => ({ id: f.id, friendUserId: f.user_id })),
      ];

      const friendUserIds = allFriendIds.map(f => f.friendUserId);
      if (friendUserIds.length === 0) {
        setFriends([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', friendUserIds);

      const { data: codes } = await supabase
        .from('friend_codes')
        .select('user_id, code')
        .in('user_id', friendUserIds);

      const usernameMap = new Map((profiles || []).map(p => [p.user_id, p.username]));
      const codeMap = new Map((codes || []).map(c => [c.user_id, c.code]));

      setFriends(allFriendIds.map(f => ({
        id: f.id,
        friend_id: f.friendUserId,
        display_name: usernameMap.get(f.friendUserId) || `Friend: ${codeMap.get(f.friendUserId) || 'Unknown'}`,
      })));
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleUpdateVisibility = async (visible: boolean) => {
    if (!user) return;
    setTimetableVisible(visible);
    setVisibilityLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ timetable_visible: visible, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      if (error) throw error;
      if (visible) {
        toast.success('Timetable is now visible to all friends');
      } else {
        toast.success('Timetable is now hidden. Select friends below to share with.');
      }
    } catch (error: any) {
      setTimetableVisible(!visible);
      toast.error(error.message || 'Failed to update visibility');
    } finally {
      setVisibilityLoading(false);
    }
  };

  const toggleFriendVisibility = async (friendUserId: string, checked: boolean) => {
    if (!user) return;
    const updated = checked
      ? [...visibleToFriendIds, friendUserId]
      : visibleToFriendIds.filter(id => id !== friendUserId);

    setVisibleToFriendIds(updated);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ visible_to_friend_ids: updated, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (error: any) {
      // Revert
      setVisibleToFriendIds(visibleToFriendIds);
      toast.error(error.message || 'Failed to update');
    }
  };

  const handleUpdateUsername = async () => {
    if (!user || !username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    try {
      setUsernameLoading(true);
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim())
        .neq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.error('Username is already taken');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim(), updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;
      setCurrentUsername(username.trim());
      toast.success('Username updated successfully');
    } catch (error: any) {
      console.error('Error updating username:', error);
      toast.error(error.message || 'Failed to update username');
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 animate-gradient-shift bg-[length:200%_200%]">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Account Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Account Information
            </CardTitle>
            <CardDescription>Your private account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail size={18} className="text-muted-foreground" />
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/30">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Key size={18} />
                <span className="text-sm">Password is securely encrypted and cannot be displayed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Username */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Username
            </CardTitle>
            <CardDescription>Set a unique username visible to your friends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a unique username"
                maxLength={30}
              />
            </div>
            <Button
              onClick={handleUpdateUsername}
              disabled={usernameLoading || !username.trim() || username.trim() === currentUsername}
              className="w-full"
            >
              {usernameLoading ? 'Updating...' : 'Update Username'}
            </Button>
          </CardContent>
        </Card>

        {/* Timetable Visibility */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Timetable Visibility
            </CardTitle>
            <CardDescription>Control who can see your timetable and attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Display Timetable to Friends</Label>
                <p className="text-xs text-muted-foreground">
                  {timetableVisible ? 'All friends can view your timetable' : 'Only selected friends can view'}
                </p>
              </div>
              <Switch
                checked={timetableVisible}
                onCheckedChange={handleUpdateVisibility}
                disabled={visibilityLoading}
              />
            </div>

            {!timetableVisible && (
              <div className="border border-border rounded-lg p-3 space-y-3">
                <Label className="text-sm">Share timetable with:</Label>
                {friendsLoading ? (
                  <div className="flex justify-center py-3">
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                  </div>
                ) : friends.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No friends added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {friends.map(friend => (
                      <div key={friend.friend_id} className="flex items-center gap-2">
                        <Checkbox
                          id={`friend-${friend.friend_id}`}
                          checked={visibleToFriendIds.includes(friend.friend_id)}
                          onCheckedChange={(checked) => toggleFriendVisibility(friend.friend_id, !!checked)}
                        />
                        <Label htmlFor={`friend-${friend.friend_id}`} className="text-sm font-normal cursor-pointer">
                          {friend.display_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key size={20} />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button 
              onClick={handleChangePassword} 
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
