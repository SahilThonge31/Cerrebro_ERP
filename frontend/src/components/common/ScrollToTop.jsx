import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Whenever the route changes, instantly scroll to the top left (0, 0)
    window.scrollTo(0, 0);
  }, [pathname]);

  // This component doesn't render anything to the screen
  return null; 
};

export default ScrollToTop;