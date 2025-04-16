
import { Button } from '@/components/ui/button';

const FeedbackLink = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 py-4 text-center">
      <span className="text-xs text-muted-foreground">
        Got a wacky idea to make CampusPanda even better? Share your genius!
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
