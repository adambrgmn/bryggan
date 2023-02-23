'use client';

import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { ChevronRight } from 'react-feather';
import useMeasure from 'react-use-measure';

import { config } from '@/lib/config';
import { compact } from '@/lib/utils/array';
import { parsePageName } from '@/lib/utils/dropbox';
import { join } from '@/lib/utils/path';

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
    return () => setBreadcrumbs(undefined);
  }, [setBreadcrumbs]);

  return setBreadcrumbs;
}

export const Breadcrumbs: React.FC = () => {
  const ctx = useContext(BreadcrumbsContext);

  let [year, issue, page] = useSelectedLayoutSegments().map(decodeURIComponent);
  let items: BreadcrumbItem[] = ctx?.breadcrumb
    ? [ctx.breadcrumb]
    : compact([
        year != null ? { label: year, to: join(config['route.app'], year) } : null,
        issue != null ? { label: issue, to: join(config['route.app'], year, issue) } : null,
        page != null ? { label: parsePageName(page), to: join(config['route.app'], year, issue, page) } : null,
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
      className="flex items-center gap-1 text-gray-600"
    >
      <ChevronRight size={16} className="text-gray-300" />
      <Link href={to} className="hover:text-blue-500 focus:text-blue-500">
        {label}
      </Link>
    </motion.li>
  );
};
