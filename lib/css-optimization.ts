// CSS optimization utilities for better performance

// Critical CSS extraction
export const criticalCSS = `
  /* Critical styles that should be inlined */
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }
  
  .bg-gray-200 {
    background-color: rgb(229 231 235);
  }
  
  .text-gray-500 {
    color: rgb(107 114 128);
  }
  
  .rounded-lg {
    border-radius: 0.5rem;
  }
  
  .w-full {
    width: 100%;
  }
  
  .h-64 {
    height: 16rem;
  }
  
  .flex {
    display: flex;
  }
  
  .items-center {
    align-items: center;
  }
  
  .justify-center {
    justify-content: center;
  }
`;

// Lazy load CSS for non-critical styles
export const lazyLoadCSS = (href: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined') {
    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = '/fonts/GeistVF.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    // Preload critical images
    const imageLink = document.createElement('link');
    imageLink.rel = 'preload';
    imageLink.href = '/opengraph-image.jpg';
    imageLink.as = 'image';
    document.head.appendChild(imageLink);
  }
};

// CSS-in-JS optimization
export const optimizedStyles = {
  // Optimized loading states
  loading: {
    pulse: 'animate-pulse bg-gray-200 rounded',
    skeleton: 'bg-gray-200 animate-pulse',
    spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
  },
  
  // Optimized transitions
  transitions: {
    fade: 'transition-opacity duration-300',
    slide: 'transition-transform duration-300',
    scale: 'transition-transform duration-200',
  },
  
  // Optimized responsive classes
  responsive: {
    container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  },
};

// Utility to inject critical CSS
export const injectCriticalCSS = () => {
  if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.insertBefore(style, document.head.firstChild);
  }
};

// Utility to remove unused CSS
export const removeUnusedCSS = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // This would typically be handled by PurgeCSS or similar tools
    // For now, we'll just log the optimization
    console.log('🧹 CSS optimization: Unused styles would be removed in production');
  }
};

// Performance monitoring for CSS
export const monitorCSSPerformance = () => {
  if (typeof window !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('.css')) {
          console.log(`📊 CSS Load Time: ${entry.name} - ${entry.duration}ms`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
}; 