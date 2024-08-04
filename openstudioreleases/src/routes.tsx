import { Navigate, type RouteObject } from 'react-router-dom';
import { Login } from './auth/Login';
import { Root } from './Root';
import { Releases } from './releases/Releases';
import { Register } from './auth/Register';

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