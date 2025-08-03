import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Flyer Themes - EventCraftAI",
  description: "Explore beautiful event flyer themes and get inspired for your next event",
};

export default function ThemesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {children}
    </div>
  );
} 