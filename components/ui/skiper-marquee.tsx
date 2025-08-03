"use client";

import React from "react";
import Image from "next/image";

interface WeddingImage {
  id: string;
  url: string;
  prompt: string;
  eventType: string;
  createdAt: string;
  user: {
    name: string;
    image: string;
  };
}

interface SkiperMarqueeProps {
  weddingImages?: WeddingImage[];
}

// Fallback wedding event data with actual images from bento_images (used when no API images are available)
const fallbackWeddingEvents = [
  {
    title: "Elegant Garden Wedding",
    date: "June 15",
    image: "/styles/bento_images/image1.png",
    color: "from-pink-200 to-rose-300"
  },
  {
    title: "Romantic Beach Ceremony",
    date: "July 22",
    image: "/styles/bento_images/image2.png",
    color: "from-blue-200 to-cyan-300"
  },
  {
    title: "Rustic Barn Celebration",
    date: "August 8",
    image: "/styles/bento_images/image3.png",
    color: "from-amber-200 to-orange-300"
  },
  {
    title: "Vintage Elegance",
    date: "September 12",
    image: "/styles/bento_images/image4.png",
    color: "from-purple-200 to-pink-300"
  },
  {
    title: "Winter Wonderland",
    date: "December 14",
    image: "/styles/bento_images/image5.png",
    color: "from-blue-100 to-indigo-200"
  },
  {
    title: "Spring Blossoms",
    date: "April 20",
    image: "/styles/bento_images/image6.png",
    color: "from-pink-100 to-rose-200"
  },
  {
    title: "Autumn Romance",
    date: "October 18",
    image: "/styles/bento_images/image7.png",
    color: "from-orange-200 to-red-300"
  },
  {
    title: "Modern Minimalist",
    date: "May 25",
    image: "/styles/bento_images/image8.png",
    color: "from-gray-200 to-slate-300"
  },
  {
    title: "Luxury Ballroom",
    date: "November 30",
    image: "/styles/bento_images/image9.png",
    color: "from-gold-200 to-yellow-300"
  },
  {
    title: "Intimate Courtyard",
    date: "March 10",
    image: "/styles/bento_images/image10.png",
    color: "from-green-200 to-emerald-300"
  },
  {
    title: "Sunset Rooftop",
    date: "July 4",
    image: "/styles/bento_images/image11.png",
    color: "from-orange-200 to-red-400"
  },
  {
    title: "Classic Church",
    date: "December 25",
    image: "/styles/bento_images/image12.png",
    color: "from-white to-gray-100"
  },
  {
    title: "Tropical Paradise",
    date: "February 14",
    image: "/styles/bento_images/image13.png",
    color: "from-teal-200 to-cyan-400"
  },
  {
    title: "Mountain Lodge",
    date: "September 28",
    image: "/styles/bento_images/image14.png",
    color: "from-brown-200 to-amber-400"
  },
  {
    title: "Urban Chic",
    date: "June 30",
    image: "/styles/bento_images/image15.png",
    color: "from-slate-200 to-gray-400"
  },
  {
    title: "Countryside Charm",
    date: "August 15",
    image: "/styles/bento_images/image16.png",
    color: "from-green-100 to-emerald-200"
  }
];

export const SkiperMarquee: React.FC<SkiperMarqueeProps> = ({ weddingImages = [] }) => {
  // Use API wedding images if available, otherwise use fallback
  const displayImages = weddingImages.length > 0 ? weddingImages : fallbackWeddingEvents;
  
  // For API images, we need to create a compatible format
  const processedImages = weddingImages.length > 0 
    ? weddingImages.map((img, index) => ({
        title: img.prompt || `Wedding Flyer ${index + 1}`,
        date: new Date(img.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        image: img.url,
        color: fallbackWeddingEvents[index % fallbackWeddingEvents.length]?.color || "from-pink-200 to-rose-300"
      }))
    : fallbackWeddingEvents;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="relative size-full">
        {/* First marquee row - Large wedding flyers */}
        <div className="absolute flex w-full h-64 top-0 left-0 items-center">
          <div 
            className="flex animate-marquee whitespace-nowrap"
            style={{
              "--marquee-duration": "60s",
              "--marquee-direction": "normal",
              "--gap": "1rem",
            } as React.CSSProperties}
          >
            {processedImages.slice(0, 8).map((event, i) => (
              <div
                key={i}
                className={`mx-4 w-48 md:w-56 h-48 md:h-64 rounded-xl opacity-20 relative shadow-xl border-2 border-white/30 overflow-hidden  hover:scale-105 transition- duration-300`}
                style={{
                  background: `linear-gradient(135deg, ${event.color})`
                }}
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bg-gradient-to-t inset-0 from-black/20 to-transparent" />
              </div>
            ))}
          </div>
          <div 
            className="flex animate-marquee whitespace-nowrap"
            style={{
              "--marquee-duration": "60s",
              "--marquee-direction": "normal",
              "--gap": "1rem",
            } as React.CSSProperties}
          >
            {processedImages.slice(0, 8).map((event, i) => (
              <div
                key={i + 8}
                className={`mx-4 w-48 md:w-56 h-48 md:h-64 rounded-xl opacity-20 relative shadow-xl border-2 border-white/30 overflow-hidden  hover:scale-105 transition- duration-300`}
                style={{
                  background: `linear-gradient(135deg, ${event.color})`
                }}
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bg-gradient-to-t inset-0 from-black/20 to-transparent" />
              </div>
            ))}
          </div>
        </div>

        {/* Second marquee row - Medium wedding flyers */}
        <div className="absolute flex w-full h-56 top-64 left-0 items-center">
          <div 
            className="flex animate-marquee-reverse whitespace-nowrap"
            style={{
              "--marquee-duration": "45s",
              "--marquee-direction": "reverse",
              "--gap": "1rem",
            } as React.CSSProperties}
          >
            {processedImages.slice(8, 16).map((event, i) => (
              <div
                key={i + 16}
                className={`mx-4 w-40 md:w-48 h-40 md:h-56 rounded-lg opacity-15 relative shadow-lg border border-white/25 overflow-hidden  hover:scale-105 transition- duration-300`}
                style={{
                  background: `linear-gradient(135deg, ${event.color})`
                }}
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bg-gradient-to-t inset-0 from-black/15 to-transparent" />
              </div>
            ))}
          </div>
          <div 
            className="flex animate-marquee-reverse whitespace-nowrap"
            style={{
              "--marquee-duration": "45s",
              "--marquee-direction": "reverse",
              "--gap": "1rem",
            } as React.CSSProperties}
          >
            {processedImages.slice(8, 16).map((event, i) => (
              <div
                key={i + 24}
                className={`mx-4 w-40 md:w-48 h-40 md:h-56 rounded-lg opacity-15 relative shadow-lg border border-white/25 overflow-hidden  hover:scale-105 transition- duration-300`}
                style={{
                  background: `linear-gradient(135deg, ${event.color})`
                }}
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bg-gradient-to-t inset-0 from-black/15 to-transparent" />
              </div>
            ))}
          </div>
        </div>

        {/* Third marquee row - Small wedding flyers */}
        <div className="absolute flex w-full h-48 top-[480px] left-0 items-center">
          <div 
            className="flex animate-marquee whitespace-nowrap"
            style={{
              "--marquee-duration": "35s",
              "--marquee-direction": "normal",
              "--gap": "0.75rem",
            } as React.CSSProperties}
          >
            {processedImages.map((event, i) => (
              <div
                key={i + 32}
                className={`mx-3 w-32 md:w-40 h-32 md:h-48 rounded-lg opacity-10 relative shadow-md border border-white/20 overflow-hidden  hover:scale-105 transition- duration-300`}
                style={{
                  background: `linear-gradient(135deg, ${event.color})`
                }}
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bg-gradient-to-t inset-0 from-black/10 to-transparent" />
              </div>
            ))}
          </div>
          <div 
            className="flex animate-marquee whitespace-nowrap"
            style={{
              "--marquee-duration": "35s",
              "--marquee-direction": "normal",
              "--gap": "0.75rem",
            } as React.CSSProperties}
          >
            {processedImages.map((event, i) => (
              <div
                key={i + 48}
                className={`mx-3 w-32 md:w-40 h-32 md:h-48 rounded-lg opacity-10 relative shadow-md border border-white/20 overflow-hidden  hover:scale-105 transition- duration-300`}
                style={{
                  background: `linear-gradient(135deg, ${event.color})`
                }}
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bg-gradient-to-t inset-0 from-black/10 to-transparent" />
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute size-full top-0 left-0">
          {/* Floating hearts */}
          <div className="absolute top-20 left-10 animate-bounce">
            <div className="size-4 bg-pink-300 rounded-full opacity-30"></div>
          </div>
          <div className="absolute top-40 right-20 animate-bounce" style={{ animationDelay: '1s' }}>
            <div className="size-3 bg-rose-300 rounded-full opacity-25"></div>
          </div>
          <div className="absolute top-60 left-1/4 animate-bounce" style={{ animationDelay: '2s' }}>
            <div className="size-2 bg-pink-200 rounded-full opacity-20"></div>
          </div>
          <div className="absolute top-80 right-1/3 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <div className="size-3 bg-rose-200 rounded-full opacity-30"></div>
          </div>
        </div>
      </div>
    </div>
  );
}; 