import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comparison History",
  description:
    "Browse, search, and manage your saved diff comparisons. Export and import comparison history.",
  alternates: {
    canonical: "/history",
  },
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
