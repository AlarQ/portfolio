import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { navItems } from "@/data/navItems";

/**
 * First-party privacy page for the `Newsletter` form's privacy link. Minimal
 * prose covering what's collected, who processes it, and how to unsubscribe —
 * we now collect PII (email) via the direct-POST signup. Server component
 * (SSG), same chrome pattern as `/projects` and `/thanks`.
 */
export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col gap-10">
      <Header items={navItems} />
      <main className="mx-auto flex w-full max-w-content flex-1 flex-col gap-6 px-6 py-24">
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Privacy</h1>
        <p className="text-lg text-muted-foreground">
          The newsletter signup on this site collects only your email address. It is submitted
          directly to Buttondown, the third-party email service provider that sends and manages the
          newsletter — this site does not store your email itself.
        </p>
        <p className="text-lg text-muted-foreground">
          Every issue includes an unsubscribe link. You can also unsubscribe at any time by
          contacting the site owner.
        </p>
      </main>
      <Footer />
    </div>
  );
}
