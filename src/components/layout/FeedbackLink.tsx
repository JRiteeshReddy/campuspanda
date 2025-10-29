
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
        onClick={() => window.open('https://forms.gle/cVguzVEHAKXHV5QG8', '_blank')}
      >
        Drop your ideas here!
      </Button>
    </div>
  );
};

export default FeedbackLink;
