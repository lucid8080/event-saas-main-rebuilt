import { CarouselMaker } from "@/components/dashboard/carousel-maker";
import { CarouselMakerAccessControl } from "@/components/dashboard/carousel-maker-access-control";

export default function CarouselMakerPage() {
  return (
    <CarouselMakerAccessControl>
      <CarouselMaker />
    </CarouselMakerAccessControl>
  );
} 