import classNames from 'classnames';

import { config } from '~/config';
import type { ThumbnailSize } from '~/types/Dropbox';

interface PagePreviewProps {
  path: string;
  size?: ThumbnailSize;
  className?: string;
}

export const PagePreview: React.FC<PagePreviewProps> = ({ path, size = 'w128h128', className }) => {
  let url = new URL('.' + path, 'http://localhost:3000/api/preview/');
  url.searchParams.set('size', size);
  url.searchParams.set('format', 'png');

  let width = widthMap[size];
  let height = Math.round(width / config['app.dropbox.aspect_ratio']);

  return (
    <img
      className={classNames('aspect-paper w-full h-auto', className)}
      src={`${url.pathname}${url.search}`}
      alt=""
      width={width}
      height={height}
      loading="lazy"
    />
  );
};

const widthMap: Record<ThumbnailSize, number> = {
  w32h32: 32,
  w64h64: 64,
  w128h128: 128,
  w256h256: 256,
  w480h320: 480,
  w640h480: 640,
  w960h640: 960,
  w1024h768: 1024,
  w2048h1536: 2048,
};
