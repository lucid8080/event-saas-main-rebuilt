"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarCirclesProps {
  numPeople: number;
  avatarUrls: Array<{
    imageUrl: string;
    profileUrl: string;
  }>;
}

export function AvatarCircles({ numPeople, avatarUrls }: AvatarCirclesProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {avatarUrls.slice(0, 5).map((avatar, index) => (
          <Avatar key={index} className="size-8 border-2 border-background">
            <AvatarImage src={avatar.imageUrl} alt="User avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        +{numPeople - avatarUrls.length} more
      </span>
    </div>
  );
} 