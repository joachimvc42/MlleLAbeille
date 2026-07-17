/**
 * The little "---- ♥ ----" hem that underlines headings in the reference
 * artwork: two runs of stitch dashes meeting at a heart.
 */
export function HeartDashes({
  className = "",
  center = true,
}: {
  className?: string;
  center?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center gap-3 text-rose/60 ${center ? "justify-center" : ""} ${className}`}
    >
      <span className="h-0 w-14 border-t-2 border-dashed border-current opacity-70" />
      <span className="text-sm leading-none">♥</span>
      <span className="h-0 w-14 border-t-2 border-dashed border-current opacity-70" />
    </div>
  );
}
