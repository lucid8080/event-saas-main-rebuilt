import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonSection({ card = false }: { card?: boolean }) {
  return (
    <div className="grid grid-cols-1 py-8 md:grid-cols-10 gap-x-10 gap-y-4">
      <div className="space-y-1.5 col-span-4">
        <Skeleton className="w-36 h-5" />
        <Skeleton className="w-4/5 h-5" />
      </div>
      <div className="col-span-6">
        {card ? (
          <Skeleton className="w-full h-44 rounded-xl" />
        ) : (
          <>
            <div className="flex mb-1.5 gap-x-2">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-[67px] h-10 sm:w-[130px] shrink-0" />
            </div>
            <Skeleton className="w-56 h-5" />
          </>
        )}
      </div>
    </div>
  );
}
