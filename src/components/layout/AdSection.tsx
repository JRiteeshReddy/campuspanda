import { Card } from '@/components/ui/card';

const AdSection = () => {
  return (
    <div className="py-6 border-t border-border">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <Card 
          className="w-full overflow-hidden bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => window.open('https://forms.gle/HUu8jDciySeoqcYe7', '_blank')}
        >
          <div className="w-full" style={{ aspectRatio: '16/3' }}>
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Advertisement Space
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdSection;
