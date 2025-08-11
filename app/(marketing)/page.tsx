import { infos } from "@/config/landing";
import BentoGrid from "@/components/sections/bentogrid";
import HeroLanding from "@/components/sections/hero-landing";
import InfoLanding from "@/components/sections/info-landing";
import MockEventGenerator from "@/components/sections/mock-event-generator";
import { Testimonials } from "@/components/sections/testimonials";

export default function IndexPage() {
  return (
    <>
      <HeroLanding />
      <BentoGrid />
      <MockEventGenerator />
      <InfoLanding data={infos[0]} reverse={true} videoSrc="/ECAI_Promo_Vid.mp4" />
      {/* <InfoLanding data={infos[1]} /> */}
      <Testimonials />
    </>
  );
}
