import Image from "next/image";

/*
 * The real wildflowers painted in the reference artwork's bottom corners,
 * growing from the edges of the window on every page — behind the content
 * (early in the DOM, so section washes and cards always sit above them).
 * They follow the visitor through the whole shop without ever crowding
 * the reading area.
 */
export function PageBlooms() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 hidden lg:block"
    >
      <Image
        src="/brand/flowers-corner-left.webp"
        alt=""
        width={178}
        height={268}
        sizes="150px"
        className="absolute bottom-0 left-2 h-auto w-[150px] opacity-90"
      />
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
