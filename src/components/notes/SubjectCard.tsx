
import { SubjectWithNotesCount } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface SubjectCardProps {
  subject: SubjectWithNotesCount;
  onClick: () => void;
  isActive: boolean;
}

export const SubjectCard = ({ subject, onClick, isActive }: SubjectCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isActive ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          {subject.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {subject.notesCount} {subject.notesCount === 1 ? "note" : "notes"}
        </p>
      </CardContent>
    </Card>
  );
};
