
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
      
      // Format page names with proper capitalization and spacing
      let formattedPageName;
      
      switch (pageName) {
        case 'attendance':
          formattedPageName = 'Attendance Tracker';
          break;
        case 'assignments':
          formattedPageName = 'Assignment Tracker';
          break;
        case 'notes':
          formattedPageName = 'Notes Organizer';
          break;
        case 'events':
          formattedPageName = 'EventPanda';
          break;
        case 'login':
          formattedPageName = 'Login';
          break;
        case 'signup':
          formattedPageName = 'Sign Up';
          break;
        default:
          // Capitalize first letter of each word
          formattedPageName = pageName.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
      }
      
      document.title = `CampusPanda - ${formattedPageName}`;
    }
    
    // Cleanup function
    return () => {
      document.title = 'CampusPanda';
    };
  }, [location]);
};

export default useDocumentTitle;
