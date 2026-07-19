import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { navItems } from "@/data/navItems";

/**
 * Post-confirm landing route: Buttondown 302s here after a reader clicks the
 * confirmation link in their email (redirect target set in the Buttondown
 * dashboard, not in code). Server component (SSG), same chrome pattern as
 * `/thanks`.
 */
export default function ConfirmedPage() {
  return (
    <div className="flex min-h-dvh flex-col gap-10">
      <Header items={navItems} />
      <main className="mx-auto flex w-full max-w-content flex-1 flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
          You&apos;re subscribed
        </h1>
        <p className="text-lg text-muted-foreground">
          Your subscription is confirmed - new posts will land straight in your inbox.
        </p>
      </main>
      <Footer />
    </div>
  );
}
