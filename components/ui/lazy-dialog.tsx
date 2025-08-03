import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the dialog component
const LazyDialog = dynamic(() => import('./dialog'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 animate-pulse">
        <div className="w-64 h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
});

interface LazyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function LazyDialogWrapper({ open, onOpenChange, children, title, description }: LazyDialogProps) {
  if (!open) return null;

  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 animate-pulse">
          <div className="w-64 h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <LazyDialog open={open} onOpenChange={onOpenChange}>
        {children}
      </LazyDialog>
    </Suspense>
  );
} 