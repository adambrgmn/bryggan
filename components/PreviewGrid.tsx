import classNames from 'classnames';
import Link from 'next/link';
import { Fragment } from 'react';

import { PageThumbnail } from './PageThumbnail';

export interface PreviewGridItem {
  id: string;
  name: string;
  href: string;
  previewPath: string;
  previewUrl: string;
}

export interface PreviewGridProps {
  items: PreviewGridItem[];
  prioritizeCount?: number;
}

export const IssuePreviewGrid: React.FC<PreviewGridProps> = ({ items, prioritizeCount = 0 }) => {
  return (
    <GridContainer>
      <ul className="relative z-0 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {items.map((item, index) => (
          <GridItem key={item.id} item={item} priority={index < prioritizeCount} />
        ))}
      </ul>
    </GridContainer>
  );
};

export const PagePreviewGrid: React.FC<PreviewGridProps> = ({ items, prioritizeCount = 0 }) => {
  let tuples: [PreviewGridItem | null, PreviewGridItem | null][] = [];
  let itemss = [null, ...items];
  for (let i = 0; i < itemss.length; i += 2) {
    tuples.push([itemss[i], itemss[i + 1] ?? null]);
  }

  return (
    <GridContainer>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tuples.map(([left, right], index) => {
          return (
            <li key={left?.id ?? right?.id ?? index}>
              <ul className="relative z-0 grid grid-cols-2 gap-0">
                <GridItem item={left} tuple priority={index * 2 < prioritizeCount} />
                <GridItem item={right} tuple priority={index * 2 + 1 < prioritizeCount} />
              </ul>
            </li>
          );
        })}
      </ul>
    </GridContainer>
  );
};

const GridContainer: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <div>{children}</div>;
};

interface GridItemProps {
  item: PreviewGridItem | null;
  tuple?: boolean;
  priority?: boolean;
}

const GridItem: React.FC<GridItemProps> = ({ item, tuple, priority }) => {
  const container = classNames({
    'relative p-2 border rounded bg-white': true,
    'hover:outline focus-within:outline outline-1 outline-blue-500': item != null,
    'hover:bg-blue-50 focus-within:bg-blue-50': item != null,
    'z-0 hover:z-10 focus-within:z-10': item != null,

    'first:rounded-r-none': tuple,
    'last:rounded-l-none last:border-l-0': tuple,
  });

  const link = classNames({
    'mt-2 flex justify-center text-xs': true,
    "after:content-[''] after:absolute after:inset-0": true,
    'focus:text-blue-500 hover:text-blue-500': true,
    'focus:outline-none': true,
  });

  return (
    <li className={container}>
      {item != null ? (
        <Fragment>
          <PageThumbnail url={item.previewUrl} className="mix-blend-multiply" priority={priority} />
          <Link href={item.href} className={link}>
            {item.name}
          </Link>
        </Fragment>
      ) : null}
    </li>
  );
};
