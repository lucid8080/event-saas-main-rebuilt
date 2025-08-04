// Lazy loading utilities for heavy components and libraries
import dynamic from 'next/dynamic';

// UI Components - Lazy load heavy Radix UI components
export const LazyDialog = dynamic(() => import('@radix-ui/react-dialog').then(mod => ({ default: mod.Dialog })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

export const LazyPopover = dynamic(() => import('@radix-ui/react-popover').then(mod => ({ default: mod.Popover })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

export const LazySelect = dynamic(() => import('@radix-ui/react-select').then(mod => ({ default: mod.Select })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

export const LazyTabs = dynamic(() => import('@radix-ui/react-tabs').then(mod => ({ default: mod.Tabs })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

// Heavy Libraries - Lazy load only when needed
// Framer Motion temporarily disabled for build compatibility
export const LazyFramerMotion = () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />;

// Swiper temporarily disabled for build compatibility
export const LazySwiper = () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />;

export const LazyRecharts = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

// Cloud Services - temporarily disabled for build compatibility
// Temporarily disabled AWS SDK import to avoid 'self is not defined' error
// export const lazyAwsS3 = () => import('@aws-sdk/client-s3');
export const lazyAwsS3 = () => Promise.resolve({ S3Client: null });
// Temporarily disabled Google Cloud import to avoid potential issues
// export const lazyGoogleCloud = () => import('@google-cloud/storage');
export const lazyGoogleCloud = () => Promise.resolve({ Storage: null });
// Temporarily disabled Google APIs import to avoid potential issues
// export const lazyGoogleApis = () => import('googleapis');
export const lazyGoogleApis = () => Promise.resolve({ google: null });

// Image Processing - Lazy load Sharp and Shiki
export const lazySharp = () => import('sharp');
export const lazyShiki = () => import('shiki');

// Forms and UI - Lazy load heavy form components
// Temporarily disabled React Quill import to avoid potential issues
// export const LazyReactQuill = dynamic(() => import('react-quill'), {
//   ssr: false,
//   loading: () => <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse" />
// });
export const LazyReactQuill = () => <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse" />;

// Temporarily disabled React Modal import to avoid potential issues
// export const LazyReactModal = dynamic(() => import('react-modal'), {
//   ssr: false,
//   loading: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center" />
// });
export const LazyReactModal = () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center" />;

// Utility function to check if component should be lazy loaded
export const shouldLazyLoad = (componentName: string): boolean => {
  const lazyComponents = [
    'Dialog', 'Popover', 'Select', 'Tabs', 'FramerMotion', 
    'Recharts', 'Swiper', 'ReactQuill', 'ReactModal'
  ];
  return lazyComponents.includes(componentName);
};

// Hook for conditional lazy loading
export const useLazyComponent = (componentName: string, isVisible: boolean = true) => {
  if (!isVisible || !shouldLazyLoad(componentName)) {
    return null;
  }
  
  // Return appropriate lazy component based on name
  switch (componentName) {
    case 'Dialog':
      return LazyDialog;
    case 'Popover':
      return LazyPopover;
    case 'Select':
      return LazySelect;
    case 'Tabs':
      return LazyTabs;
    case 'FramerMotion':
      return LazyFramerMotion;
    case 'Recharts':
      return LazyRecharts;
    case 'Swiper':
      return LazySwiper;
    case 'ReactQuill':
      return LazyReactQuill;
    case 'ReactModal':
      return LazyReactModal;
    default:
      return null;
  }
}; 