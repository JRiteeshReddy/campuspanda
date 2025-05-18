
import { useState, useEffect } from 'react';
import { Assignment } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function useAssignments(userId?: string) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = async () => {
    if (!userId) {
      setAssignments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', userId)
        .order('deadline', { ascending: true });

      if (error) throw error;
      
      const formattedAssignments = data.map(assignment => ({
        ...assignment,
        deadline: new Date(assignment.deadline)
      }));
      
      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Failed to load assignments',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAssignment = async (newAssignment: Omit<Assignment, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const assignmentToAdd = {
        user_id: userId,
        subject: newAssignment.subject,
        title: newAssignment.title,
        deadline: newAssignment.deadline.toISOString(),
        completed: false
      };

      const { data, error } = await supabase
        .from('assignments')
        .insert(assignmentToAdd)
        .select()
        .single();

      if (error) throw error;

      const formattedAssignment = {
        ...data,
        deadline: new Date(data.deadline)
      };

      setAssignments(prevAssignments => 
        [...prevAssignments, formattedAssignment].sort(
          (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )
      );
      
      toast({
        title: 'Assignment added successfully', 
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      console.error('Error adding assignment:', error);
      toast({
        title: 'Failed to add assignment', 
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateAssignment = async (assignmentId: string, updates: Partial<Assignment>) => {
    try {
      const assignmentToUpdate = assignments.find(a => a.id === assignmentId);
      
      if (!assignmentToUpdate) return false;
      
      const formattedUpdates = {
        ...updates,
        deadline: updates.deadline instanceof Date 
          ? updates.deadline.toISOString() 
          : updates.deadline
      };
      
      const { error } = await supabase
        .from('assignments')
        .update(formattedUpdates)
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(assignments.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, ...updates } 
          : assignment
      ));
      
      toast({
        title: 'Assignment updated successfully',
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: 'Failed to update assignment',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  const markAssignmentComplete = async (assignmentId: string) => {
    const assignmentToUpdate = assignments.find(a => a.id === assignmentId);
    
    if (!assignmentToUpdate) return false;
    
    const updatedValue = !assignmentToUpdate.completed;
    
    return updateAssignment(assignmentId, { completed: updatedValue });
  };

  const deleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
      toast({
        title: 'Assignment deleted successfully',
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: 'Failed to delete assignment',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Load assignments when userId changes
  useEffect(() => {
    fetchAssignments();
  }, [userId]);

  return {
    assignments,
    isLoading,
    fetchAssignments,
    addAssignment,
    updateAssignment,
    markAssignmentComplete,
    deleteAssignment
  };
}
