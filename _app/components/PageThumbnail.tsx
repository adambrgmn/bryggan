import { config } from '_app/config';
import type { ThumbnailSize } from '_app/types/Dropbox';
import classNames from 'classnames';

interface PageThumbnailProps {
  url: string;
  className?: string;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({ url, className }) => {
  let width = widthMap['w480h320'];
  let height = Math.round(width / config['app.dropbox.aspect_ratio']);

  const src = (size: ThumbnailSize, skipW = false) => {
    let proxy = new URL(url);
    let arg = JSON.parse(proxy.searchParams.get('arg') ?? '{}');
    arg.size = size;
    arg.format = 'png';
    proxy.searchParams.set('arg', JSON.stringify(arg));

    if (skipW) return proxy.toString();

    return `${proxy.toString()} ${width}w`;
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
        className={classNames('aspect-paper h-auto w-full', className)}
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
