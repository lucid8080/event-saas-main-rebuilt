"use client";

/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

const siteImages = [
  {
    id: 1,
    name: "Wedding Celebration",
    img: "/styles/1_no_style.jpg",
  },
  {
    id: 2,
    name: "Birthday Party",
    img: "/styles/1_wild_card.png",
  },
  {
    id: 3,
    name: "Corporate Event",
    img: "/styles/10_Street_Art.jpeg",
  },
  {
    id: 4,
    name: "Music Festival",
    img: "/styles/bento_images/image1.jpg",
  },
  {
    id: 5,
    name: "Art Exhibition",
    img: "/styles/bento_images/image_99.png",
  },
  {
    id: 6,
    name: "Sports Tournament",
    img: "/styles/bento_images/image_100.png",
  },
  {
    id: 7,
    name: "Fantasy World",
    img: "/styles/9_Fantasy_World.jpeg",
  },
  {
    id: 8,
    name: "Cyberpunk Night",
    img: "/styles/7_Cyberpunk.jpg",
  },
  {
    id: 9,
    name: "Retro Gaming",
    img: "/styles/6_Retro_Game.jpg",
  },
  {
    id: 10,
    name: "Vintage Film",
    img: "/styles/5_Vintage_Film_Poster.jpg",
  },
  {
    id: 11,
    name: "Golden Harmony",
    img: "/styles/4_golden_harmony.jpg",
  },
  {
    id: 12,
    name: "Pop Art Style",
    img: "/styles/2_Pop_Art.jpg",
  },
  {
    id: 13,
    name: "Children Book",
    img: "/styles/3_children_book.jpg",
  },
  {
    id: 14,
    name: "Political Satire",
    img: "/styles/4_Political_Satire.jpg",
  },
  {
    id: 15,
    name: "Origami Art",
    img: "/styles/8_origami.jpg",
  },
  {
    id: 16,
    name: "Bento Image 2",
    img: "/styles/bento_images/image2.jpg",
  },
  {
    id: 17,
    name: "Bento Image 3",
    img: "/styles/bento_images/image3.png",
  },
  {
    id: 18,
    name: "Bento Image 4",
    img: "/styles/bento_images/image4.png",
  },
  {
    id: 19,
    name: "Bento Image 5",
    img: "/styles/bento_images/image5.png",
  },
  {
    id: 20,
    name: "Bento Image 6",
    img: "/styles/bento_images/image6.png",
  },
  {
    id: 21,
    name: "Bento Image 7",
    img: "/styles/bento_images/image7.png",
  },
  {
    id: 22,
    name: "Bento Image 8",
    img: "/styles/bento_images/image8.png",
  },
  {
    id: 23,
    name: "Bento Image 9",
    img: "/styles/bento_images/image9.png",
  },
  {
    id: 24,
    name: "Bento Image 10",
    img: "/styles/bento_images/image10.png",
  },
  {
    id: 25,
    name: "Bento Image 11",
    img: "/styles/bento_images/image11.png",
  },
  {
    id: 26,
    name: "Bento Image 12",
    img: "/styles/bento_images/image12.png",
  },
];

const firstRow = siteImages.slice(0, 3);
const secondRow = siteImages.slice(3, 6);
const thirdRow = siteImages.slice(6, 9);
const fourthRow = siteImages.slice(9, 12);
const fifthRow = siteImages.slice(12, 15);
const sixthRow = siteImages.slice(15, 18);
const seventhRow = siteImages.slice(18, 21);
const eighthRow = siteImages.slice(21, 24);
const ninthRow = siteImages.slice(24, 26);
const tenthRow = siteImages.slice(0, 3);
const eleventhRow = siteImages.slice(3, 6);

const ImageCard = ({
  img,
  name,
}: {
  img: string;
  name: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-48 w-36 cursor-pointer overflow-hidden rounded-xl border p-2",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="relative w-full h-32 rounded-lg overflow-hidden">
        <img 
          className="size-full object-cover" 
          alt={name} 
          src={img} 
        />
      </div>
      <div className="mt-2">
        <figcaption className="text-xs dark:text-white font-medium">
          {name}
        </figcaption>
      </div>
    </figure>
  );
};

export function Marquee3D() {
  return (
    <div className="relative flex flex-row w-full h-[500px] items-center justify-center gap-4 overflow-hidden">
      <Marquee pauseOnHover vertical duration={60}>
        {firstRow.map((image) => (
          <ImageCard key={image.id} {...image} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover vertical duration={70}>
        {secondRow.map((image) => (
          <ImageCard key={image.id} {...image} />
        ))}
      </Marquee>
      <Marquee pauseOnHover vertical duration={80}>
        {thirdRow.map((image) => (
          <ImageCard key={image.id} {...image} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover vertical duration={50}>
        {fourthRow.map((image) => (
          <ImageCard key={image.id} {...image} />
        ))}
      </Marquee>
      <Marquee pauseOnHover vertical duration={64}>
        {fifthRow.map((image) => (
          <ImageCard key={image.id} {...image} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover vertical duration={76}>
        {sixthRow.map((image) => (
          <ImageCard key={image.id} {...image} />
        ))}
      </Marquee>
      <Marquee pauseOnHover vertical duration={90}>
        {seventhRow.map((image) => (
          <ImageCard key={image.id} {...image} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover vertical duration={56}>
        {eighthRow.map((image) => (
          <ImageCard key={image.id} {...image} />
        ))}
      </Marquee>
      <Marquee pauseOnHover vertical duration={72}>
        {ninthRow.map((image) => (
          <ImageCard key={image.id} {...image} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover vertical duration={84}>
        {tenthRow.map((image) => (
          <ImageCard key={image.id} {...image} />
        ))}
      </Marquee>
      <Marquee pauseOnHover vertical duration={68}>
        {eleventhRow.map((image) => (
          <ImageCard key={image.id} {...image} />
        ))}
      </Marquee>
      <div className="absolute h-1/4 bg-gradient-to-b pointer-events-none inset-x-0 top-0 from-background"></div>
      <div className="absolute h-1/4 bg-gradient-to-t pointer-events-none inset-x-0 bottom-0 from-background"></div>
    </div>
  );
} 