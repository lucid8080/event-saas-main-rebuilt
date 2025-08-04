import dynamic from 'next/dynamic';

// Temporarily disabled all dynamic imports to avoid 'self is not defined' error during build
export const dynamicImports = {
  // Charts and Data Visualization - temporarily disabled
  recharts: {
    BarChart: () => <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />,
    LineChart: () => <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />,
    AreaChart: () => <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />,
    RadarChart: () => <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />,
  },

  // Animations - temporarily disabled for build compatibility
  framerMotion: {
    motion: () => <div className="animate-pulse bg-gray-200 rounded h-8 w-full" />,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },

  // Carousels and Sliders - temporarily disabled for build compatibility
  swiper: {
    Swiper: () => <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />,
    SwiperSlide: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },

  // Rich Text Editor - temporarily disabled
  reactQuill: {
    ReactQuill: () => <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse" />,
  },

  // Modal - temporarily disabled
  reactModal: {
    Modal: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center" />,
  },

  // Cloud Services - temporarily disabled for build compatibility
  aws: {
    S3Client: () => null,
  },

  google: {
    Storage: () => null,
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
  
  if (
    DynamicComponent && 
    typeof window !== 'undefined' &&
    typeof (DynamicComponent as any).preload === 'function'
  ) {
    // Trigger the dynamic import to start loading
    (DynamicComponent as any).preload();
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