// PROTOTYPE - throwaway (wayfinder #96). Stand-in media for Bondsmith.
export interface FakeMediaItem {
  readonly label: string;
  readonly caption: string;
  readonly seconds: number;
  readonly hue: number;
}

/** Five short capability clips - the slider / row-list material. */
export const shortClips: readonly FakeMediaItem[] = [
  {
    label: "Draft a spec from one sentence",
    caption:
      "One sentence in, a phase-contracted spec out: Bondsmith fills the requirement table itself and refuses to advance until every field is answered.",
    seconds: 14,
    hue: 210,
  },
  {
    label: "Phase gate rejects a skipped contract",
    caption:
      "Try to jump from spec to implementation and the typed phase contract - not an LLM's judgement - blocks the transition and says which field is missing.",
    seconds: 12,
    hue: 260,
  },
  {
    label: "Task graph fans out in parallel",
    caption:
      "Independent tasks are dispatched concurrently; the graph view shows which are blocked and on what.",
    seconds: 15,
    hue: 160,
  },
  {
    label: "Validation gates run and report",
    caption:
      "Lint, type-check and tests run as declared gates; a blocking failure stops the slice rather than being reasoned around.",
    seconds: 13,
    hue: 30,
  },
  {
    label: "Ship: branch, commit, PR",
    caption: "The finished slice leaves as a branch and a PR with the spec quoted in the body.",
    seconds: 11,
    hue: 340,
  },
];

/** One long walkthrough clip + supporting stills - variant B material. */
export const longClip: FakeMediaItem = {
  label: "Full walkthrough: sentence to merged PR",
  caption:
    "A single pass through the whole workflow engine: spec, phase gates, parallel tasks, validation, ship.",
  seconds: 95,
  hue: 210,
};

export const stills: readonly FakeMediaItem[] = shortClips.map((clip) => ({ ...clip, seconds: 0 }));
