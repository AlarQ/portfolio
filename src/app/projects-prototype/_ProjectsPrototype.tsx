"use client";

/**
 * PROTOTYPE — throwaway client shell. Reads `?variant=` and swaps the rendered
 * subtree; real Header/Footer stay mounted around it so each variant is judged
 * against the app's density, not in a vacuum. Delete when a variant wins.
 */
import { useSearchParams } from "next/navigation";
import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { navItems } from "@/data/navItems";
import { PrototypeSwitcher, type VariantDef } from "./_PrototypeSwitcher";
import { VariantA } from "./_VariantA";
import { VariantB } from "./_VariantB";
import { VariantC } from "./_VariantC";
import { VariantD } from "./_VariantD";

const VARIANTS: readonly VariantDef[] = [
  { key: "A", name: "Split (desktop-first)" },
  { key: "B", name: "Accordion (expand inline)" },
  { key: "C", name: "Tab strip (sticky pills)" },
  { key: "D", name: "Split + mobile sheet" },
];

export function ProjectsPrototype() {
  const params = useSearchParams();
  const current = (params.get("variant") ?? "A").toUpperCase();
  const key = VARIANTS.some((v) => v.key === current) ? current : "A";

  return (
    <div className="flex min-h-dvh flex-col gap-16 bg-background">
      <Header items={navItems} activeHref="/projects" title="PROJECTS" />

      <main className="mx-auto flex w-full max-w-content flex-1 flex-col gap-8 px-6 pb-24">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-foreground">Projects</h1>
          <p className="text-lg text-muted-foreground">
            What I&apos;m building — current state, status, and tech stack.
          </p>
        </header>

        {key === "A" && <VariantA />}
        {key === "B" && <VariantB />}
        {key === "C" && <VariantC />}
        {key === "D" && <VariantD />}
      </main>

      <Footer />
      <PrototypeSwitcher variants={VARIANTS} current={key} />
    </div>
  );
}
