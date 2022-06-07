import { config } from '~/config';
import type { ThumbnailSize } from '~/types/Dropbox';

interface PagePreviewProps {
  path: string;
  size?: ThumbnailSize;
}

export const PagePreview: React.FC<PagePreviewProps> = ({ path, size = 'w128h128' }) => {
  let url = new URL('.' + path, 'http://localhost:3000/api/preview/');
  url.searchParams.set('size', size);

  let width = widthMap[size];
  let height = Math.round(width / config['app.dropbox.aspect_ratio']);

  return (
    <img
      className="text-gray-700 shadow-md p-3 border-gray-300 ml-4 h-24 flex border-2"
      src={`${url.pathname}${url.search}`}
      alt=""
      width={width}
      height={height}
      loading="lazy"
    />
  );
};

const widthMap: Record<ThumbnailSize, number> = {
  w128h128: 128,
  w256h256: 256,
  w32h32: 32,
  w64h64: 64,
  w480h320: 480,
  w640h480: 640,
  w960h640: 960,
  w1024h768: 1024,
  w2048h1536: 2048,
};
