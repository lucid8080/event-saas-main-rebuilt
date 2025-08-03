# Role-Based Access Control (RBAC) System

## Current Implementation

### 🦸‍♂️ HERO Role (Super Admin)
- **Purpose**: Super administrator with full system access
- **Permissions**: All system features including role management
- **Key Features**:
  - Full system access and control
  - Role management and assignment
  - System settings management
  - User deletion capabilities
  - All admin features
  - R2 storage management
  - Billing and subscription management

### 👑 ADMIN Role (Administrator)
- **Purpose**: Administrator with access to most system features
- **Permissions**: Most system features except role management
- **Key Features**:
  - User management (except deletion)
  - Content moderation
  - Analytics access
  - System prompts management
  - Blog post management
  - Contact message management
  - Credit management

### 👤 USER Role (Regular User)
- **Purpose**: Regular user with access to basic features
- **Permissions**: Basic features and content creation
- **Key Features**:
  - Image generation
  - Carousel creation
  - Personal gallery access
  - Basic dashboard features
  - Profile management

## Future Role Plans

### 🎨 CONTENT_CREATOR Role
- **Purpose**: Dedicated content creators and moderators
- **Permissions**: Content-focused features
- **Key Features**:
  - Blog post creation and editing
  - Content moderation
  - Image approval workflows
  - Template management
  - Style guide access
  - Limited user management (view only)

### 📊 ANALYST Role
- **Purpose**: Data analysts and business intelligence
- **Permissions**: Analytics and reporting features
- **Key Features**:
  - Full analytics access
  - Report generation
  - Data export capabilities
  - Performance monitoring
  - User behavior analysis
  - No content management
  - No user management

### 🛠️ DEVELOPER Role
- **Purpose**: Technical team members
- **Permissions**: Development and debugging features
- **Key Features**:
  - System prompts management
  - API testing access
  - Debug endpoints
  - Performance monitoring
  - Error log access
  - Limited user data access
  - No billing management

### 💰 BILLING_MANAGER Role
- **Purpose**: Financial and subscription management
- **Permissions**: Billing and financial features
- **Key Features**:
  - Subscription management
  - Credit allocation
  - Payment processing
  - Refund management
  - Financial reporting
  - Customer billing support
  - No content management
  - No user deletion

### 🎯 MODERATOR Role
- **Purpose**: Community and content moderation
- **Permissions**: Moderation-focused features
- **Key Features**:
  - Content approval workflows
  - User content review
  - Report handling
  - Community guidelines enforcement
  - Limited user management (warnings, suspensions)
  - No financial access
  - No system settings

### 📱 SUPPORT_AGENT Role
- **Purpose**: Customer support representatives
- **Permissions**: Support-focused features
- **Key Features**:
  - Contact message management
  - User support tools
  - Ticket management
  - Knowledge base access
  - Limited user data access (for support)
  - No content creation
  - No financial management

## Permission Matrix

| Feature | HERO | ADMIN | USER | CONTENT_CREATOR | ANALYST | DEVELOPER | BILLING_MANAGER | MODERATOR | SUPPORT_AGENT |
|---------|------|-------|------|-----------------|---------|-----------|-----------------|-----------|---------------|
| **Dashboard Access** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **User Management** | ✅ | ✅ | ❌ | 👁️ | ❌ | 👁️ | ❌ | ⚠️ | 👁️ |
| **Role Management** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Content Creation** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Content Moderation** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Analytics** | ✅ | ✅ | ❌ | 👁️ | ✅ | ✅ | 👁️ | ❌ | 👁️ |
| **System Settings** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Billing Management** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Support Tools** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **API Access** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ Full access
- 👁️ Read-only access
- ⚠️ Limited access
- ❌ No access

## Implementation Roadmap

### Phase 1: Core RBAC System ✅ COMPLETED
- [x] HERO role implementation
- [x] Permission matrix definition
- [x] Role-based access utilities
- [x] Admin dashboard integration
- [x] Role management interface

### Phase 2: Extended Roles (Next)
- [ ] CONTENT_CREATOR role
- [ ] ANALYST role
- [ ] MODERATOR role
- [ ] Updated permission matrix
- [ ] Role-specific dashboards

### Phase 3: Specialized Roles
- [ ] DEVELOPER role
- [ ] BILLING_MANAGER role
- [ ] SUPPORT_AGENT role
- [ ] Advanced permission controls
- [ ] Role inheritance system

### Phase 4: Advanced Features
- [ ] Dynamic permission assignment
- [ ] Role-based UI customization
- [ ] Audit logging for role changes
- [ ] Multi-tenant role support
- [ ] Role templates and presets

## Security Considerations

### Role Assignment Security
- Only HERO users can assign HERO role
- Users cannot assign roles higher than their own
- Role changes are logged and auditable
- Temporary role elevation with expiration

### Permission Inheritance
- Higher roles inherit permissions from lower roles
- Explicit permission overrides for specific cases
- Granular permission control per feature
- Context-aware permission checking

### Audit and Monitoring
- All role changes logged with timestamp and user
- Permission access attempts logged
- Suspicious activity detection
- Regular permission audits

## Usage Examples

### Promoting a User to HERO
```bash
npx tsx scripts/promote-to-hero.ts user@example.com
```

### Checking Permissions in Code
```typescript
import { canHero, canAdmin, hasPermission } from '@/lib/role-based-access';

// Check if user can manage roles
if (canHero(user.role, 'roles:assign')) {
  // Allow role management
}

// Check specific permission level
if (hasPermission(user.role, 'users:delete', PermissionLevel.HERO)) {
  // Allow user deletion
}
```

### Role-Based UI Rendering
```typescript
import { getRoleDisplayName, getRoleColor } from '@/lib/role-based-access';

// Display role with proper styling
<Badge className={getRoleColor(user.role)}>
  {getRoleDisplayName(user.role)}
</Badge>
```

## Best Practices

1. **Principle of Least Privilege**: Users should have minimum necessary permissions
2. **Role Hierarchy**: Clear hierarchy prevents permission conflicts
3. **Regular Audits**: Periodic review of role assignments and permissions
4. **Documentation**: Clear documentation of each role's purpose and permissions
5. **Testing**: Comprehensive testing of permission boundaries
6. **Monitoring**: Continuous monitoring of role-based access patterns

## Future Enhancements

### Dynamic Role System
- Custom role creation
- Permission bundling
- Role templates
- Temporary role assignments

### Advanced Security
- Multi-factor authentication for role changes
- IP-based role restrictions
- Time-based role expiration
- Role-based API rate limiting

### Integration Features
- SSO role mapping
- External role synchronization
- Role-based webhook permissions
- Third-party role integration 