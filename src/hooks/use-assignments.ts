
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Assignment } from '@/types';
import { differenceInDays } from 'date-fns';

export function useAssignments(userId?: string) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchAssignments();
    } else {
      setAssignments([]);
      setIsLoading(false);
    }
  }, [userId]);

  // Function to check and delete assignments that are more than 2 days past their deadline
  const checkAndDeleteExpiredAssignments = (assignments: Assignment[]) => {
    const today = new Date();
    const assignmentsToDelete: string[] = [];

    assignments.forEach(assignment => {
      const deadline = new Date(assignment.deadline);
      const daysPastDeadline = differenceInDays(today, deadline);
      
      if (daysPastDeadline > 2) {
        assignmentsToDelete.push(assignment.id);
      }
    });

    // Delete expired assignments if any exist
    if (assignmentsToDelete.length > 0) {
      Promise.all(assignmentsToDelete.map(id => deleteAssignment(id, true)));
    }

    return assignments.filter(assignment => 
      !assignmentsToDelete.includes(assignment.id)
    );
  };

  const fetchAssignments = async () => {
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
      
      // Check and delete expired assignments
      const filteredAssignments = checkAndDeleteExpiredAssignments(formattedAssignments);
      setAssignments(filteredAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
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
        completed: newAssignment.completed !== undefined ? newAssignment.completed : false
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
      
      toast.success('Assignment added successfully');
      return formattedAssignment;
    } catch (error) {
      console.error('Error adding assignment:', error);
      toast.error('Failed to add assignment');
      throw error;
    }
  };

  const updateAssignment = async (updatedAssignment: Assignment) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({
          subject: updatedAssignment.subject,
          title: updatedAssignment.title,
          deadline: updatedAssignment.deadline instanceof Date 
            ? updatedAssignment.deadline.toISOString() 
            : updatedAssignment.deadline,
          completed: updatedAssignment.completed
        })
        .eq('id', updatedAssignment.id);

      if (error) throw error;

      setAssignments(prevAssignments => 
        prevAssignments
          .map(assignment => 
            assignment.id === updatedAssignment.id ? updatedAssignment : assignment
          )
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      );
      
      toast.success('Assignment updated successfully');
      return updatedAssignment;
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
      throw error;
    }
  };

  const deleteAssignment = async (assignmentId: string, silent = false) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(prevAssignments => 
        prevAssignments.filter(assignment => assignment.id !== assignmentId)
      );
      
      if (!silent) {
        toast.success('Assignment deleted successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      if (!silent) {
        toast.error('Failed to delete assignment');
      }
      throw error;
    }
  };

  return {
    assignments,
    isLoading,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    refreshAssignments: fetchAssignments
  };
}
