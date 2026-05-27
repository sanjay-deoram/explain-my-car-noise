"use client";

import dynamic from "next/dynamic";

export const NoiseFlowClient = dynamic(
  () => import("@/components/noise-flow").then((m) => m.NoiseFlow),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
    ),
  },
);
