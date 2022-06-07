import type { ThumbnailFormat, ThumbnailMode, ThumbnailSize } from '~/types/Dropbox';

interface PagePreviewProps {
  path: string;
  size?: ThumbnailSize;
  format?: ThumbnailFormat;
  mode?: ThumbnailMode;
}

export const PagePreview: React.FC<PagePreviewProps> = ({
  path,
  size = 'w128h128',
  format = 'png',
  mode = 'fitone_bestfit',
}) => {
  let url = new URL('.' + path, 'http://localhost:3000/api/preview/');
  url.searchParams.set('size', size);
  url.searchParams.set('format', format);
  url.searchParams.set('mode', mode);

  return <img src={`${url.pathname}${url.search}`} alt={path} />;
};
