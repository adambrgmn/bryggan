'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cloneElement } from 'react';
import { ChevronLeft, ChevronRight, Frown, Loader, X, ZoomIn, ZoomOut } from 'react-feather';
import { Document, Page, pdfjs } from 'react-pdf';
import useMeasure from 'react-use-measure';

import { config } from '@/lib/config';
import { useWindowEvent } from '@/lib/hooks/use-window-event';

pdfjs.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.js';

interface PageViewProps {
  url: string;
}

export function PageView({ url }: PageViewProps) {
  let [wrapperRef, bounds] = useMeasure();
  let height = bounds.height - 2 * 16;
  let width = height * config['app.dropbox.aspect_ratio'];

  let [scale] = useScale();

  return (
    <div ref={wrapperRef} className="flex flex-1 justify-center">
      <div className="box-content overflow-scroll rounded border" style={{ width, height }}>
        <Document file={url} loading={() => <Spinner />} error={() => <ErrorView />}>
          <Page pageNumber={1} width={width * scale} renderAnnotationLayer={false} renderTextLayer={false} />
        </Document>
      </div>
    </div>
  );
}

interface ControlsProps {
  next: string | undefined;
  previous: string | undefined;
  current: number;
  total: number;
}

export function PageControls({ next, previous, current, total }: ControlsProps) {
  let router = useRouter();
  let pathname = usePathname();
  let basePathname = pathname?.split('/').slice(0, -1).join('/') ?? '';

  let [scale, setScale] = useScale();

  function back() {
    router.replace(basePathname);
  }

  useWindowEvent('keydown', (event) => {
    switch (event.key) {
      case 'Escape':
        back();
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (previous != null) router.push(`${basePathname}/${previous}`);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (next != null) router.push(`${basePathname}/${next}`);
        break;

      case '+':
        event.preventDefault();
        setScale(+0.1);
        break;

      case '-':
        event.preventDefault();
        setScale(-0.1);
        break;

      case '0':
        event.preventDefault();
        setScale('reset');
        break;
    }
  });

  return (
    <div className="absolute bottom-10 mx-auto flex w-auto flex-none items-center gap-2 rounded-2xl border bg-white">
      <PaginationLink
        to={previous ? `${basePathname}/${previous}` : undefined}
        label="Föregående"
        icon={<ChevronLeft />}
      />
      <span className="text-xs tabular-nums">
        {current} / {total}
      </span>
      <PaginationLink to={next ? `${basePathname}/${next}` : undefined} label="Nästa" icon={<ChevronRight />} />

      <ControlsDivider />
      <button type="button" aria-label="Stäng förhandsvisning" className={sharedButtonClassName()} onClick={back}>
        <X size={14} />
      </button>
      <ControlsDivider />

      <ZoomButton label="Zooma ut" icon={<ZoomOut />} onClick={() => setScale(-0.1)} />
      <span className="text-xs tabular-nums">{Math.round(scale * 100)}%</span>
      <ZoomButton label="Zooma in" icon={<ZoomIn />} onClick={() => setScale(+0.1)} />
    </div>
  );
}

function sharedButtonClassName(active = true) {
  return classNames({
    'text-xs': true,
    'h-8 w-8 flex items-center justify-center rounded-full': true,
    'hover:text-blue-500 focus:text-blue-500 outline-none': active,
    'hover:bg-blue-100 focus:bg-blue-100': active,
  });
}

function PaginationLink({
  to,
  label,
  icon,
}: {
  to: string | undefined;
  label: string;
  icon: React.ReactElement<{ size?: number }>;
}) {
  let iconClone = cloneElement(icon, { size: 14 });

  return to ? (
    <Link href={to} aria-label={label} className={sharedButtonClassName()}>
      {iconClone}
    </Link>
  ) : (
    <span className={sharedButtonClassName(false)}>{iconClone}</span>
  );
}

function ZoomButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactElement<{ size?: number }>;
  onClick: () => void;
}) {
  let iconClone = cloneElement(icon, { size: 14 });
  return (
    <button type="button" aria-label={label} onClick={onClick} className={sharedButtonClassName(true)}>
      {iconClone}
    </button>
  );
}

function ControlsDivider() {
  return <hr className="h-[calc(100%-8px)] w-px bg-gray-200" />;
}

function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader className="animate-spin" />
    </div>
  );
}

function ErrorView() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Frown className="text-red-500" />
    </div>
  );
}

function useScale() {
  let router = useRouter();
  let pathname = usePathname();
  let searchParams = useSearchParams();

  let scale = Number(searchParams.get('scale') ?? 1);
  if (Number.isNaN(scale)) scale = 1;

  const setScale = (add: number | 'reset') => {
    let url = new URL(pathname ?? '', window.location.href);
    if (add === 'reset') {
      url.searchParams.delete('scale');
    } else {
      url.searchParams.set('scale', (scale + add).toFixed(1));
    }

    router.replace(url.href);
  };

  return [scale, setScale] as const;
}
