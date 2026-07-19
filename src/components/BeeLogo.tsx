import Image from "next/image";

/**
 * The shop's bee mark: the real watercolour bee from the boutique's
 * artwork, cut out on transparency — same painted style as every other
 * bee the visitor meets.
 */
export function BeeLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo-bee.webp"
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      sizes="48px"
      className={className}
    />
  );
}
