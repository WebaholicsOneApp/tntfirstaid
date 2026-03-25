import Image, { type ImageProps } from 'next/image';
import { isOptimizedImageHost } from '~/lib/utils';

export function ProductImage({ src, unoptimized, ...props }: ImageProps) {
  const shouldOptimize = typeof src === 'string' ? isOptimizedImageHost(src) : true;
  return <Image src={src} unoptimized={unoptimized ?? !shouldOptimize} {...props} />;
}
