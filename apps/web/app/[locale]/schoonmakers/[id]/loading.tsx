import { AuthNav } from "@/components/layout/auth-nav";
import { Container } from "@/components/layout/container";
import { ProfileSkeleton } from "@/components/ui/skeleton";

/** Instant loading state while a cleaner profile resolves. */
export default function CleanerProfileLoading() {
  return (
    <>
      <AuthNav />
      <main className="min-h-screen bg-[var(--color-dark)] text-[var(--color-dark-ink)]">
        <Container size="wide" className="pt-[calc(var(--nav-h-sm)+2rem)] pb-[var(--space-section)]">
          <ProfileSkeleton />
        </Container>
      </main>
    </>
  );
}
