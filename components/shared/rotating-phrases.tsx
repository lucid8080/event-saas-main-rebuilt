"use client";

import { useState, useEffect } from "react";

const phrases = [
  { text: "We're what happens when ChatGPT crashes an art party.", emoji: "🎨" },
  { text: "Imagine if ChatGPT and Banksy planned your event.", emoji: "🏴‍☠️" },
  { text: "Smarter than Canva. Cooler than your cousin's DJ flyer.", emoji: "🎵" },
  { text: "We make AI look like street art.", emoji: "🖼️" },
  { text: "AI-built. Artist-approved.", emoji: "✨" },
  { text: "If Banksy had a design bot.", emoji: "🤖" },
  { text: "Where ChatGPT meets creative mischief.", emoji: "😈" },
  { text: "Not your average flyer maker.", emoji: "🚀" },
  { text: "Talk to us nice. We'll design it better.", emoji: "💬" },
  { text: "We don't design invites. We spark conversations.", emoji: "💥" },
  { text: "Your vibe. Our algorithm. Let's make it loud.", emoji: "🔊" },
  { text: "Flyers so good, they RSVP themselves.", emoji: "📅" },
  { text: "It's like if AI got a degree in street style.", emoji: "🎓" },
  { text: "Built by ChatGPT's cousin who dropped out and started a design cult.", emoji: "👨‍🎨" },
  { text: "Corporate AI? Never heard of her.", emoji: "💅" },
  { text: "Rebels with a design engine.", emoji: "⚡" },
  { text: "We use AI to break the rules… beautifully.", emoji: "🎭" },
  { text: "Beautiful. Automated. Slightly unhinged.", emoji: "🎪" },
  { text: "Your event's first impression? We make it unforgettable.", emoji: "💫" },
  { text: "Flyers that slap. Powered by AI that snaps.", emoji: "👏" },
  { text: "From prompt to party—your flyer in seconds.", emoji: "⚡" },
  { text: "Invite that make people show up early.", emoji: "⏰" },
  { text: "Where your event gets its drip.", emoji: "💧" },
  { text: "Like ChatGPT… but it throws parties.", emoji: "🎉" },
];

export function RotatingPhrases() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-sm text-muted-foreground/80 font-medium tracking-wide">
      <span className="inline-block transition-all duration-500 ease-in-out">
        {phrases[currentIndex].emoji} {phrases[currentIndex].text}
      </span>
    </div>
  );
} 