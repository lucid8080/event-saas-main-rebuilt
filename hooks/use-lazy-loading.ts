import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  batchSize?: number;
}

interface UseLazyLoadingReturn {
  isVisible: boolean;
  hasLoaded: boolean;
  isLoading: boolean;
  ref: React.RefObject<HTMLElement>;
  load: () => void;
}

export function useLazyLoading(options: UseLazyLoadingOptions = {}): UseLazyLoadingReturn {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    batchSize = 10
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const load = useCallback(() => {
    if (!hasLoaded && !isLoading) {
      setIsLoading(true);
      // Simulate loading delay for better UX with staggered timing
      setTimeout(() => {
        setHasLoaded(true);
        setIsLoading(false);
      }, Math.random() * 200 + 50); // Random delay between 50-250ms for staggered loading
    }
  }, [hasLoaded, isLoading]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers - load immediately
      setIsVisible(true);
      load();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          load();
          // Once loaded, disconnect the observer
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, load]);

  return {
    isVisible,
    hasLoaded,
    isLoading,
    ref,
    load,
  };
}

// Hook for batch loading multiple items
export function useBatchLazyLoading<T>(
  items: T[],
  options: UseLazyLoadingOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    batchSize = 10
  } = options;

  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (isLoading || currentIndex >= items.length) return;

    setIsLoading(true);
    
    // Progressive loading with staggered timing for better UX
    const delay = Math.random() * 100 + 100; // Random delay between 100-200ms
    setTimeout(() => {
      const nextBatch = items.slice(currentIndex, currentIndex + batchSize);
      setVisibleItems(prev => [...prev, ...nextBatch]);
      setCurrentIndex(prev => prev + batchSize);
      setIsLoading(false);
    }, delay);
  }, [items, currentIndex, batchSize, isLoading]);

  useEffect(() => {
    // Load initial batch
    if (items.length > 0 && visibleItems.length === 0) {
      const initialBatch = items.slice(0, batchSize);
      setVisibleItems(initialBatch);
      setCurrentIndex(batchSize);
    }
  }, [items, batchSize, visibleItems.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !('IntersectionObserver' in window)) {
      // Fallback: load all items immediately
      setVisibleItems(items);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && currentIndex < items.length) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [currentIndex, items.length, threshold, rootMargin, loadMore]);

  return {
    visibleItems,
    isLoading,
    hasMore: currentIndex < items.length,
    sentinelRef,
  };
} 