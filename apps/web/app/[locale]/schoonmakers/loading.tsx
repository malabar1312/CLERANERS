import { AuthNav } from "@/components/layout/auth-nav";
import { Container } from "@/components/layout/container";
import { Skeleton, CleanersGridSkeleton } from "@/components/ui/skeleton";

/** Instant loading state while /schoonmakers data resolves. */
export default function SchoonmakersLoading() {
  return (
    <>
      <AuthNav />
      <main className="bg-[var(--color-white)] text-[var(--color-ink)]">
        <header className="border-b border-[var(--color-line)] pt-[calc(var(--nav-h-sm)+3.5rem)] pb-14">
          <Container size="wide">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-5 h-10 w-72" />
            <Skeleton className="mt-5 h-5 w-96" />
          </Container>
        </header>
        <section className="py-[var(--space-section)]">
          <Container size="wide">
            <div className="flex gap-2.5 border-y border-[var(--color-line)] py-5">
              <Skeleton className="h-11 w-32 rounded-full" />
              <Skeleton className="h-11 w-32 rounded-full" />
              <Skeleton className="h-11 w-32 rounded-full" />
            </div>
            <div className="mt-8">
              <CleanersGridSkeleton />
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
