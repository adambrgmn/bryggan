'use client';

import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cloneElement, startTransition, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader, X, ZoomIn, ZoomOut } from 'react-feather';
import { Document, Page, pdfjs } from 'react-pdf';
import type { RectReadOnly } from 'react-use-measure';
import useMeasure from 'react-use-measure';

import { config } from '@/lib/config';
import { useInitialFocusRef } from '@/lib/hooks/use-initial-focus';
import { useWindowEvent } from '@/lib/hooks/use-window-event';

import { Dialog } from './Dialog';

pdfjs.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.js';

interface PageViewProps {
  url: string;
  next: string | undefined;
  previous: string | undefined;
  current: number;
  total: number;
}

export const PageView: React.FC<PageViewProps> = ({ url, next, previous, current, total }) => {
  let [scale, setScale] = useState(1);
  let [wrapperRef, bounds] = useMeasure();

  const handleZoom = (amount: number | 'reset') => {
    startTransition(() => {
      if (amount === 'reset') {
        setScale(1);
      } else {
        setScale((prev) => prev + amount);
      }
    });
  };

  return (
    <Dialog
      ref={wrapperRef}
      className="relative flex h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] items-center justify-center overflow-hidden rounded bg-white p-4"
    >
      <AnimatePresence initial={false}>
        <PdfDocument key={url} url={url} scale={scale} bounds={bounds} />
      </AnimatePresence>

      <Controls next={next} previous={previous} current={current} total={total} scale={scale} setScale={handleZoom} />
    </Dialog>
  );
};

const PdfDocument: React.FC<{ url: string; scale: number; bounds: RectReadOnly }> = ({ url, scale, bounds }) => {
  let [ready, setReady] = useState(false);
  let className = classNames({
    'transition-opacity': true,
    'opacity-1': ready,
    'opacity-0': !ready,
  });

  let height = bounds.height - 2 * 16;
  let width = height * config['app.dropbox.aspect_ratio'];

  return (
    <motion.div
      className="box-content overflow-scroll rounded border"
      style={{ width, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence initial={false}>{ready ? null : <Spinner key="spinner" />}</AnimatePresence>

      <Document file={url} className={className}>
        <Page pageNumber={1} width={width * scale} onRenderSuccess={() => setReady(true)} />
      </Document>
    </motion.div>
  );
};

interface ControlsProps extends Omit<PageViewProps, 'url'> {
  scale: number;
  setScale: (amount: number | 'reset') => void;
}

const Controls: React.FC<ControlsProps> = ({ next, previous, current, total, scale, setScale }) => {
  let router = useRouter();
  let pathname = usePathname();
  let basePathname = pathname?.split('/').slice(0, -1).join('/') ?? '';

  let ref = useInitialFocusRef<HTMLButtonElement>();

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
      <button
        ref={ref}
        type="button"
        aria-label="Stäng förhandsvisning"
        className={sharedButtonClassName()}
        onClick={back}
      >
        <X size={14} />
      </button>
      <ControlsDivider />

      <ZoomButton label="Zooma ut" icon={<ZoomOut />} onClick={() => setScale(-0.1)} />
      <span className="text-xs tabular-nums">{Math.round(scale * 100)}%</span>
      <ZoomButton label="Zooma in" icon={<ZoomIn />} onClick={() => setScale(+0.1)} />
    </div>
  );
};

let sharedButtonClassName = (active = true) =>
  classNames({
    'text-xs': true,
    'h-8 w-8 flex items-center justify-center rounded-full': true,
    'hover:text-blue-500 focus:text-blue-500 outline-none': active,
    'hover:bg-blue-100 focus:bg-blue-100': active,
  });

const PaginationLink: React.FC<{
  to: string | undefined;
  label: string;
  icon: React.ReactElement<{ size?: number }>;
}> = ({ to, label, icon }) => {
  let iconClone = cloneElement(icon, { size: 14 });

  return to ? (
    <Link href={to} aria-label={label} className={sharedButtonClassName()}>
      {iconClone}
    </Link>
  ) : (
    <span className={sharedButtonClassName(false)}>{iconClone}</span>
  );
};

const ZoomButton: React.FC<{ label: string; icon: React.ReactElement<{ size?: number }>; onClick: () => void }> = ({
  label,
  icon,
  onClick,
}) => {
  let iconClone = cloneElement(icon, { size: 14 });
  return (
    <button type="button" aria-label={label} onClick={onClick} className={sharedButtonClassName(true)}>
      {iconClone}
    </button>
  );
};

const ControlsDivider: React.FC = () => {
  return <hr className="h-[calc(100%-8px)] w-px bg-gray-200" />;
};

const Spinner: React.FC = () => {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Loader className="animate-spin" />
    </motion.div>
  );
};
