import dynamic from 'next/dynamic';

// Dynamic imports for heavy libraries with loading states
export const dynamicImports = {
  // Charts and Data Visualization
  recharts: {
    BarChart: dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), {
      ssr: false,
      loading: () => <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />
    }),
    LineChart: dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), {
      ssr: false,
      loading: () => <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />
    }),
    AreaChart: dynamic(() => import('recharts').then(mod => ({ default: mod.AreaChart })), {
      ssr: false,
      loading: () => <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />
    }),
    RadarChart: dynamic(() => import('recharts').then(mod => ({ default: mod.RadarChart })), {
      ssr: false,
      loading: () => <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />
    }),
  },

  // Animations
  framerMotion: {
    motion: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion })), {
      ssr: false,
      loading: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />
    }),
    AnimatePresence: dynamic(() => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })), {
      ssr: false,
    }),
  },

  // Carousels and Sliders
  swiper: {
    Swiper: dynamic(() => import('swiper').then(mod => ({ default: mod.Swiper })), {
      ssr: false,
      loading: () => <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />
    }),
    SwiperSlide: dynamic(() => import('swiper').then(mod => ({ default: mod.SwiperSlide })), {
      ssr: false,
    }),
  },

  // Rich Text Editor
  reactQuill: {
    ReactQuill: dynamic(() => import('react-quill'), {
      ssr: false,
      loading: () => <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse" />
    }),
  },

  // Modal
  reactModal: {
    Modal: dynamic(() => import('react-modal'), {
      ssr: false,
      loading: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center" />
    }),
  },

  // Cloud Services
  aws: {
    S3Client: dynamic(() => import('@aws-sdk/client-s3').then(mod => ({ default: mod.S3Client })), {
      ssr: false,
    }),
  },

  google: {
    Storage: dynamic(() => import('@google-cloud/storage').then(mod => ({ default: mod.Storage })), {
      ssr: false,
    }),
  },
};

// Utility to dynamically import based on feature flags
export const conditionalDynamicImport = (library: string, component: string) => {
  const featureFlags = {
    charts: process.env.NEXT_PUBLIC_ENABLE_CHARTS !== 'false',
    animations: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS !== 'false',
    cloudServices: process.env.NEXT_PUBLIC_ENABLE_CLOUD_SERVICES !== 'false',
  };

  switch (library) {
    case 'recharts':
      if (!featureFlags.charts) return null;
      return dynamicImports.recharts[component as keyof typeof dynamicImports.recharts];
    
    case 'framerMotion':
      if (!featureFlags.animations) return null;
      return dynamicImports.framerMotion[component as keyof typeof dynamicImports.framerMotion];
    
    case 'swiper':
      if (!featureFlags.animations) return null;
      return dynamicImports.swiper[component as keyof typeof dynamicImports.swiper];
    
    case 'reactQuill':
      return dynamicImports.reactQuill[component as keyof typeof dynamicImports.reactQuill];
    
    case 'reactModal':
      return dynamicImports.reactModal[component as keyof typeof dynamicImports.reactModal];
    
    case 'aws':
      if (!featureFlags.cloudServices) return null;
      return dynamicImports.aws[component as keyof typeof dynamicImports.aws];
    
    case 'google':
      if (!featureFlags.cloudServices) return null;
      return dynamicImports.google[component as keyof typeof dynamicImports.google];
    
    default:
      return null;
  }
};

// Hook for dynamic imports with loading states
export const useDynamicImport = (library: string, component: string) => {
  const DynamicComponent = conditionalDynamicImport(library, component);
  
  return {
    Component: DynamicComponent,
    isLoading: !DynamicComponent,
    isAvailable: !!DynamicComponent,
  };
};

// Utility to preload dynamic imports
export const preloadDynamicImport = (library: string, component: string) => {
  const DynamicComponent = conditionalDynamicImport(library, component);
  
  if (DynamicComponent && typeof window !== 'undefined') {
    // Trigger the dynamic import to start loading
    DynamicComponent.preload?.();
  }
};

// Performance monitoring for dynamic imports
export const monitorDynamicImports = () => {
  if (typeof window !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('chunk') || entry.name.includes('dynamic')) {
          console.log(`📦 Dynamic Import: ${entry.name} - ${entry.duration}ms`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
}; 