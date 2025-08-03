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
    <div className="fixed flex bg-black /75 inset-0 items-center justify-center">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute text-2xl text-white right-2 top-2"
        >
          &times;
        </button>
        <img src={imageUrl} alt="Full view" className="max-w-full max-h-full" />
      </div>
    </div>
  );
};

export default Modal; 