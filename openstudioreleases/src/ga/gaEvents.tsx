import ReactGA from 'react-ga4';
import { firebaseAnalytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

export const gaLoginEvent = (userId: string) => {
  console.log('gaLoginEvent', userId, {
    category: 'User',
    action: 'Login',
    label: userId,
  });
  ReactGA.event({
    category: 'User',
    action: 'Login',
    label: userId,
  });

  logEvent(firebaseAnalytics, 'login', {
    category: 'User',
    action: 'Login',
    label: userId,
  });
};

// Log an event when a download is clicked
export const gaDownloadClick = (fileName: string, releaseVersion: string, platform: string) => {
  console.log('gaDownloadClick', fileName, {
    file_name: fileName,
    release_version: releaseVersion,
    platform: platform,
  });

  ReactGA.event('file_download', {
    file_name: fileName,
    release_version: releaseVersion,
    platform: platform,
  });

  logEvent(firebaseAnalytics, 'file_download', {
    file_name: fileName,
    release_version: releaseVersion,
    platform: platform,
  });

  logEvent(firebaseAnalytics, 'select_content', {
    content_type: fileName,
    item_id: fileName,
    file_name: fileName,
    release_version: releaseVersion,
    platform: platform,
  })
};