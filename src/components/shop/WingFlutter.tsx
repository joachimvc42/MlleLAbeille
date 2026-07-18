import Image from "next/image";

/*
 * Wing-only hover animation for the raster bees: two extra copies of the
 * same picture, soft-masked down to the wing zones (see .wing-layer in
 * globals.css) and rocked from the wing roots while the base picture and
 * the tile stay perfectly still. Same optimized URL, so no extra download.
 */
export function WingFlutter({ src, sizes }: { src: string; sizes: string }) {
  return (
    <>
      <span aria-hidden="true" className="wing-layer wing-layer-left">
        <Image
          src={src}
          alt=""
          width={800}
          height={800}
          sizes={sizes}
          className="aspect-square h-full w-full object-cover"
        />
      </span>
      <span aria-hidden="true" className="wing-layer wing-layer-right">
        <Image
          src={src}
          alt=""
          width={800}
          height={800}
          sizes={sizes}
          className="aspect-square h-full w-full object-cover"
        />
      </span>
    </>
  );
}
