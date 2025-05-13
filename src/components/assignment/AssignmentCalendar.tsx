
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Assignment } from '@/types';
import { addMonths, isSameDay } from '@/lib/date-utils';

interface AssignmentCalendarProps {
  assignments: Assignment[];
  selectedDate: Date | undefined;
  onDateSelect: (day: Date | undefined) => void;
  selectedMonthOffset: number;
  onMonthChange: (offset: number) => void;
}

const AssignmentCalendar = ({
  assignments,
  selectedDate,
  onDateSelect,
  selectedMonthOffset,
  onMonthChange
}: AssignmentCalendarProps) => {
  // Current displayed month
  const [displayedMonth, setDisplayedMonth] = React.useState<Date>(
    addMonths(new Date(), selectedMonthOffset)
  );

  // Update displayed month when offset changes
  React.useEffect(() => {
    setDisplayedMonth(addMonths(new Date(), selectedMonthOffset));
  }, [selectedMonthOffset]);

  const handlePreviousMonth = () => {
    onMonthChange(selectedMonthOffset - 1);
  };

  const handleNextMonth = () => {
    onMonthChange(selectedMonthOffset + 1);
  };

  // Custom calendar day rendering
  const getDayContent = (day: Date) => {
    const assignment = assignments.find(a => 
      isSameDay(new Date(a.deadline), day)
    );
    
    if (!assignment) {
      return <div>{day.getDate()}</div>;
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
        {day.getDate()}
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Calendar</h2>
          <Tabs value={selectedMonthOffset.toString()} className="w-auto">
            <TabsList>
              <TabsTrigger value="0" onClick={() => onMonthChange(0)}>Current</TabsTrigger>
              <TabsTrigger value="1" onClick={() => onMonthChange(1)}>Next</TabsTrigger>
              <TabsTrigger value="2" onClick={() => onMonthChange(2)}>+2</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          month={displayedMonth}
          className="rounded-md border pointer-events-auto mx-auto"
          onMonthChange={setDisplayedMonth}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
          components={{
            DayContent: ({ date }) => getDayContent(date)
          }}
        />
      </CardContent>
    </Card>
  );
};

export default AssignmentCalendar;
