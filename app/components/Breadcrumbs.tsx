import { Link } from '@remix-run/react';
import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import useMeasure from 'react-use-measure';
import * as z from 'zod';

import { useSafeParams } from '~/hooks';
import { compact } from '~/utils/array';
import { parsePageName } from '~/utils/dropbox';

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
    params.page != null
      ? { label: parsePageName(params.page), to: `./${params.year}/${params.issue}/${params.page}` }
      : null,
  ]);

  return (
    <ul className="flex gap-2">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <Breadcrumb key={item.to} to={item.to} label={item.label} />
        ))}
      </AnimatePresence>
    </ul>
  );
};

const Breadcrumb: React.FC<{ label: string; to: string }> = ({ label, to }) => {
  let isPresent = useIsPresent();
  const [ref, bounds] = useMeasure();

  return (
    <motion.li
      ref={ref}
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -10, opacity: 0 }}
      style={isPresent ? {} : { position: 'absolute', top: bounds.top, left: bounds.left }}
    >
      <Link to={to}>{label}</Link>
    </motion.li>
  );
};
