"use client";

import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Crown, User, Zap } from "lucide-react";
import { getRoleDisplayName, getRoleColor } from "@/lib/role-based-access";

export function RoleIndicator() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (!role) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "HERO":
        return <Zap className="size-3" />;
      case "ADMIN":
        return <Crown className="size-3" />;
      default:
        return <User className="size-3" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        className={`flex items-center gap-1 ${getRoleColor(role)}`}
      >
        {getRoleIcon(role)}
        {getRoleDisplayName(role)}
      </Badge>
    </div>
  );
} 