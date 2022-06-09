import classNames from 'classnames';

import { config } from '~/config';
import type { ThumbnailSize } from '~/types/Dropbox';

interface PagePreviewProps {
  path: string;
  size?: ThumbnailSize;
  className?: string;
}

export const PagePreview: React.FC<PagePreviewProps> = ({ path, className }) => {
  let width = widthMap['w480h320'];
  let height = Math.round(width / config['app.dropbox.aspect_ratio']);

  const src = (size: ThumbnailSize, skipW = false) => {
    let url = new URL('.' + path, 'http://localhost:3000/api/preview/');
    url.searchParams.set('size', size);
    url.searchParams.set('format', 'png');

    let base = `${url.pathname}${url.search}`;
    if (skipW) return base;

    let width = widthMap[size];
    return `${base} ${width}w`;
  };

  return (
    <picture>
      <source srcSet={src('w256h256')} media="(min-width: 1536px)" />
      <source srcSet={src('w256h256')} media="(min-width: 1280px)" />
      <source srcSet={src('w256h256')} media="(min-width: 1024px)" />
      <source srcSet={src('w256h256')} media="(min-width: 768px)" />
      <source srcSet={src('w128h128')} media="(min-width: 640px)" />
      <source srcSet={src('w256h256')} media="(min-width: 425px)" />
      <source srcSet={src('w128h128')} />
      <img
        className={classNames('aspect-paper w-full h-auto', className)}
        src={src('w480h320', true)}
        alt=""
        width={width}
        height={height}
        loading="lazy"
      />
    </picture>
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
