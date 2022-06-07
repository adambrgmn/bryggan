import { Link } from '@remix-run/react';
import * as z from 'zod';

import { useSafeParams } from '~/hooks';
import { compact } from '~/utils/array';

let ParamsSchema = z.object({
  year: z.string().optional(),
  issue: z.string().optional(),
  page: z.string().optional(),
});

export const Breadcrumbs: React.FC = () => {
  let params = useSafeParams(ParamsSchema);
  let items = compact([
    params.year != null ? { label: params.year, to: `./${params.year}` } : null,
    params.issue != null ? { label: params.issue, to: `./${params.year}/${params.issue}` } : null,
    params.page != null ? { label: params.page, to: `./${params.year}/${params.issue}/${params.page}` } : null,
  ]);

  return (
    <ul className="flex gap-4">
      {items.map((item) => (
        <li key={item.to}>
          <Link to={item.to}>{item.label}</Link>
        </li>
      ))}
    </ul>
  );
};
