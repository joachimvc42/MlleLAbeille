import { HeartDashes } from "@/components/decor/HeartDashes";

/**
 * Editorial section heading: modest size, a stitched heart hem —
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
      <HeartDashes className="mt-4" />
      {intro && (
        <p className="mt-4 text-base leading-relaxed text-rose-ink/90">
          {intro}
        </p>
      )}
    </div>
  );
}
