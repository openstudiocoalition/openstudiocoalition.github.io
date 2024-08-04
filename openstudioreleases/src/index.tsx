import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import 'core-js/stable';
import 'isomorphic-fetch';
import 'regenerator-runtime/runtime';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { Providers } from './Providers';
import ReactGA from 'react-ga4';
import { config } from './config';

if (config.GA_ID) {
  ReactGA.initialize(config.GA_ID);
}

const rootEl = document.getElementById('root');
const root = createRoot(rootEl);

if (root) {
  root.render(
    <Providers>
      <App />
    </Providers>,
  );
}
