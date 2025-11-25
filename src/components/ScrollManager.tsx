import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollManager scrolls to top on new navigations (PUSH/REPLACE)
 * and lets the browser handle POP (back/forward) to preserve history scroll.
 */
export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') {
      return;
    }

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    });
  }, [location.pathname, navigationType]);

  return null;
}

