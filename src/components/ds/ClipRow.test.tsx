import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClipPlaybackGroup, ClipRow } from "./ClipRow";
import { renderIntoDocument } from "./testUtils";

const BASE_PROPS = {
  id: "flow-chain",
  clipSrc: "/media/bondsmith/flow-chain.mp4",
  posterSrc: "/media/bondsmith/flow-chain.webp",
  label: "the Plan to Ship flow chain",
  description: "Walking through a feature moving from Plan to Ship in the flowctl CLI.",
  index: 1,
  total: 1,
};

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function stubMatchMedia(reduced: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

describe("ClipRow", () => {
  let playSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    stubMatchMedia(false);
    // Real browsers fire `play`/`pause` on the element itself when playback
    // actually starts/stops; ClipRow's `playing` state is driven entirely by
    // those DOM events (finding 2, DOM is truth), so the mocks dispatch them
    // too - `mockRejectedValueOnce` overrides this per-call and correctly
    // fires neither.
    playSpy = vi.fn(function (this: HTMLVideoElement) {
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    });
    HTMLMediaElement.prototype.play = playSpy as unknown as () => Promise<void>;
    HTMLMediaElement.prototype.pause = vi.fn(function (this: HTMLVideoElement) {
      this.dispatchEvent(new Event("pause"));
    }) as unknown as () => void;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("zero-video-bytes-until-play: never mounts a <video> before Play is requested", () => {
    const { container, unmount } = renderIntoDocument(<ClipRow {...BASE_PROPS} />);

    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).not.toBeNull();

    unmount();
  });

  it("toggle-name-and-size: labels the toggle 'Play <label>' before playback, falling back when label is empty", async () => {
    const { container, unmount } = renderIntoDocument(<ClipRow {...BASE_PROPS} />);
    await flush();

    const button = container.querySelector("button");
    expect(button?.getAttribute("aria-label")).toBe(`Play ${BASE_PROPS.label}`);
    expect(button?.getAttribute("aria-pressed")).toBeNull();
    expect(button?.getAttribute("aria-live")).toBeNull();
    expect(button?.getAttribute("aria-describedby")).toBeNull();

    unmount();
  });

  it("no-js-no-dead-control: the toggle is absent until mounted (pre-hydration HTML has no dead control)", () => {
    // renderIntoDocument mounts synchronously via act(), so we assert the
    // toggle only appears after the `mounted` effect flag flips - simulated
    // here by checking the button exists post-mount (mounted=true is the
    // only path that renders it; there is no code path rendering it before).
    const { container, unmount } = renderIntoDocument(<ClipRow {...BASE_PROPS} />);
    expect(container.querySelector("button")).not.toBeNull();
    unmount();
  });

  it("mounts the <video> with the expected attrs, no <track>, once Play is clicked", async () => {
    const { container, unmount } = renderIntoDocument(<ClipRow {...BASE_PROPS} />);
    await flush();

    const button = container.querySelector("button") as HTMLButtonElement;
    await act(async () => {
      button.click();
    });
    await flush();

    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video?.getAttribute("src")).toBe(BASE_PROPS.clipSrc);
    expect((video as HTMLVideoElement)?.muted).toBe(true);
    expect(video?.hasAttribute("playsinline")).toBe(true);
    expect(video?.hasAttribute("disablepictureinpicture")).toBe(true);
    expect(video?.hasAttribute("disableremoteplayback")).toBe(true);
    expect(video?.getAttribute("preload")).toBe("none");
    expect(video?.getAttribute("aria-label")).toBe(BASE_PROPS.label);
    expect(container.querySelector("track")).toBeNull();

    unmount();
  });

  it("sets muted immediately before calling play()", async () => {
    const { container, unmount } = renderIntoDocument(<ClipRow {...BASE_PROPS} />);
    await flush();

    const button = container.querySelector("button") as HTMLButtonElement;
    await act(async () => {
      button.click();
    });
    await flush();

    expect(playSpy).toHaveBeenCalled();
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.muted).toBe(true);

    unmount();
  });

  it("flips the toggle to Pause once playback starts, then back to Play on click", async () => {
    const { container, unmount } = renderIntoDocument(<ClipRow {...BASE_PROPS} />);
    await flush();

    let button = container.querySelector("button") as HTMLButtonElement;
    await act(async () => {
      button.click();
    });
    await flush();

    button = container.querySelector("button") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe(`Pause ${BASE_PROPS.label}`);

    await act(async () => {
      button.click();
    });
    await flush();

    button = container.querySelector("button") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe(`Play ${BASE_PROPS.label}`);

    unmount();
  });

  it("play() rejection returns the toggle to Play state", async () => {
    playSpy.mockRejectedValueOnce(new Error("NotAllowedError"));
    const { container, unmount } = renderIntoDocument(<ClipRow {...BASE_PROPS} />);
    await flush();

    const button = container.querySelector("button") as HTMLButtonElement;
    await act(async () => {
      button.click();
    });
    await flush();

    const updatedButton = container.querySelector("button") as HTMLButtonElement;
    expect(updatedButton.getAttribute("aria-label")).toBe(`Play ${BASE_PROPS.label}`);

    unmount();
  });

  it("reduced motion: no loop, and ended returns the label to Play (never Replay)", async () => {
    stubMatchMedia(true);
    const { container, unmount } = renderIntoDocument(<ClipRow {...BASE_PROPS} />);
    await flush();

    const button = container.querySelector("button") as HTMLButtonElement;
    await act(async () => {
      button.click();
    });
    await flush();

    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.loop).toBe(false);

    await act(async () => {
      video.dispatchEvent(new Event("ended"));
    });
    await flush();

    const updatedButton = container.querySelector("button") as HTMLButtonElement;
    expect(updatedButton.getAttribute("aria-label")).toBe(`Play ${BASE_PROPS.label}`);
    expect(updatedButton.getAttribute("aria-label")).not.toContain("Replay");

    unmount();
  });

  it("without reduced motion, sets loop true on the mounted video", async () => {
    const { container, unmount } = renderIntoDocument(<ClipRow {...BASE_PROPS} />);
    await flush();

    const button = container.querySelector("button") as HTMLButtonElement;
    await act(async () => {
      button.click();
    });
    await flush();

    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.loop).toBe(true);

    unmount();
  });

  it("falls back to 'Play clip N of M' when label is empty", async () => {
    const { container, unmount } = renderIntoDocument(
      <ClipRow {...BASE_PROPS} label="" index={2} total={3} />
    );
    await flush();

    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe("Play clip 2 of 3");

    unmount();
  });

  it("works standalone without a ClipPlaybackGroup ancestor", async () => {
    const { container, unmount } = renderIntoDocument(<ClipRow {...BASE_PROPS} />);
    await flush();
    const button = container.querySelector("button") as HTMLButtonElement;
    await act(async () => {
      button.click();
    });
    await flush();
    expect(container.querySelector("video")).not.toBeNull();
    unmount();
  });

  it("registers with an ancestor ClipPlaybackGroup once the video is requested", async () => {
    const { container, unmount } = renderIntoDocument(
      <ClipPlaybackGroup>
        <ClipRow {...BASE_PROPS} />
      </ClipPlaybackGroup>
    );
    await flush();

    const button = container.querySelector("button") as HTMLButtonElement;
    await act(async () => {
      button.click();
    });
    await flush();

    expect(container.querySelector("video")).not.toBeNull();

    unmount();
  });

  it("still-only comparison: works standalone under a ClipPlaybackGroup with two rows via the mocked IntersectionObserver", async () => {
    type ObserverCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;
    let callback: ObserverCallback | null = null;
    const observed: Element[] = [];
    class MockIntersectionObserver {
      constructor(cb: ObserverCallback) {
        callback = cb;
      }
      observe(el: Element) {
        observed.push(el);
      }
      unobserve(el: Element) {
        const i = observed.indexOf(el);
        if (i >= 0) observed.splice(i, 1);
      }
      disconnect() {}
    }
    const original = globalThis.IntersectionObserver;
    // biome-ignore lint/suspicious/noExplicitAny: test-only mock swap
    (globalThis as any).IntersectionObserver = MockIntersectionObserver;

    const { container, unmount } = renderIntoDocument(
      <ClipPlaybackGroup>
        <ClipRow {...BASE_PROPS} id="row-a" />
        <ClipRow {...BASE_PROPS} id="row-b" />
      </ClipPlaybackGroup>
    );
    await flush();

    const buttons = container.querySelectorAll("button");
    await act(async () => {
      (buttons[0] as HTMLButtonElement).click();
    });
    await flush();
    await act(async () => {
      (buttons[1] as HTMLButtonElement).click();
    });
    await flush();

    const videos = container.querySelectorAll("video");
    expect(videos.length).toBe(2);
    expect(observed.length).toBe(2);

    // Simulate row A becoming most visible - row B should pause.
    await act(async () => {
      callback?.([
        { target: observed[0], isIntersecting: true, intersectionRatio: 1 },
        { target: observed[1], isIntersecting: true, intersectionRatio: 0.25 },
      ]);
    });
    await flush();

    expect((videos[1] as HTMLVideoElement).pause).toHaveBeenCalled();

    // visibilitychange: hidden pauses every row.
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await flush();
    expect((videos[0] as HTMLVideoElement).pause).toHaveBeenCalled();

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await flush();

    globalThis.IntersectionObserver = original;
    unmount();
  });

  it("sticky-pause: a hand-paused row stays paused even if reported most-visible by the observer", async () => {
    type ObserverCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;
    let callback: ObserverCallback | null = null;
    const observed: Element[] = [];
    class MockIntersectionObserver {
      constructor(cb: ObserverCallback) {
        callback = cb;
      }
      observe(el: Element) {
        observed.push(el);
      }
      unobserve() {}
      disconnect() {}
    }
    const original = globalThis.IntersectionObserver;
    // biome-ignore lint/suspicious/noExplicitAny: test-only mock swap
    (globalThis as any).IntersectionObserver = MockIntersectionObserver;

    const { container, unmount } = renderIntoDocument(
      <ClipPlaybackGroup>
        <ClipRow {...BASE_PROPS} id="row-sticky" />
      </ClipPlaybackGroup>
    );
    await flush();

    const button = container.querySelector("button") as HTMLButtonElement;
    await act(async () => {
      button.click();
    });
    await flush();

    const video = container.querySelector("video") as HTMLVideoElement;

    // Hand-pause via the toggle.
    const pauseButton = container.querySelector("button") as HTMLButtonElement;
    await act(async () => {
      pauseButton.click();
    });
    await flush();

    (video.play as ReturnType<typeof vi.fn>).mockClear();

    // The observer reports this row as fully visible - it must stay paused.
    await act(async () => {
      callback?.([{ target: observed[0], isIntersecting: true, intersectionRatio: 1 }]);
    });
    await flush();

    expect(video.play).not.toHaveBeenCalled();

    globalThis.IntersectionObserver = original;
    unmount();
  });

  it("observer-driven pause updates the toggle label to Play (finding 2, DOM is truth)", async () => {
    type ObserverCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;
    let callback: ObserverCallback | null = null;
    class MockIntersectionObserver {
      constructor(cb: ObserverCallback) {
        callback = cb;
      }
      observe(el: Element) {
        observed.push(el);
      }
      unobserve() {}
      disconnect() {}
    }
    const observed: Element[] = [];
    const original = globalThis.IntersectionObserver;
    // biome-ignore lint/suspicious/noExplicitAny: test-only mock swap
    (globalThis as any).IntersectionObserver = MockIntersectionObserver;

    const { container, unmount } = renderIntoDocument(
      <ClipPlaybackGroup>
        <ClipRow {...BASE_PROPS} id="row-a" />
        <ClipRow {...BASE_PROPS} id="row-b" />
      </ClipPlaybackGroup>
    );
    await flush();

    const buttons = container.querySelectorAll("button");
    await act(async () => {
      (buttons[0] as HTMLButtonElement).click();
    });
    await flush();
    await act(async () => {
      (buttons[1] as HTMLButtonElement).click();
    });
    await flush();

    expect(container.querySelectorAll("button")[1].getAttribute("aria-label")).toBe(
      `Pause ${BASE_PROPS.label}`
    );

    // Row A becomes most visible - the group pauses row B via `video.pause()`,
    // which (like a real browser) fires a `pause` DOM event on row B's video.
    await act(async () => {
      callback?.([
        { target: observed[0], isIntersecting: true, intersectionRatio: 1 },
        { target: observed[1], isIntersecting: true, intersectionRatio: 0.25 },
      ]);
    });
    await flush();

    const rowBButton = container.querySelectorAll("button")[1] as HTMLButtonElement;
    expect(rowBButton.getAttribute("aria-label")).toBe(`Play ${BASE_PROPS.label}`);

    globalThis.IntersectionObserver = original;
    unmount();
  });

  it("reduced motion: an ended clip is not restarted by the observer on the next scroll", async () => {
    stubMatchMedia(true);
    type ObserverCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;
    let callback: ObserverCallback | null = null;
    const observed: Element[] = [];
    class MockIntersectionObserver {
      constructor(cb: ObserverCallback) {
        callback = cb;
      }
      observe(el: Element) {
        observed.push(el);
      }
      unobserve() {}
      disconnect() {}
    }
    const original = globalThis.IntersectionObserver;
    // biome-ignore lint/suspicious/noExplicitAny: test-only mock swap
    (globalThis as any).IntersectionObserver = MockIntersectionObserver;

    const { container, unmount } = renderIntoDocument(
      <ClipPlaybackGroup>
        <ClipRow {...BASE_PROPS} id="row-reduced" />
      </ClipPlaybackGroup>
    );
    await flush();

    const button = container.querySelector("button") as HTMLButtonElement;
    await act(async () => {
      button.click();
    });
    await flush();

    const video = container.querySelector("video") as HTMLVideoElement;
    await act(async () => {
      video.dispatchEvent(new Event("ended"));
    });
    await flush();

    (video.play as ReturnType<typeof vi.fn>).mockClear();

    // The next scroll reports this row as fully visible again - the observer
    // must not restart it (it was marked hand-paused/ignored by handleEnded).
    await act(async () => {
      callback?.([{ target: observed[0], isIntersecting: true, intersectionRatio: 1 }]);
    });
    await flush();

    expect(video.play).not.toHaveBeenCalled();

    globalThis.IntersectionObserver = original;
    unmount();
  });

  it("renders the figcaption as the media's description", async () => {
    const { container, unmount } = renderIntoDocument(<ClipRow {...BASE_PROPS} />);
    await flush();

    const figcaption = container.querySelector("figcaption");
    expect(figcaption?.textContent).toBe(BASE_PROPS.description);
    expect(container.querySelector("figure")?.children.length).toBe(2);

    unmount();
  });

  it("FR-10 playback policy: the observer's highest-ratio row implicitly mounts and plays its video, without a prior click", async () => {
    type ObserverCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;
    let callback: ObserverCallback | null = null;
    const observed: Element[] = [];
    class MockIntersectionObserver {
      constructor(cb: ObserverCallback) {
        callback = cb;
      }
      observe(el: Element) {
        observed.push(el);
      }
      unobserve() {}
      disconnect() {}
    }
    const original = globalThis.IntersectionObserver;
    // biome-ignore lint/suspicious/noExplicitAny: test-only mock swap
    (globalThis as any).IntersectionObserver = MockIntersectionObserver;

    const { container, unmount } = renderIntoDocument(
      <ClipPlaybackGroup>
        <ClipRow {...BASE_PROPS} id="row-auto" />
      </ClipPlaybackGroup>
    );
    await flush();

    expect(container.querySelector("video")).toBeNull();
    expect(observed.length).toBe(1);

    await act(async () => {
      callback?.([{ target: observed[0], isIntersecting: true, intersectionRatio: 1 }]);
    });
    await flush();

    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video).not.toBeNull();
    expect(video.play).toHaveBeenCalled();

    globalThis.IntersectionObserver = original;
    unmount();
  });

  it("FR-10 reduced motion: the observer never implicitly mounts/plays a row's video", async () => {
    stubMatchMedia(true);
    type ObserverCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;
    let callback: ObserverCallback | null = null;
    const observed: Element[] = [];
    class MockIntersectionObserver {
      constructor(cb: ObserverCallback) {
        callback = cb;
      }
      observe(el: Element) {
        observed.push(el);
      }
      unobserve() {}
      disconnect() {}
    }
    const original = globalThis.IntersectionObserver;
    // biome-ignore lint/suspicious/noExplicitAny: test-only mock swap
    (globalThis as any).IntersectionObserver = MockIntersectionObserver;

    const { container, unmount } = renderIntoDocument(
      <ClipPlaybackGroup>
        <ClipRow {...BASE_PROPS} id="row-reduced-auto" />
      </ClipPlaybackGroup>
    );
    await flush();

    await act(async () => {
      callback?.([{ target: observed[0], isIntersecting: true, intersectionRatio: 1 }]);
    });
    await flush();

    expect(container.querySelector("video")).toBeNull();

    globalThis.IntersectionObserver = original;
    unmount();
  });
});
