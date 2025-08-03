import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the chart component
const LazyChart = dynamic(() => import('./chart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading chart...</div>
    </div>
  ),
});

interface LazyChartProps {
  data: any[];
  type: 'bar' | 'line' | 'area' | 'radar' | 'radial';
  title?: string;
  className?: string;
}

export function LazyChartWrapper({ data, type, title, className }: LazyChartProps) {
  return (
    <div className={className}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <Suspense fallback={
        <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      }>
        <LazyChart data={data} type={type} />
      </Suspense>
    </div>
  );
} 