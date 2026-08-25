/**
 * Renders one `**highlighted**` span inside a translated string — the hero title's original
 * trick, now shared. Copy like "Alumni who made it, **on record**." keeps the emphasis where
 * the sentence needs it, which is rarely the same position once the sentence is in Indonesian.
 * `className` decides whether that span reads as accent colour or bold.
 */
export default function Marked({
  text,
  className = "text-accent",
}: {
  text: string;
  className?: string;
}) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={className}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
