import Image from "next/image";
import { InfoLdg } from "@/types";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface InfoLandingProps {
  data: InfoLdg;
  reverse?: boolean;
  videoSrc?: string;
}

export default function InfoLanding({
  data,
  reverse = false,
  videoSrc,
}: InfoLandingProps) {
  return (
    <div className="py-10 sm:py-20">
      <MaxWidthWrapper className={cn("grid px-2.5 lg:grid-cols-2 lg:items-center lg:px-7 gap-10", videoSrc && "lg:grid-cols-[1fr_1.2fr]")}>
        <div className={cn(reverse ? "lg:order-2" : "lg:order-1")}>
          <h2 className="text-2xl text-foreground md:text-4xl lg:text-[40px] font-heading">
            {data.title}
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            {data.description}
          </p>
          <dl className="mt-6 space-y-4 leading-7">
            {data.list.map((item, index) => {
              const Icon = Icons[item.icon || "arrowRight"];
              return (
                <div className="relative pl-8" key={index}>
                  <dt className="font-semibold">
                    <Icon className="absolute size-5 left-0 top-1 stroke-purple-700" />
                    <span>{item.title}</span>
                  </dt>
                  <dd className="text-sm text-muted-foreground">
                    {item.description}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
        <div
          className={cn(
            "overflow-hidden rounded-xl border lg:-m-4",
            reverse ? "order-1" : "order-2",
          )}
        >
          <div className={cn("aspect-video", videoSrc && "lg:aspect-[4/3]")}>
            {videoSrc ? (
              <video
                className="w-full h-full object-cover"
                controls
                poster="/ECAI.png"
                preload="metadata"
                loop
                autoPlay
                muted
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                className="size-full object-cover object-center"
                src={"/styles/bento_images/image_99.png"} //  placerholder code ----> {data.image} 
                alt={data.title}
                width={1000}
                height={500}
                priority={true}
              />
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
