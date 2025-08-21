import React from 'react';
import { CloseIcon } from './ui';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-40 p-4">
      <div className="bg-kuromi-surface rounded-xl shadow-xl w-full max-w-md border border-kuromi-purple/50">
        <div className="flex justify-between items-center p-4 border-b border-kuromi-purple/50">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 text-kuromi-muted hover:text-kuromi-text"><CloseIcon className="w-6 h-6"/></button>
        </div>
        <div className="p-6">
          <p className="text-kuromi-muted">{message}</p>
        </div>
        <div className="flex justify-end p-4 bg-kuromi-dark/50 border-t border-kuromi-purple/50 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 mr-2 bg-kuromi-surface border border-kuromi-purple/50 rounded-md hover:bg-kuromi-purple/20">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;