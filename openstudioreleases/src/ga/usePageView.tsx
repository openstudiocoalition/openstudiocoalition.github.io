import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { useLocation } from 'react-router-dom';
import { logEvent } from 'firebase/analytics';

import { usePrevious } from '../usePrevious';
import { firebaseAnalytics } from '../firebase';

export const usePageView = () => {
  const location = useLocation();

  const lastLocation = usePrevious(location);

  useEffect(() => {
    if (!process.env.GA_ID) {
      return;
    }

    const handlePageView = () => {
      const pagePath =
        window.location.pathname +
        window.location.search +
        window.location.hash;

      if (!lastLocation) {
        ReactGA.send({
          hitType: 'pageview',
          page: pagePath,
          location: pagePath,
          title: pagePath,
        });

        logEvent(firebaseAnalytics, 'page_view', {
          page_path: pagePath,
          page_location: pagePath,
          page_title: pagePath,
        });

        return;
      }

      if (
        lastLocation.pathname !== location.pathname ||
        lastLocation.search !== location.search
      ) {
        ReactGA.send({
          hitType: 'pageview',
          page: pagePath,
          location: pagePath,
          title: pagePath,
        });
      }
    };

    handlePageView();
  }, [location]);
};
