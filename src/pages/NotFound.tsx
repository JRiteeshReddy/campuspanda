import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import FeedbackLink from "@/components/layout/FeedbackLink";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 animate-gradient-shift" />
      
      <div className="relative z-10 text-center px-4">
        {/* Large 404 text */}
        <h1 className="text-[150px] md:text-[200px] font-bold text-primary/20 leading-none select-none">
          404
        </h1>
        
        {/* Panda emoji */}
        <div className="text-6xl mb-4 -mt-8">🐼</div>
        
        {/* Error message */}
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" size="lg" className="gap-2">
            <Link to="/">
              <Home className="h-5 w-5" />
              Go to Home
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-0 w-full">
        <FeedbackLink />
      </div>
    </div>
  );
};

export default NotFound;
