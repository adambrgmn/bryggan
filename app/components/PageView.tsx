import { DialogContent, DialogOverlay } from '@reach/dialog';
import { Link, useNavigate } from '@remix-run/react';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { cloneElement, startTransition, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader, X, ZoomIn, ZoomOut } from 'react-feather';
import { Document, Page, pdfjs } from 'react-pdf';
import type { RectReadOnly } from 'react-use-measure';
import useMeasure from 'react-use-measure';

import { config } from '~/config';
import { useWindowEvent } from '~/hooks/use-window-event';

pdfjs.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.js';

interface PageViewProps {
  path: string;
  next: string | undefined;
  previous: string | undefined;
  current: number;
  total: number;
}

export const PageView: React.FC<PageViewProps> = ({ path, next, previous, current, total }) => {
  let navigate = useNavigate();
  let [scale, setScale] = useState(1);

  let initialFocusRef = useRef<HTMLButtonElement>(null);
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
    <DialogOverlay isOpen onDismiss={() => navigate('..')} className="z-20" initialFocusRef={initialFocusRef}>
      <DialogContent
        ref={wrapperRef}
        className="relative m-4 flex h-[calc(100vh-2rem)] w-auto flex-col items-center overflow-hidden rounded p-4"
        aria-label="Page preview"
      >
        <AnimatePresence initial={false}>
          <PdfDocument key={path} path={path} scale={scale} bounds={bounds} />
        </AnimatePresence>

        <Controls
          next={next}
          previous={previous}
          current={current}
          total={total}
          scale={scale}
          setScale={handleZoom}
          initialFocusRef={initialFocusRef}
        />
      </DialogContent>
    </DialogOverlay>
  );
};

const PdfDocument: React.FC<{ path: string; scale: number; bounds: RectReadOnly }> = ({ path, scale, bounds }) => {
  let [ready, setReady] = useState(false);
  let className = classNames({
    'transition-opacity': true,
    'opacity-1': ready,
    'opacity-0': !ready,
  });

  let height = bounds.height - 2 * 16;
  let width = height * (config['app.dropbox.aspect_width'] / config['app.dropbox.aspect_height']);

  return (
    <motion.div
      className="absolute overflow-scroll rounded border"
      style={{ width, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence initial={false}>{ready ? null : <Spinner key="spinner" />}</AnimatePresence>

      <Document file={`/api/content/${path}`} className={className}>
        <Page pageNumber={1} width={width * scale} onRenderSuccess={() => setReady(true)} />
      </Document>
    </motion.div>
  );
};

interface ControlsProps extends Omit<PageViewProps, 'path'> {
  scale: number;
  setScale: (amount: number | 'reset') => void;
  initialFocusRef: React.RefObject<HTMLButtonElement>;
}

const Controls: React.FC<ControlsProps> = ({ next, previous, current, total, scale, setScale, initialFocusRef }) => {
  let navigate = useNavigate();

  useWindowEvent('keydown', (event) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (previous != null) navigate(`../${previous}`);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (next != null) navigate(`../${next}`);
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
    <div className="fixed bottom-10 mx-auto flex w-auto flex-none items-center gap-2 rounded-2xl border bg-white">
      <PaginationLink to={previous ? `../${previous}` : undefined} label="Previous" icon={<ChevronLeft />} />
      <span className="text-xs tabular-nums">
        {current} / {total}
      </span>
      <PaginationLink to={next ? `../${next}` : undefined} label="Next" icon={<ChevronRight />} />

      <ControlsDivider />
      <button
        ref={initialFocusRef}
        type="button"
        aria-label="Close preview"
        className={sharedButtonClassName()}
        onClick={() => navigate('..')}
      >
        <X size={14} />
      </button>
      <ControlsDivider />

      <ZoomButton label="Zoom out" icon={<ZoomOut />} onClick={() => setScale(-0.1)} />
      <span className="text-xs tabular-nums">{Math.round(scale * 100)}%</span>
      <ZoomButton label="Zoom in" icon={<ZoomIn />} onClick={() => setScale(+0.1)} />
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
    <Link to={to} aria-label={label} className={sharedButtonClassName()}>
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
