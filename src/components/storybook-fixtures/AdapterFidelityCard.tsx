import { Geist } from "next/font/google";
import Image from "next/image";

const geist = Geist({ subsets: ["latin"], variable: "--font-adapter-fidelity" });

/**
 * ADR-DS-1 spike fixture. Exercises `next/font` (a component using it) and
 * `next/image` (a story importing it) in one place so a single Storybook
 * story proves the `@storybook/nextjs` adapter mocks both - the two failure
 * signals the spike watches for are a raw-`<img>` warning (missing next/image
 * mock) and a font-loader console warning (missing next/font mock).
 */
export function AdapterFidelityCard() {
  return (
    <div className={geist.variable}>
      <Image src="/next.svg" alt="Next.js logo" width={90} height={20} priority />
    </div>
  );
}
