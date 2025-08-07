"use client";

import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, imageUrl }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed flex bg-black/75 inset-0 z-50">
      <div className="relative flex flex-1 overflow-auto">
        {/* Fixed UI Controls */}
        <div className="absolute inset-0 pointer-events-none z-50">
          <button
            onClick={onClose}
            className="absolute text-2xl text-white right-2 top-2 bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center pointer-events-auto"
          >
            &times;
          </button>
        </div>
        
        {/* Image Container - Starts at Top */}
        <div className="w-full h-full overflow-auto p-4">
          <div className="flex items-start justify-center min-w-full min-h-full">
            <img 
              src={imageUrl} 
              alt="Full view" 
              className="max-w-none max-h-none object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal; 