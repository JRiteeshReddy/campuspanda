
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useDocumentTitle = () => {
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    
    // Format the title based on the current route
    if (path === '/') {
      document.title = 'CampusPanda';
    } else {
      // Remove leading slash and format the path
      const pageName = path.substring(1);
      const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      document.title = `CampusPanda - ${formattedPageName}`;
    }
    
    // Cleanup function
    return () => {
      document.title = 'CampusPanda';
    };
  }, [location]);
};

export default useDocumentTitle;
