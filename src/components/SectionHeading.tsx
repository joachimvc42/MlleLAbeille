/**
 * Editorial section heading: modest size, a small heart underline —
 * never an oversized landing-page shout.
 */
export function SectionHeading({
  title,
  intro,
  id,
}: {
  title: string;
  intro?: string;
  id?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 id={id} className="text-3xl font-semibold text-rose sm:text-4xl">
        {title}
      </h2>
      <div
        aria-hidden="true"
        className="mt-3 flex items-center justify-center gap-3 text-rose/50"
      >
        <span className="h-px w-16 bg-current opacity-50" />
        <span className="text-sm">♥</span>
        <span className="h-px w-16 bg-current opacity-50" />
      </div>
      {intro && (
        <p className="mt-4 text-base leading-relaxed text-rose-ink/90">
          {intro}
        </p>
      )}
    </div>
  );
}
