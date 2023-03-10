'use client';

import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { useBreadcrumbOverride } from '@/components/Breadcrumbs';
import { useHeaderBounds } from '@/components/Header';

export const SectionTitle: React.FC<React.PropsWithChildren<{ year: string }>> = ({ year, children }) => {
  let setBreadcrumb = useBreadcrumbOverride();
  let { height } = useHeaderBounds();

  let rootMargin = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    return `0px 0px -${((window.innerHeight - height) / window.innerHeight) * 100}% 0px`;
  }, [height]);

  const [ref] = useInView({
    rootMargin,
    threshold: 0.75,
    onChange: (inView) => {
      if (inView) setBreadcrumb({ label: year, to: `./${year}` });
      else setBreadcrumb(undefined);
    },
  });

  return (
    <h2 ref={ref} className="sticky top-0 mb-6">
      {children}
    </h2>
  );
};
