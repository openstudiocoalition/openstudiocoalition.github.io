import { Navigate, type RouteObject } from 'react-router-dom';
import { Login } from './auth/Login';
import { Root } from './Root';
import { Releases } from './releases/Releases';
import { Register } from './auth/Register';
import { ResetPassword } from './auth/ResetPassword';
import { Profile } from './auth/Profile';

export const BASENAME = '/app';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={BASENAME} />,
  },
  {
    path: `${BASENAME}/login`,
    element: <Login />,
  },
  {
    path: `${BASENAME}/register`,
    element: <Register />,
  },
  {
    path: `${BASENAME}/reset-password`,
    element: <ResetPassword />,
  },
  {
    path: `${BASENAME}/profile`,
    element: <Profile />,
  },

  {
    path: `${BASENAME}`,
    element: <Root />,
    children: [
      {
        path: `${BASENAME}/releases`,
        element: <Releases />,
      },
    ],
  },
];
