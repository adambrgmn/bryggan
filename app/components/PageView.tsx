import { DialogContent, DialogOverlay } from '@reach/dialog';
import { Link, useNavigate } from '@remix-run/react';
import { Document, Page, pdfjs } from 'react-pdf';

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

  return (
    <DialogOverlay isOpen onDismiss={() => navigate('..')} className="z-20">
      <DialogContent className="m-4 p-0 w-auto h-[calc(100vh-2rem)] overflow-scroll">
        <div>
          {previous ? (
            <p>
              <Link to={`../${previous}`}>Previous</Link>
            </p>
          ) : null}
          <p>
            {current} / {total}
          </p>
          {next ? (
            <p>
              <Link to={`../${next}`}>Next</Link>
            </p>
          ) : null}
        </div>
        <Document file={`/api/content/${path}`}>
          <Page pageNumber={1} />
        </Document>
      </DialogContent>
    </DialogOverlay>
  );
};
