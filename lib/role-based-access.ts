import { UserRole } from '@prisma/client';

// Define permission levels
export enum PermissionLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  ADMIN = 3,
  HERO = 4
}

// Define feature permissions
export interface FeaturePermissions {
  [key: string]: {
    [role in UserRole]: PermissionLevel;
  };
}

// Define the permission matrix for all features
export const FEATURE_PERMISSIONS: FeaturePermissions = {
  // Dashboard & Analytics
  'dashboard:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.READ
  },
  'dashboard:admin': {
    HERO: PermissionLevel.ADMIN,
    ADMIN: PermissionLevel.ADMIN,
    USER: PermissionLevel.NONE
  },
  'analytics:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.NONE
  },
  'analytics:manage': {
    HERO: PermissionLevel.ADMIN,
    ADMIN: PermissionLevel.ADMIN,
    USER: PermissionLevel.NONE
  },

  // User Management
  'users:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.NONE
  },
  'users:manage': {
    HERO: PermissionLevel.ADMIN,
    ADMIN: PermissionLevel.ADMIN,
    USER: PermissionLevel.NONE
  },
  'users:delete': {
    HERO: PermissionLevel.HERO,
    ADMIN: PermissionLevel.NONE,
    USER: PermissionLevel.NONE
  },

  // Content Management
  'blog:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.READ
  },
  'blog:create': {
    HERO: PermissionLevel.WRITE,
    ADMIN: PermissionLevel.WRITE,
    USER: PermissionLevel.NONE
  },
  'blog:edit': {
    HERO: PermissionLevel.WRITE,
    ADMIN: PermissionLevel.WRITE,
    USER: PermissionLevel.NONE
  },
  'blog:delete': {
    HERO: PermissionLevel.ADMIN,
    ADMIN: PermissionLevel.ADMIN,
    USER: PermissionLevel.NONE
  },

  // System Configuration
  'system:prompts:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.NONE
  },
  'system:prompts:manage': {
    HERO: PermissionLevel.ADMIN,
    ADMIN: PermissionLevel.ADMIN,
    USER: PermissionLevel.NONE
  },
  'system:settings:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.NONE
  },
  'system:settings:manage': {
    HERO: PermissionLevel.HERO,
    ADMIN: PermissionLevel.NONE,
    USER: PermissionLevel.NONE
  },

  // Image & Media Management
  'images:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.READ
  },
  'images:generate': {
    HERO: PermissionLevel.WRITE,
    ADMIN: PermissionLevel.WRITE,
    USER: PermissionLevel.WRITE
  },
  'images:delete': {
    HERO: PermissionLevel.ADMIN,
    ADMIN: PermissionLevel.ADMIN,
    USER: PermissionLevel.NONE
  },
  'images:moderate': {
    HERO: PermissionLevel.HERO,
    ADMIN: PermissionLevel.ADMIN,
    USER: PermissionLevel.NONE
  },

  // Carousel Management
  'carousels:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.READ
  },
  'carousels:create': {
    HERO: PermissionLevel.WRITE,
    ADMIN: PermissionLevel.WRITE,
    USER: PermissionLevel.WRITE
  },
  'carousels:manage': {
    HERO: PermissionLevel.ADMIN,
    ADMIN: PermissionLevel.ADMIN,
    USER: PermissionLevel.NONE
  },

  // Billing & Subscriptions
  'billing:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.READ
  },
  'billing:manage': {
    HERO: PermissionLevel.HERO,
    ADMIN: PermissionLevel.ADMIN,
    USER: PermissionLevel.NONE
  },
  'credits:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.READ
  },
  'credits:manage': {
    HERO: PermissionLevel.HERO,
    ADMIN: PermissionLevel.ADMIN,
    USER: PermissionLevel.NONE
  },

  // R2 & Storage
  'r2:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.NONE
  },
  'r2:manage': {
    HERO: PermissionLevel.HERO,
    ADMIN: PermissionLevel.ADMIN,
    USER: PermissionLevel.NONE
  },

  // Contact & Support
  'contact:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.NONE
  },
  'contact:manage': {
    HERO: PermissionLevel.ADMIN,
    ADMIN: PermissionLevel.ADMIN,
    USER: PermissionLevel.NONE
  },

  // Role Management
  'roles:view': {
    HERO: PermissionLevel.READ,
    ADMIN: PermissionLevel.READ,
    USER: PermissionLevel.NONE
  },
  'roles:assign': {
    HERO: PermissionLevel.HERO,
    ADMIN: PermissionLevel.NONE,
    USER: PermissionLevel.NONE
  },
  'roles:manage': {
    HERO: PermissionLevel.HERO,
    ADMIN: PermissionLevel.NONE,
    USER: PermissionLevel.NONE
  }
};

// Role hierarchy for comparison
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  HERO: 4,
  ADMIN: 3,
  USER: 1
};

// Utility functions
export function hasPermission(
  userRole: UserRole,
  feature: string,
  requiredLevel: PermissionLevel = PermissionLevel.READ
): boolean {
  const featurePerms = FEATURE_PERMISSIONS[feature];
  if (!featurePerms) {
    console.warn(`Feature "${feature}" not found in permissions matrix`);
    return false;
  }

  const userPermission = featurePerms[userRole];
  return userPermission >= requiredLevel;
}

export function canAccess(userRole: UserRole, feature: string): boolean {
  return hasPermission(userRole, feature, PermissionLevel.READ);
}

export function canWrite(userRole: UserRole, feature: string): boolean {
  return hasPermission(userRole, feature, PermissionLevel.WRITE);
}

export function canAdmin(userRole: UserRole, feature: string): boolean {
  return hasPermission(userRole, feature, PermissionLevel.ADMIN);
}

export function canHero(userRole: UserRole, feature: string): boolean {
  return hasPermission(userRole, feature, PermissionLevel.HERO);
}

export function isRoleHigherOrEqual(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'HERO':
      return 'Hero (Super Admin)';
    case 'ADMIN':
      return 'Admin';
    case 'USER':
      return 'User';
    default:
      return role;
  }
}

export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case 'HERO':
      return 'Super administrator with full system access including role management and system settings';
    case 'ADMIN':
      return 'Administrator with access to most system features and user management';
    case 'USER':
      return 'Regular user with access to basic features and content creation';
    default:
      return 'Unknown role';
  }
}

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case 'HERO':
      return 'bg-gradient-to-r from-purple-600 to-pink-600';
    case 'ADMIN':
      return 'bg-blue-600';
    case 'USER':
      return 'bg-gray-600';
    default:
      return 'bg-gray-500';
  }
}

// Get all features a role can access
export function getRoleFeatures(role: UserRole): string[] {
  return Object.keys(FEATURE_PERMISSIONS).filter(feature => 
    canAccess(role, feature)
  );
}

// Get all features a role can manage
export function getRoleManageableFeatures(role: UserRole): string[] {
  return Object.keys(FEATURE_PERMISSIONS).filter(feature => 
    canAdmin(role, feature)
  );
} 