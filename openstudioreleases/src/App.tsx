import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider
} from 'react-router-dom';
import { routes } from './routes';

// const router = createBrowserRouter(routes);
const router = createHashRouter(routes);

export const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};
