// Lazy loading utilities for heavy components and libraries
import dynamic from 'next/dynamic';

// UI Components - Lazy load heavy Radix UI components
export const LazyDialog = dynamic(() => import('@radix-ui/react-dialog'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

export const LazyPopover = dynamic(() => import('@radix-ui/react-popover'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

export const LazySelect = dynamic(() => import('@radix-ui/react-select'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

export const LazyTabs = dynamic(() => import('@radix-ui/react-tabs'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

// Heavy Libraries - Lazy load only when needed
export const LazyFramerMotion = dynamic(() => import('framer-motion'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

export const LazyRecharts = dynamic(() => import('recharts'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

export const LazySwiper = dynamic(() => import('swiper'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

// Cloud Services - Lazy load AWS and Google Cloud
export const lazyAwsS3 = () => import('@aws-sdk/client-s3');
export const lazyGoogleCloud = () => import('@google-cloud/storage');
export const lazyGoogleApis = () => import('googleapis');

// Image Processing - Lazy load Sharp and Shiki
export const lazySharp = () => import('sharp');
export const lazyShiki = () => import('shiki');

// Forms and UI - Lazy load heavy form components
export const LazyReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

export const LazyReactModal = dynamic(() => import('react-modal'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
});

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