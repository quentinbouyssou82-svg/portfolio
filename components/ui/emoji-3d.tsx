import { cn } from "@/lib/utils";

type Emoji3DProps = {
  emoji: string;
  className?: string;
};

/** Apple-style 3D emoji via CDN (iOS / Notion-like render). */
export function Emoji3D({ emoji, className }: Emoji3DProps) {
  const src = `https://emojicdn.elk.sh/${encodeURIComponent(emoji)}?style=apple`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      className={cn(
        "inline-block h-[1.15em] w-[1.15em] align-[-0.12em] select-none",
        className,
      )}
      loading="lazy"
      draggable={false}
    />
  );
}
