"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  duration?: number;
}

export const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      className,
      reverse,
      pauseOnHover = false,
      children,
      vertical = false,
      repeat = 4,
      duration = 20,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const scrollerRef = React.useRef<HTMLUListElement>(null);

    React.useEffect(() => {
      addAnimation();
    }, []);

    const addAnimation = () => {
      if (containerRef.current && scrollerRef.current) {
        const scrollerContent = Array.from(scrollerRef.current.children);

        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true) as HTMLElement;
          if (scrollerRef.current) {
            scrollerRef.current.appendChild(duplicatedItem);
          }
        });
      }
    };

    const speed = duration;
    const direction = reverse ? "reverse" : "forward";
    const scrollerClass = cn(
      "flex shrink-0 gap-4 w-max flex-nowrap",
      vertical && "flex-col",
    );

    return (
      <div
        ref={ref}
        className={cn("overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]", className)}
        {...props}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={containerRef}
          className={cn(
            "flex w-max flex-row gap-4",
            vertical ? "animate-marquee-vertical flex-col" : "animate-marquee",
            pauseOnHover && isHovered && "animation-play-state-paused",
          )}
          style={{
            "--marquee-duration": `${speed}s`,
            "--marquee-direction": direction === "forward" ? "normal" : "reverse",
            "--gap": "1rem",
          } as React.CSSProperties}
        >
          <ul ref={scrollerRef} className={scrollerClass}>
            {children}
          </ul>
        </div>
      </div>
    );
  },
);

Marquee.displayName = "Marquee"; 