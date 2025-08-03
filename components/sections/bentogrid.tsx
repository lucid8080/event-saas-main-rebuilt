"use client"; // Mark as a Client Component

import Image from "next/image";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { useEffect, useState } from "react";

// Function to import images from the @bento_images folder
const importImages = () => {
  return [
    "/styles/bento_images/image1.png",
    "/styles/bento_images/image2.png",
    "/styles/bento_images/image3.png",
    "/styles/bento_images/image4.png",
    "/styles/bento_images/image5.png",
    "/styles/bento_images/image6.png",
    "/styles/bento_images/image7.png",
    "/styles/bento_images/image8.png",
    "/styles/bento_images/image9.png",
    "/styles/bento_images/image10.png",
    "/styles/bento_images/image11.png",
    "/styles/bento_images/image12.png", 
    "/styles/bento_images/image13.png",
    "/styles/bento_images/image14.png",
    "/styles/bento_images/image15.png",
    "/styles/bento_images/image16.png",
    "/styles/bento_images/image17.png",
    "/styles/bento_images/image18.png",
    "/styles/bento_images/image19.png",
    "/styles/bento_images/image20.png",
    "/styles/bento_images/image21.png",
    "/styles/bento_images/image22.png",
    // Add more images as needed
  ];
};

const placeholderUrl = "/styles/placeholder2.png"; // Path to your placeholder image

export default function BentoGrid() {
  const [images, setImages] = useState<string[]>([]);
  const [displayImages, setDisplayImages] = useState<string[]>([]);
  const totalCards = 15;

  useEffect(() => {
    const importedImages = importImages();
    setImages(importedImages);
    setDisplayImages(getInitialImages(importedImages, totalCards));
  }, []);

  const getInitialImages = (imageArray: string[], num: number) => {
    const selectedImages = imageArray.slice(0, num);
    return selectedImages.length < num
      ? [...selectedImages, ...Array(num - selectedImages.length).fill(placeholderUrl)]
      : selectedImages;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayImages((prevImages) => {
        const newImages = [...prevImages];
        const randomIndex = Math.floor(Math.random() * totalCards);
        let randomImage;

        // Ensure the new image is not the same as the current one
        do {
          randomImage = getRandomImage(images);
        } while (newImages.includes(randomImage)); // Check if the random image is already displayed

        newImages[randomIndex] = randomImage;
        return newImages;
      });
    }, 3000); // Change one image every 3 seconds

    return () => clearInterval(interval);
  }, [images]);

  const getRandomImage = (imageArray: string[]) => {
    if (imageArray.length === 0) return placeholderUrl;
    const randomIndex = Math.floor(Math.random() * imageArray.length);
    return imageArray[randomIndex];
  };

  return (
    <section className="py-32">
      <MaxWidthWrapper>
        <div className="grid grid-cols-5 gap-4">
          {displayImages.map((url, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-lg transition-opacity duration-1000 ease-in-out ${index % 5 === 1 || index % 5 === 3 ? 'translate-y-[30%]' : ''}`}
            >
              <Image
                src={url}
                alt={`Gallery Image ${index + 1}`}
                layout="responsive"
                width={225}          // Width for 9:16 ratio
                height={400}         // Height for 9:16 ratio
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}