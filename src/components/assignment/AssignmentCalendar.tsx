
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Assignment } from '@/types';
import { differenceInMonths } from 'date-fns/differenceInMonths';
import { isEqual } from 'date-fns/isEqual';

interface AssignmentCalendarProps {
  assignments: Assignment[];
  date: Date;
  selectedDate: Date | undefined;
  selectedMonthOffset: number;
  onDateSelect: (day: Date | undefined) => void;
  onMonthChange: (offset: number) => void;
}

const AssignmentCalendar = ({
  assignments,
  date,
  selectedDate,
  selectedMonthOffset,
  onDateSelect,
  onMonthChange,
}: AssignmentCalendarProps) => {
  const handleMonthChange = (offset: number) => {
    onMonthChange(offset);
  };

  const handlePreviousMonth = () => {
    const newOffset = selectedMonthOffset - 1;
    handleMonthChange(newOffset);
  };

  const handleNextMonth = () => {
    const newOffset = selectedMonthOffset + 1;
    handleMonthChange(newOffset);
  };

  const assignmentStyles = {
    backgroundColor: "transparent",
    color: "inherit",
    borderRadius: "0"
  };

  const modifiers = {
    assignment: (day: Date) => 
      assignments.some(assignment => 
        isEqual(new Date(assignment.deadline), day)
      )
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Calendar</h2>
        <Tabs value={selectedMonthOffset.toString()} className="w-auto">
          <TabsList>
            <TabsTrigger value="0" onClick={() => handleMonthChange(0)}>Current</TabsTrigger>
            <TabsTrigger value="1" onClick={() => handleMonthChange(1)}>Next</TabsTrigger>
            <TabsTrigger value="2" onClick={() => handleMonthChange(2)}>+2</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        month={date}
        className="rounded-md border pointer-events-auto mx-auto"
        modifiers={modifiers}
        modifiersStyles={{
          assignment: assignmentStyles
        }}
        onMonthChange={date => onMonthChange(
          Math.floor(differenceInMonths(date, new Date()) || 0)
        )}
        onPrevious={handlePreviousMonth}
        onNext={handleNextMonth}
        components={{
          DayContent: (props) => {
            const day = props.date;
            const assignment = assignments.find(a => isEqual(new Date(a.deadline), day));
            
            if (!assignment) {
              return <div>{props.date.getDate()}</div>;
            }
            
            let style = {};
            
            if (assignment.completed) {
              style = { backgroundColor: '#22c55e', color: 'white', borderRadius: '9999px' };
            } else {
              const daysUntilDeadline = Math.ceil(
                (new Date(assignment.deadline).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
              );
              
              if (daysUntilDeadline <= 1) {
                style = { backgroundColor: '#ef4444', color: 'white', borderRadius: '9999px' };
              } else if (daysUntilDeadline <= 3) {
                style = { backgroundColor: '#eab308', color: 'white', borderRadius: '9999px' };
              } else {
                style = { backgroundColor: '#22c55e', color: 'white', borderRadius: '9999px' };
              }
            }
            
            return (
              <div style={style} className="flex items-center justify-center w-full h-full">
                {props.date.getDate()}
              </div>
            );
          }
        }}
      />
    </>
  );
};

export default AssignmentCalendar;
