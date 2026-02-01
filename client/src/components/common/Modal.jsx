import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-surface rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="text-text-secondary mb-6">
          {children}
        </div>
        <div className="flex justify-end space-x-4">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger">
            Confirm Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;