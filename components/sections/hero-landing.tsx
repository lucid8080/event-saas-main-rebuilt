"use client";

import Link from "next/link";
import { useState } from "react";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";
import { cn, nFormatter } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { Marquee3D } from "@/components/magicui/marquee-3d";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import { RotatingPhrases } from "@/components/shared/rotating-phrases";
import { ClientMarquee } from "@/components/sections/client-marquee";

export default function HeroLanding() {
  const [astronautImage, setAstronautImage] = useState("/astronaut-rocket.png");
  const [isHolding, setIsHolding] = useState(false);

  const handleMouseDown = () => {
    setIsHolding(true);
    setAstronautImage("/astronaut-rocket2.png");
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    setAstronautImage("/astronaut-rocket.png");
  };

  const avatars = [
    {
      imageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
      profileUrl: "#",
    },
    {
      imageUrl: "https://randomuser.me/api/portraits/women/2.jpg",
      profileUrl: "#",
    },
    {
      imageUrl: "https://randomuser.me/api/portraits/men/3.jpg",
      profileUrl: "#",
    },
    {
      imageUrl: "https://randomuser.me/api/portraits/women/4.jpg",
      profileUrl: "#",
    },
    {
      imageUrl: "https://randomuser.me/api/portraits/men/5.jpg",
      profileUrl: "#",
    },
    {
      imageUrl: "https://randomuser.me/api/portraits/women/6.jpg",
      profileUrl: "#",
    },
  ];

  return (
    <section className="relative py-12 space-y-6 sm:py-20 lg:py-20 overflow-hidden">
      {/* Background 3D Marquee Effect - Now client-side */}
      <ClientMarquee />
      
      {/* Content */}
      <div className="container relative flex flex-col max-w-5xl text-center z-10 items-center gap-5">
        <RotatingPhrases />

        <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-urban font-extrabold tracking-tight drop-shadow-2xl">
          Rocket-Speed
          <img 
            id="hero-astronaut-image"
            src={astronautImage}
            alt="Astronaut riding rocket" 
            className="inline-block w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain animate-logo-spin cursor-pointer"
            draggable="false"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          Flyers{" "}
          <span className="text-gradient_indigo-purple font-extrabold">
           No Design Skills Needed
          </span>
        </h1>

        <p
          className="max-w-2xl text-balance text-muted-foreground sm:text-xl sm:leading-8 leading-normal drop-shadow-lg"
          style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}
        >
          Generate eye-catching, digital & print-ready event flyers in seconds. 
          Perfect for weddings, birthdays, and more. PRO design at your fingertips, 
          without the cost or hassle of hiring a designer!
        </p>

        <div
          className="flex space-x-2 md:space-x-4 justify-center"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          <Link
            href="/register"
            prefetch={true}
            className={cn(
              buttonVariants({ size: "lg", rounded: "full" }),
              "gap-2 animate-pulsate",
            )}
          >
            <span>Get Started</span>
            <Icons.arrowRight className="size-4" />
          </Link>
          
          {/* GitHub Star Button - it beside the pricing button*/}
          {/* <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                rounded: "full",
              }),
              "px-5",
            )}
          >
            
            <Icons.gitHub className="size-4 mr-2" />
            <p>
              <span className="hidden sm:inline-block">Star on</span> GitHub{" "}
              <span className="font-semibold">{nFormatter(stars)}</span>
            </p>
          </Link> */}
        </div>

        <div
          className="flex flex-col items-center gap-3"
          style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
        >
          <div className="text-sm text-muted-foreground text-center">
            Trusted by event organizers worldwide
          </div>
          <AvatarCircles numPeople={99} avatarUrls={avatars} />
        </div>
      </div>
    </section>
    
  );
}