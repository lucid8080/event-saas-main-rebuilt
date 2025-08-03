# Smart Plan Switching Guide

## 🎯 **Overview**

The system now intelligently handles plan changes with proper upgrade/downgrade logic and next billing cycle management. Users will see different button text and behavior based on their current plan and the plan they're trying to switch to.

## 🔄 **Plan Hierarchy**

The system recognizes the following plan hierarchy (from lowest to highest):

1. **Starter** (Level 1) - 100 credits
2. **Pro** (Level 2) - 200 credits  
3. **Business** (Level 3) - 500 credits

## 📋 **Smart Button Logic**

### **For Free Users:**
- All plans show: **"Upgrade"**
- Tooltip: **"Start your subscription"**

### **For Paid Users:**

#### **Same Plan, Different Billing Cycle:**
- Button: **"Switch to Monthly/Yearly"**
- Tooltip: **"Switch billing cycle to monthly/yearly"**
- Action: Opens Stripe billing portal

#### **Upgrade (Higher Plan):**
- Button: **"Upgrade Plan"** (Primary button style)
- Tooltip: **"Upgrade effective immediately"**
- Action: Creates new Stripe checkout session for immediate upgrade

#### **Downgrade (Lower Plan):**
- Button: **"Downgrade Plan"** (Destructive button style - red)
- Tooltip: **"Downgrade effective next billing cycle"**
- Action: Opens Stripe billing portal for next-cycle change

#### **Same Plan, Same Billing Cycle:**
- Button: **"Manage Subscription"**
- Tooltip: **"Manage your current subscription"**
- Action: Opens Stripe billing portal

## 🎨 **Visual Indicators**

### **Button Styles:**
- **Primary (Blue)**: Upgrades and current plan management
- **Outline (Gray)**: Same plan, different billing cycle
- **Destructive (Red)**: Downgrades

### **Tooltips:**
- Hover over any button to see what action will be taken
- Clear indication of when changes take effect

## 📅 **Billing Cycle Management**

### **Upgrades:**
- **Effective Immediately**: Users get new plan benefits right away
- **Prorated Billing**: Stripe handles proration automatically
- **Immediate Credit Addition**: New credits are added immediately

### **Downgrades:**
- **Next Billing Cycle**: Changes take effect at the end of current period
- **No Immediate Changes**: Current plan continues until period ends
- **Credit Retention**: Current credits remain until period ends

### **Billing Cycle Changes:**
- **Monthly ↔ Yearly**: Can be changed anytime
- **Portal Management**: Users manage these changes through Stripe portal

## 🔧 **Technical Implementation**

### **Key Functions:**

```typescript
// Plan hierarchy determination
getPlanLevel(planTitle: string): number

// Plan relationship checks
isUpgrade(currentPlan: string, targetPlan: string): boolean
isDowngrade(currentPlan: string, targetPlan: string): boolean
isSamePlan(currentPlan: string, targetPlan: string): boolean

// Smart button text generation
getPlanActionText(currentPlan, targetPlan, isYearly): string

// Tooltip description generation
getPlanChangeDescription(currentPlan, targetPlan, isYearly): string
```

### **Stripe Integration:**

#### **Upgrades:**
- Creates new checkout session
- Includes metadata for tracking
- Handles proration automatically

#### **Downgrades:**
- Redirects to billing portal
- User manages change through Stripe
- Next billing cycle effective

#### **Billing Cycle Changes:**
- Redirects to billing portal
- User manages through Stripe interface

## 📊 **Current Plan Status Component**

The pricing page now shows a comprehensive plan status card including:

- **Current Plan**: Plan name with color-coded badge
- **Status**: Active, Canceling, or Free Plan
- **Credits**: Current available credits
- **Billing Cycle**: Monthly or Yearly
- **Next Billing Date**: When next charge occurs
- **Account Balance**: Stripe account balance
- **Credits per Cycle**: How many credits added each period

## 🎯 **User Experience**

### **Before (Old System):**
- All buttons said "Upgrade"
- No indication of plan relationships
- Confusing for users on paid plans
- No clear billing cycle information

### **After (New System):**
- **Smart Button Text**: Clear indication of action
- **Visual Hierarchy**: Different button styles for different actions
- **Tooltips**: Detailed explanations of what will happen
- **Plan Status**: Complete overview of current subscription
- **Billing Transparency**: Clear next billing date and cycle info

## 🔍 **Example Scenarios**

### **Scenario 1: Free User → Pro Plan**
- Button: **"Upgrade Plan"** (Primary)
- Tooltip: **"Start your subscription"**
- Action: Stripe checkout for Pro plan

### **Scenario 2: Pro Monthly → Pro Yearly**
- Button: **"Switch to Yearly"** (Outline)
- Tooltip: **"Switch billing cycle to yearly"**
- Action: Stripe billing portal

### **Scenario 3: Business → Pro**
- Button: **"Downgrade Plan"** (Destructive/Red)
- Tooltip: **"Downgrade effective next billing cycle"**
- Action: Stripe billing portal

### **Scenario 4: Pro → Business**
- Button: **"Upgrade Plan"** (Primary)
- Tooltip: **"Upgrade effective immediately"**
- Action: Stripe checkout for immediate upgrade

## 🚀 **Benefits**

1. **Clear User Intent**: Users know exactly what will happen
2. **Reduced Confusion**: No more "Upgrade" buttons for current plans
3. **Billing Transparency**: Clear next billing cycle information
4. **Proper Plan Management**: Appropriate actions for upgrades vs downgrades
5. **Professional UX**: Follows SaaS best practices for plan switching

## 🔧 **Configuration**

The system automatically detects plan relationships based on the `pricingData` configuration in `config/subscriptions.ts`. No additional configuration is needed - the hierarchy is built into the logic.

---

**Status**: ✅ **Complete** - Smart plan switching with upgrade/downgrade logic and next billing cycle management is now fully implemented. 