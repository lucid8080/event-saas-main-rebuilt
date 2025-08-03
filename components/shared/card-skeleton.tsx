import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="gap-1">
        <Skeleton className="w-1/5 h-5" />
        <Skeleton className="w-2/5 h-3.5" />
      </CardHeader>
      <CardContent className="h-16" />
      <CardFooter className="flex h-14 p-6 bg-accent/50 border-t items-center justify-between" />
    </Card>
  );
}
