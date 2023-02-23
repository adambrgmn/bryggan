'use client';

import Image, { ImageLoaderProps } from 'next/image';

import { config } from '@/lib/config';
import type { ThumbnailSize } from '@/lib/types/Dropbox';

interface PageThumbnailProps {
  url: string;
  className?: string;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({ url, className }) => {
  let width = widthMap['w256h256'];
  let height = Math.round(width / config['app.dropbox.aspect_ratio']);

  return (
    <Image
      className={className}
      src={url}
      alt=""
      width={width}
      height={height}
      sizes="(max-width: 640px) 50vw,
             (max-width: 1024px) 25vw,
             17vw"
      loader={loader}
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

function loader(props: ImageLoaderProps) {
  let proxy = new URL(props.src);
  let arg = JSON.parse(proxy.searchParams.get('arg') ?? '{}');
  proxy.searchParams.set(
    'arg',
    JSON.stringify({ ...arg, format: 'png', mode: 'fitone_bestfit', size: getThumbnailSize(props.width) }),
  );

  return proxy.toString();
}

function getThumbnailSize(width: number) {
  for (let [size, maxW] of Object.entries(widthMap) as [ThumbnailSize, number][]) {
    if (width < maxW) return size;
  }

  return 'w2048h1536' as const;
}
