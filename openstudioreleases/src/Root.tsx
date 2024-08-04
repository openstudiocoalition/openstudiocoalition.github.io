import { Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from './firebase'
import { useEffect, useState } from 'react';
import { usePageView } from './ga/usePageView';
import { BASENAME } from './routes';

export const Root = () => {
  usePageView();
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      console.log('onAuthStateChanged: ', user)

      if (user) {
        setUser(user);

        navigate(`${BASENAME}/releases`);
      } else {
        setUser(null);

        navigate(`${BASENAME}/login`);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <>
      <Outlet />
    </>
  );
};
