import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Craft Your Mix - Make a mix",
  description: "Create your custom mix with YouTube links and transition notes",
};

export default function CraftLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-150px,rgba(99,102,241,0.18),transparent_60%),radial-gradient(1000px_500px_at_10%_20%,rgba(251,191,36,0.12),transparent_60%),#0b0b0f] text-white">
      {children}
    </div>
  );
}

