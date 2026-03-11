import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Inbox, Check, X, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FriendRequest {
  id: string;
  sender_id: string;
  sender_code: string;
  created_at: string;
}

const InboxButton = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('id, sender_id, created_at')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get sender codes
      const senderIds = (data || []).map(r => r.sender_id);
      let codeMap = new Map<string, string>();
      
      if (senderIds.length > 0) {
        const { data: codes } = await supabase
          .from('friend_codes')
          .select('user_id, code')
          .in('user_id', senderIds);
        codeMap = new Map((codes || []).map(c => [c.user_id, c.code]));
      }

      setRequests((data || []).map(r => ({
        ...r,
        sender_code: codeMap.get(r.sender_id) || 'Unknown',
      })));
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId: string, senderId: string) => {
    if (!user) return;
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create friendship (both directions)
      const { error: friendError } = await supabase
        .from('friends')
        .insert([
          { user_id: user.id, friend_id: senderId },
        ]);

      if (friendError) throw friendError;

      toast.success('Friend request accepted!');
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Friend request declined');
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to decline request');
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) fetchRequests(); }}>
      <DropdownMenuTrigger className="relative outline-none">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
          <Inbox size={16} className="text-muted-foreground" />
        </div>
        {requests.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {requests.length}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 bg-background">
        <DropdownMenuLabel>Friend Requests</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
          </div>
        ) : requests.length > 0 ? (
          <div className="max-h-64 overflow-y-auto">
            {requests.map((req) => (
              <div key={req.id} className="px-2 py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{req.sender_code}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                    onClick={() => acceptRequest(req.id, req.sender_id)}
                  >
                    <Check size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => rejectRequest(req.id)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No pending requests
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InboxButton;
