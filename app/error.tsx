"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#f3efe6] px-6 py-16 text-[#1c1915]">
      <h1 className="font-grotesk text-3xl">This screen hit a problem.</h1>
      <p className="mt-3 max-w-prose">{error.message || "Try the screen again. The sample in this browser is still there."}</p>
      <button type="button" className="mt-6 rounded-full bg-[#1c1915] px-4 py-2 text-[#f6f1e6]" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
