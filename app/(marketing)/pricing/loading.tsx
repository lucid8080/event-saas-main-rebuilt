import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function Loading() {
  return (
    <div className="flex flex-col w-full py-8 md:py-8 gap-16">
      <MaxWidthWrapper>
        <section className="flex flex-col items-center">
          <div className="flex flex-col w-full mx-auto items-center gap-5">
            <HeaderSection label="Pricing" title="Start at full speed !" />
            <Skeleton className="w-1/5 h-8 mt-5 mb-3 rounded-full" />
          </div>

          <div className="grid w-full py-5 bg-inherit lg:grid-cols-3 gap-5">
            <Skeleton className="w-[428px] h-[520px] rounded-3xl lg:w-full max-lg:mx-auto" />
            <Skeleton className="w-[428px] h-[520px] rounded-3xl lg:w-full max-lg:mx-auto" />
            <Skeleton className="w-[428px] h-[520px] rounded-3xl lg:w-full max-lg:mx-auto" />
          </div>

          <div className="flex flex-col w-full mt-3 items-center gap-2">
            <Skeleton className="w-2/6 h-4" />
            <Skeleton className="w-1/6 h-4" />
          </div>
        </section>
      </MaxWidthWrapper>

      <hr className="container" />
    </div>
  );
}
