
import React, { useState, useRef } from 'react';
import type { Flashcard } from '../types';
import { CloseIcon, UploadIcon } from './ui';

interface ImportDeckModalProps {
  onClose: () => void;
  onImport: (deckName: string, cards: Omit<Flashcard, 'id'>[]) => void;
}

const ImportDeckModal: React.FC<ImportDeckModalProps> = ({ onClose, onImport }) => {
  const [deckName, setDeckName] = useState('');
  const [fileName, setFileName] = useState('');
  const [cardsToImport, setCardsToImport] = useState<Omit<Flashcard, 'id'>[] | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const result = e.target?.result;
            if (typeof result !== 'string') throw new Error("File could not be read");
            const data = JSON.parse(result);
            if (Array.isArray(data.cards)) {
                setCardsToImport(data.cards);
            } else {
                throw new Error("Invalid file format: 'cards' array not found.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid JSON file.');
            setCardsToImport(null);
            setFileName('');
        }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim()) {
        setError('Please enter a name for the deck.');
        return;
    }
    if (!cardsToImport) {
        setError('Please select a valid card file to import.');
        return;
    }
    onImport(deckName.trim(), cardsToImport);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-40 p-4" role="dialog" aria-modal="true">
      <div className="bg-kuromi-surface rounded-xl shadow-xl w-full max-w-md border border-kuromi-purple/50">
        <div className="flex justify-between items-center p-4 border-b border-kuromi-purple/50">
          <h2 className="text-xl font-bold">Import New Deck</h2>
          <button onClick={onClose} className="p-2 text-kuromi-muted hover:text-kuromi-text" aria-label="Close"><CloseIcon className="w-6 h-6"/></button>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="deckName" className="block text-sm font-medium text-kuromi-muted mb-1">Deck Name</label>
                    <input
                        id="deckName"
                        type="text"
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                        placeholder="Enter a name for the new deck..."
                        className="w-full p-2 bg-kuromi-dark border border-kuromi-purple/50 rounded-md focus:ring-2 focus:ring-kuromi-pink focus:border-kuromi-pink placeholder-kuromi-muted/50"
                        required
                        aria-required="true"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-kuromi-muted mb-1">Card File (.json)</label>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        aria-hidden="true"
                    />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 bg-kuromi-dark border border-kuromi-purple/50 rounded-md hover:border-kuromi-pink transition-colors">
                        <UploadIcon className="w-5 h-5" />
                        <span>{fileName || 'Select File'}</span>
                    </button>
                </div>
                {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
            </div>
            <div className="flex justify-end p-4 bg-kuromi-dark/50 border-t border-kuromi-purple/50 rounded-b-lg">
                <button type="button" onClick={onClose} className="px-4 py-2 mr-2 bg-kuromi-surface border border-kuromi-purple/50 rounded-md hover:bg-kuromi-purple/20">Cancel</button>
                <button type="submit" disabled={!deckName || !cardsToImport} className="px-4 py-2 bg-kuromi-pink text-black font-bold rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">Import Deck</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ImportDeckModal;
