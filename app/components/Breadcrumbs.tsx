import { Link } from '@remix-run/react';
import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import { createContext, useContext, useEffect, useState } from 'react';
import { ChevronRight } from 'react-feather';
import useMeasure from 'react-use-measure';
import * as z from 'zod';

import { useSafeParams } from '~/hooks';
import { compact } from '~/utils/array';
import { parsePageName } from '~/utils/dropbox';

interface BreadcrumbItem {
  label: string;
  to: string;
}

interface BreadcrumbContextType {
  breadcrumb: BreadcrumbItem | undefined;
  setBreadcrumbs: React.Dispatch<React.SetStateAction<BreadcrumbItem | undefined>>;
}

const BreadcrumbsContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [breadcrumb, setBreadcrumbs] = useState<BreadcrumbItem | undefined>(undefined);

  return <BreadcrumbsContext.Provider value={{ breadcrumb, setBreadcrumbs }}>{children}</BreadcrumbsContext.Provider>;
};

export function useBreadcrumbOverride() {
  let ctx = useContext(BreadcrumbsContext);
  if (ctx == null) throw new Error('useBreadcrumbOverride is used outside the BreadcrumbProvider');
  let { setBreadcrumbs } = ctx;

  useEffect(() => {
    return () => {
      setBreadcrumbs(undefined);
    };
  }, [setBreadcrumbs]);

  return setBreadcrumbs;
}

let ParamsSchema = z.object({
  year: z.string().optional(),
  issue: z.string().optional(),
  page: z.string().optional(),
});

export const Breadcrumbs: React.FC = () => {
  const ctx = useContext(BreadcrumbsContext);

  let params = useSafeParams(ParamsSchema);
  let items: BreadcrumbItem[] = ctx?.breadcrumb
    ? [ctx.breadcrumb]
    : compact([
        params.year != null ? { label: params.year, to: `./${params.year}` } : null,
        params.issue != null ? { label: params.issue, to: `./${params.year}/${params.issue}` } : null,
        params.page != null
          ? { label: parsePageName(params.page), to: `./${params.year}/${params.issue}/${params.page}` }
          : null,
      ]);

  return (
    <ul className="flex gap-1">
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
      className="flex gap-1 items-center text-gray-600"
    >
      <ChevronRight size={16} className="text-gray-300" />
      <Link to={to} className="hover:text-blue-500 focus:text-blue-500">
        {label}
      </Link>
    </motion.li>
  );
};
