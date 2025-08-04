// Tree shaking utilities to help eliminate unused code

// Temporarily disabled imports to avoid 'self is not defined' error during build
const conditionalImport = {
  // Charts and Data Visualization - temporarily disabled
  recharts: () => Promise.resolve({ BarChart: null }),
  framerMotion: () => Promise.resolve({ motion: null }),
  swiper: () => Promise.resolve({ Swiper: null }),
  
  // Rich Text Editor - temporarily disabled
  reactQuill: () => Promise.resolve({ default: null }),
  
  // Modal - temporarily disabled
  reactModal: () => Promise.resolve({ default: null }),
  
  // Cloud Services - temporarily disabled for build compatibility
  awsS3: () => Promise.resolve({ S3Client: null }),
  googleCloud: () => Promise.resolve({ Storage: null }),
  googleApis: () => Promise.resolve({ google: null }),
  
  // Image processing - temporarily disabled
  sharp: () => Promise.resolve({ default: null }),
  shiki: () => Promise.resolve({ getHighlighter: null }),
};

// Feature flags for conditional loading
export const featureFlags = {
  charts: process.env.NEXT_PUBLIC_ENABLE_CHARTS === 'true',
  animations: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS === 'true',
  cloudServices: process.env.NEXT_PUBLIC_ENABLE_CLOUD_SERVICES === 'true',
  imageProcessing: process.env.NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING === 'true',
};

// Utility to check if a feature should be loaded
export const shouldLoadFeature = (feature: keyof typeof featureFlags): boolean => {
  return featureFlags[feature] ?? true; // Default to true if not specified
};

// Lazy load components based on feature flags
export const lazyLoadComponent = async (componentName: string) => {
  switch (componentName) {
    case 'recharts':
      if (shouldLoadFeature('charts')) {
        return await conditionalImport.recharts();
      }
      return null;
    case 'framerMotion':
      if (shouldLoadFeature('animations')) {
        return await conditionalImport.framerMotion();
      }
      return null;
    case 'swiper':
      if (shouldLoadFeature('animations')) {
        return await conditionalImport.swiper();
      }
      return null;
    case 'reactQuill':
      return await conditionalImport.reactQuill();
    case 'reactModal':
      return await conditionalImport.reactModal();
    case 'awsS3':
      if (shouldLoadFeature('cloudServices')) {
        return await conditionalImport.awsS3();
      }
      return null;
    case 'googleCloud':
      if (shouldLoadFeature('cloudServices')) {
        return await conditionalImport.googleCloud();
      }
      return null;
    case 'googleApis':
      if (shouldLoadFeature('cloudServices')) {
        return await conditionalImport.googleApis();
      }
      return null;
    case 'sharp':
      if (shouldLoadFeature('imageProcessing')) {
        return await conditionalImport.sharp();
      }
      return null;
    case 'shiki':
      if (shouldLoadFeature('imageProcessing')) {
        return await conditionalImport.shiki();
      }
      return null;
    default:
      return null;
  }
};

// Hook for conditional feature loading
export const useConditionalFeature = (feature: keyof typeof featureFlags) => {
  return shouldLoadFeature(feature);
};

// Utility to create tree-shakeable imports
export const createTreeShakeableImport = <T>(
  importFn: () => Promise<T>,
  condition: boolean = true
) => {
  if (!condition) {
    return null;
  }
  return importFn();
};

// Bundle analyzer helper
export const analyzeBundle = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Bundle Analysis:');
    console.log('Feature Flags:', featureFlags);
    console.log('Available Conditional Imports:', Object.keys(conditionalImport));
  }
}; 