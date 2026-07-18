import { FlowerCluster } from "./FlowerCluster";

/*
 * Wildflowers growing from the bottom corners of the window, on every page
 * — painted on the wall behind the content (early in the DOM, so section
 * washes and cards always sit above them). They follow the visitor through
 * the whole shop without ever crowding the reading area.
 */
export function PageBlooms() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 hidden lg:block"
    >
      <FlowerCluster className="absolute bottom-1 left-5 h-36 w-30 opacity-75" />
      <FlowerCluster
        flip
        className="absolute bottom-1 right-5 h-36 w-30 opacity-75"
      />
    </div>
  );
}
