// Tree shaking utilities to help eliminate unused code

// Re-enabled conditional imports for production testing
const conditionalImport = {
  // Charts and Data Visualization
  recharts: () => import('recharts'),
  framerMotion: () => import('framer-motion'),
  swiper: () => import('swiper/react'),
  
  // Rich Text Editor
  reactQuill: () => import('react-quill'),
  
  // Modal
  reactModal: () => import('react-modal'),
  
  // Cloud Services
  awsS3: () => import('@aws-sdk/client-s3'),
  googleCloud: () => import('@google-cloud/storage'),
  googleApis: () => import('googleapis'),
  
  // Image processing
  sharp: () => import('sharp'),
  shiki: () => import('shiki'),
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