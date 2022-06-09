import type { LoaderFunction } from '@remix-run/node';

import { config } from '~/config';
import { refresher } from '~/services/auth.server';

export const loader: LoaderFunction = ({ request }) => {
  return refresher.refresh(request, { failureUrl: config['route.login'] });
};
