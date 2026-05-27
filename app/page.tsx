import { NoiseFlowClient as NoiseFlow } from "@/components/noise-flow-client";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:py-16">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Explain my car noise
          </h1>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
            Describe a weird sound your car is making. We&apos;ll turn it into a list of
            possible causes and a summary you can share with a mechanic. Takes under 2 minutes.
          </p>
        </header>
        <NoiseFlow />
        <footer className="mt-10 text-xs text-zinc-500 dark:text-zinc-500">
          This isn&apos;t a diagnostic tool — only a mechanic can confirm what&apos;s actually
          wrong. Suggestions are possibilities, not guarantees.
        </footer>
      </main>
    </div>
  );
}
