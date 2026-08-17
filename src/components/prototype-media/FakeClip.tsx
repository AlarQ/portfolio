// PROTOTYPE - throwaway (wayfinder #96). No ffmpeg on this box, so a "clip" is a
// faked screen recording: a looping animated panel with a moving cursor and a
// progress bar. Enough to judge layout, hierarchy and interaction cost - NOT
// enough to judge real video quality.
"use client";

export interface FakeClipProps {
  readonly label: string;
  readonly seconds: number;
  readonly hue: number;
  readonly active?: boolean;
}

export function FakeClip({ label, seconds, hue, active = true }: FakeClipProps) {
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted"
      style={{ backgroundImage: `linear-gradient(135deg, hsl(${hue} 40% 22%), hsl(${hue} 45% 12%))` }}
      data-fake-clip={label}
    >
      <div className="absolute inset-4 flex flex-col gap-2 opacity-70">
        {[80, 55, 68, 40, 72].map((w, i) => (
          <div
            key={w}
            className="h-2 rounded-pill bg-white/25 motion-safe:animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 180}ms` }}
          />
        ))}
      </div>
      <div
        className="absolute size-3 rounded-full bg-white/90 shadow motion-safe:animate-bounce"
        style={{ left: "62%", top: "58%" }}
      />
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/45 px-3 py-1.5 text-xs text-white">
        <span className="font-mono">{active ? "▶" : "❚❚"}</span>
        <span className="truncate">{label}</span>
        <span className="ml-auto font-mono">{seconds}s</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/70" style={{ width: active ? "45%" : "0%" }} />
    </div>
  );
}

export function FakeStill({ label, hue }: { readonly label: string; readonly hue: number }) {
  return (
    <figure className="flex flex-col gap-1.5">
      <div
        className="aspect-video w-full rounded-md border border-border"
        style={{ backgroundImage: `linear-gradient(135deg, hsl(${hue} 35% 30%), hsl(${hue} 40% 16%))` }}
      />
      <figcaption className="text-xs text-muted-foreground">{label}</figcaption>
    </figure>
  );
}
