
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

const FeedbackLink = () => {
  const handleEmailClick = () => {
    window.location.href = 'mailto:jriteeshreddy@gmail.com';
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 py-4 text-center">
      <span className="text-xs text-muted-foreground">
        Got a wacky idea to make CampusPanda even better? 
        <button 
          onClick={handleEmailClick} 
          className="ml-1 text-primary hover:underline text-xs"
        >
          J Riteesh Reddy
        </button>
      </span>
      <Button
        variant="outline"
        size="sm"
        className="animate-pulse hover:animate-none"
        onClick={() => window.open('https://forms.gle/jJDhNk5WvRuLEKWF6', '_blank')}
      >
        Drop your ideas here!
      </Button>
    </div>
  );
};

export default FeedbackLink;
