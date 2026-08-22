"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { MediaFrame } from "./MediaFrame";

interface ClipPlaybackGroupApi {
  registerFrame: (id: string, el: HTMLElement, onActivate: () => void) => void;
  unregisterFrame: (id: string) => void;
  attachVideo: (id: string, el: HTMLVideoElement | null) => void;
  markHandPaused: (id: string, handPaused: boolean) => void;
  notifyPlaying: (id: string) => void;
}

const ClipPlaybackContext = createContext<ClipPlaybackGroupApi | null>(null);

export interface ClipPlaybackGroupProps {
  readonly children: React.ReactNode;
}

/** Mutes and plays a `<video>` - the one call site every play attempt (the
 *  group's `applyActive`, a row's own mount effect, and its toggle) goes
 *  through, so muting-before-play is never duplicated or forgotten. */
function playMuted(video: HTMLVideoElement): Promise<void> {
  video.muted = true;
  return video.play();
}

interface RowEntry {
  el: HTMLElement;
  onActivate: () => void;
  video: HTMLVideoElement | null;
}

/**
 * Playback coordinator for a group of `ClipRow`s (FR-10 one-clip-at-a-time,
 * sticky-pause, FR-10 playback policy): one `IntersectionObserver` over
 * every registered row's frame element (observed from mount, whether or not
 * a `<video>` has been mounted yet). The highest-ratio visible row that
 * isn't in the per-instance hand-paused set becomes "active": if it already
 * has a mounted `<video>`, that video is played; if it doesn't, the row's
 * `onActivate` callback is invoked as an implicit play request (mounting the
 * video and playing it muted) - the row itself is responsible for declining
 * that request under reduced motion. Every other row with a mounted video is
 * paused. `visibilitychange` pauses on hidden and resumes the (still)
 * most-visible non-hand-paused row on visible - the same gate makes bfcache
 * restore safe. Hand-pause is sticky for the component instance only (never
 * persisted, never resumed by the observer). Guards jsdom/no-
 * `IntersectionObserver` environments the same way `useActiveHeading` does -
 * playback coordination is a progressive enhancement over the poster-first,
 * no-JS-safe base.
 */
export function ClipPlaybackGroup({ children }: ClipPlaybackGroupProps) {
  const rowsRef = useRef<Map<string, RowEntry>>(new Map());
  const ratiosRef = useRef<Map<string, number>>(new Map());
  const handPausedRef = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const applyActive = useCallback(() => {
    let bestId: string | null = null;
    let bestRatio = 0;
    for (const [id, ratio] of ratiosRef.current) {
      if (handPausedRef.current.has(id)) continue;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = id;
      }
    }

    for (const [id, row] of rowsRef.current) {
      if (id === bestId && bestRatio > 0) {
        if (row.video) {
          playMuted(row.video).catch(() => {
            // Autoplay rejection: the row's own `<video>` never fires `play`,
            // so its toggle stays in Play state - nothing to do here.
          });
        } else {
          row.onActivate();
        }
      } else if (row.video) {
        row.video.pause();
      }
    }
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.clipRowId;
          if (!id) continue;
          ratiosRef.current.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        applyActive();
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    observerRef.current = observer;

    for (const row of rowsRef.current.values()) observer.observe(row.el);

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        for (const row of rowsRef.current.values()) row.video?.pause();
      } else {
        applyActive();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      observerRef.current = null;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [applyActive]);

  const api = useMemo<ClipPlaybackGroupApi>(
    () => ({
      registerFrame: (id, el, onActivate) => {
        const existing = rowsRef.current.get(id);
        rowsRef.current.set(id, { el, onActivate, video: existing?.video ?? null });
        el.dataset.clipRowId = id;
        observerRef.current?.observe(el);
      },
      unregisterFrame: (id) => {
        const row = rowsRef.current.get(id);
        if (row) observerRef.current?.unobserve(row.el);
        rowsRef.current.delete(id);
        ratiosRef.current.delete(id);
        handPausedRef.current.delete(id);
      },
      attachVideo: (id, el) => {
        const row = rowsRef.current.get(id);
        if (row) row.video = el;
      },
      markHandPaused: (id, handPaused) => {
        if (handPaused) handPausedRef.current.add(id);
        else handPausedRef.current.delete(id);
        applyActive();
      },
      // A row's own `<video>` firing its real `play` DOM event (finding 2,
      // DOM is truth) is the one-clip-at-a-time enforcement point that
      // covers every path a row can start playing - the observer's
      // ratio-driven `applyActive`, and an explicit user Play click, which
      // can start a row the observer wouldn't itself have chosen (e.g. a
      // row below the fold). Whichever row's video actually starts, every
      // other row's video is paused immediately - never two decided
      // "active" rows racing separately.
      notifyPlaying: (id) => {
        for (const [otherId, row] of rowsRef.current) {
          if (otherId !== id) row.video?.pause();
        }
      },
    }),
    [applyActive]
  );

  return <ClipPlaybackContext.Provider value={api}>{children}</ClipPlaybackContext.Provider>;
}

export interface ClipRowProps {
  readonly id: string;
  readonly clipSrc: string;
  readonly posterSrc: string;
  readonly label: string;
  readonly description: string;
  readonly priority?: boolean;
  readonly index: number;
  readonly total: number;
}

/**
 * A single silent-clip Capability media row (FR-10, normative contract - see
 * spec.md FR-10 for the full a11y/playback list). `<figure>` wraps only the
 * frame; `<figcaption>` carries `description` (the SC 1.2.1 alternative).
 * The frame element registers with an ancestor `ClipPlaybackGroup` (if any)
 * at mount time, before any `<video>` exists, so the observer can track its
 * visibility ratio from the start. `<video>` itself still mounts only once
 * playback is requested (poster-first, zero video bytes until a play
 * request) - either the user's own Play click, or the group selecting this
 * row as the highest-ratio visible row (an implicit play request), unless
 * `prefers-reduced-motion` is on or this row has been hand-paused. The play
 * toggle mounts only after hydration (`mounted`), so no-JS/pre-hydration
 * HTML shows poster + caption with no dead control. `playing` is never set
 * from a `play()`/`pause()` call directly - the `<video>`'s own
 * `onPlay`/`onPause` DOM events are the only source of truth, so the toggle
 * can never desync from a row the `ClipPlaybackGroup` paused out from under
 * it.
 */
export function ClipRow({
  id,
  clipSrc,
  posterSrc,
  label,
  description,
  priority,
  index,
  total,
}: ClipRowProps) {
  const group = useContext(ClipPlaybackContext);
  const reducedMotion = usePrefersReducedMotion(true);

  const [mounted, setMounted] = useState(false);
  const [videoRequested, setVideoRequested] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Register the frame element with the playback group at mount - the
  // observer needs to see every row, not just ones already playing, to pick
  // the highest-ratio visible one. `onActivate` is the group's implicit
  // play request for this row; it declines under reduced motion (never
  // autoplay) - an explicit Play click always goes through `requestPlay`
  // instead, which has no such restriction.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !group) return;
    group.registerFrame(id, frame, () => {
      if (reducedMotion) return;
      setVideoRequested(true);
      setLoading(true);
    });
    return () => group.unregisterFrame(id);
  }, [group, id, reducedMotion]);

  // Once the <video> mounts (videoRequested), attach it to the playback
  // group (if any) and attempt playback once - either the toggle click or
  // the group's implicit activation is the play intent. `playing` itself is
  // set by the video's own `onPlay`/`onPause` handlers below, never here.
  // `loop` is set here too (rather than a separate effect keyed on
  // `reducedMotion`) since it only needs to be current as of mount time -
  // reduced-motion is read from `usePrefersReducedMotion` before the video
  // ever exists, so there is no later change to react to for a given video.
  useEffect(() => {
    if (!videoRequested) return;
    const video = videoRef.current;
    if (!video) return;

    video.loop = !reducedMotion;
    group?.attachVideo(id, video);
    setLoading(true);
    playMuted(video)
      .catch(() => {
        // Rejection: the video never fires `play`, so `playing` correctly
        // stays false - nothing else to set here.
      })
      .finally(() => setLoading(false));

    return () => group?.attachVideo(id, null);
  }, [videoRequested, group, id, reducedMotion]);

  const requestPlay = useCallback(async () => {
    group?.markHandPaused(id, false);
    if (!videoRequested) {
      setVideoRequested(true);
      setLoading(true);
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    try {
      await playMuted(video);
    } catch {
      // Rejection: `playing` stays false via the video's own events.
    }
  }, [videoRequested, group, id]);

  const requestPause = useCallback(() => {
    const video = videoRef.current;
    if (video) video.pause();
    group?.markHandPaused(id, true);
  }, [group, id]);

  const handleEnded = useCallback(() => {
    if (!reducedMotion) return;
    // Reduced motion never loops (`video.loop` is false) - an ended clip
    // must stay ended, not be restarted by the group's observer on the next
    // scroll. Sticky-pausing it with the group achieves that; `requestPlay`
    // clears it the same way a hand-pause does.
    setPlaying(false);
    group?.markHandPaused(id, true);
  }, [reducedMotion, group, id]);

  const playLabel = label ? `Play ${label}` : `Play clip ${index} of ${total}`;
  const pauseLabel = label ? `Pause ${label}` : `Pause clip ${index} of ${total}`;

  return (
    <figure className="flex flex-col gap-2">
      <div ref={frameRef} className="relative">
        <MediaFrame src={posterSrc} alt="" priority={priority} />
        {videoRequested && (
          <video
            ref={videoRef}
            src={clipSrc}
            muted
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            preload="none"
            aria-label={label}
            onEnded={handleEnded}
            onPlay={() => {
              setPlaying(true);
              group?.notifyPlaying(id);
            }}
            onPause={() => setPlaying(false)}
            onPlaying={() => setLoading(false)}
            className="absolute inset-0 h-full w-full rounded-lg object-contain"
          />
        )}
        {mounted && (
          <button
            type="button"
            onClick={playing ? requestPause : requestPlay}
            aria-label={playing ? pauseLabel : playLabel}
            aria-busy={loading}
            className="absolute bottom-3 left-3 flex size-11 items-center justify-center rounded-full bg-overlay text-overlay-foreground ring-offset-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {playing ? (
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 fill-current">
                <rect x="3" y="2" width="3" height="12" />
                <rect x="10" y="2" width="3" height="12" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 fill-current">
                <path d="M4 2l10 6-10 6z" />
              </svg>
            )}
          </button>
        )}
      </div>
      <figcaption className="text-sm text-muted-foreground">{description}</figcaption>
    </figure>
  );
}
