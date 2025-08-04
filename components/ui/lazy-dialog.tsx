import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dialog component temporarily disabled for build compatibility

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6">
        <div className="text-gray-500">Dialog component temporarily disabled</div>
      </div>
    </div>
  );
} 