import Image from "next/image";

/*
 * The real wildflower branch painted in the reference artwork, climbing
 * from the bottom-right of the window on every page — behind the content
 * (early in the DOM, so section washes and cards always sit above it).
 * The left side stays clear: the bookmark's own flowers are enough there.
 */
export function PageBlooms() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 hidden lg:block"
    >
      <Image
        src="/brand/flowers-corner-right.webp"
        alt=""
        width={148}
        height={344}
        sizes="132px"
        className="absolute bottom-0 right-2 h-auto w-[132px] opacity-90"
      />
    </div>
  );
}
