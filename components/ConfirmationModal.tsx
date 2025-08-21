
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800"><CloseIcon className="w-6 h-6"/></button>
        </div>
        <div className="p-6">
          <p className="text-slate-600">{message}</p>
        </div>
        <div className="flex justify-end p-4 bg-slate-50 border-t rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 mr-2 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
