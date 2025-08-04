import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Chart component temporarily disabled for build compatibility

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
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Chart component temporarily disabled</div>
      </div>
    </div>
  );
} 