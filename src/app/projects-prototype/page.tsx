/**
 * PROTOTYPE — throwaway route (`/projects-prototype`). Three structurally
 * different takes on the Projects surface, switchable via the floating bar or
 * `?variant=A|B|C`. NOT the real `/projects` route — it exists to answer "what
 * should the Projects tab look like?" and should be deleted once a variant wins
 * (fold the winner into a real `/projects` route + a `src/data` Project model).
 *
 * All four are the same master–detail idea (pick a project → see its brief);
 * B/C/D differ in how they behave on mobile.
 *
 *   A — Split           (list left, brief right — desktop-first, weak on mobile)
 *   B — Accordion       (tap a row, brief expands inline beneath it)
 *   C — Tab strip       (sticky scrollable pills + full-width brief below)
 *   D — Split + sheet   (A on desktop; tap opens a bottom sheet on mobile)
 *
 * See NOTES.md in this folder for the question and the verdict placeholder.
 */
import { Suspense } from "react";
import { ProjectsPrototype } from "./_ProjectsPrototype";

export default function ProjectsPrototypePage() {
  return (
    <Suspense>
      <ProjectsPrototype />
    </Suspense>
  );
}
