import React, { useState, useRef } from 'react';
import { useDecksContext } from '../context/DecksContext';
import type { Flashcard, Deck } from '../types';
import CardEditor from './CardEditor';
import ConfirmationModal from './ConfirmationModal';
import { PlusIcon, EditIcon, TrashIcon, TagIcon, UploadIcon, DownloadIcon } from './ui';

interface DeckManagerProps {
    deck: Deck;
}

const CardPreview: React.FC<{ 
    card: Flashcard; 
    onEdit: () => void; 
    onDelete: () => void;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ card, onEdit, onDelete, isSelected, onSelect }) => {
    const truncate = (str: string = '', len: number) => {
        return str.length > len ? str.substring(0, len) + '...' : str;
    };
    
    return (
        <div 
          className={`relative bg-kuromi-surface rounded-xl p-4 flex flex-col justify-between border transition-all duration-300 cursor-pointer ${isSelected ? 'border-kuromi-pink shadow-kuromi' : 'border-kuromi-purple/50 hover:border-kuromi-pink hover:shadow-kuromi'}`}
          onClick={onSelect}
        >
            <div className="absolute top-2 left-2 z-10">
                <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={onSelect}
                    onClick={(e) => e.stopPropagation()} // Prevent card click from firing twice
                    className="h-5 w-5 rounded bg-kuromi-dark border-kuromi-purple/50 text-kuromi-pink focus:ring-kuromi-pink"
                />
            </div>

            {card.needsStudy && (
                <div className="absolute top-2 right-2 text-kuromi-pink" title="Needs Study">
                    <TagIcon className="w-5 h-5"/>
                </div>
            )}
            <div className="pt-6">
                <div className="mb-2">
                    <h3 className="font-semibold text-sm text-kuromi-muted uppercase tracking-wider">FRONT</h3>
                    <p className="text-kuromi-text min-h-[40px]">{truncate(card.front.text, 50)}</p>
                    {card.front.image && <div className="text-xs text-kuromi-purple">[Image]</div>}
                    {card.front.audio && <div className="text-xs text-kuromi-purple">[Audio]</div>}
                </div>
                <hr className="my-2 border-kuromi-purple/20"/>
                <div>
                    <h3 className="font-semibold text-sm text-kuromi-muted uppercase tracking-wider">BACK</h3>
                    <p className="text-kuromi-text min-h-[40px]">{truncate(card.back.text, 50)}</p>
                    {card.back.image && <div className="text-xs text-kuromi-purple">[Image]</div>}
                    {card.back.audio && <div className="text-xs text-kuromi-purple">[Audio]</div>}
                </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-kuromi-muted hover:text-kuromi-pink transition-colors"><EditIcon className="w-5 h-5"/></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-kuromi-muted hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5"/></button>
            </div>
        </div>
    );
};

const DeckManager: React.FC<DeckManagerProps> = ({ deck }) => {
  const { deleteCard, importCardsToDeck } = useDecksContext();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Flashcard | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Flashcard | null>(null);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleAddNew = () => {
    setCardToEdit(null);
    setIsEditorOpen(true);
  };
  
  const handleEdit = (card: Flashcard) => {
    setCardToEdit(card);
    setIsEditorOpen(true);
  };

  const handleDeleteRequest = (card: Flashcard) => {
    setCardToDelete(card);
  }

  const confirmDelete = () => {
    if (cardToDelete) {
        deleteCard(deck.id, cardToDelete.id);
        setSelectedCardIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(cardToDelete.id);
            return newSet;
        });
        setCardToDelete(null);
    }
  }

  const handleCardSelect = (cardId: string) => {
    setSelectedCardIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(cardId)) {
            newSet.delete(cardId);
        } else {
            newSet.add(cardId);
        }
        return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCardIds.size === deck.cards.length) {
        setSelectedCardIds(new Set());
    } else {
        setSelectedCardIds(new Set(deck.cards.map(c => c.id)));
    }
  };

  const handleExportSelected = () => {
    const selectedCards = deck.cards.filter(card => selectedCardIds.has(card.id));
    const cardsToExport = selectedCards.map(({ id, ...rest }) => rest);
    
    const dataStr = JSON.stringify({ cards: cardsToExport }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${deck.name}-cards.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    importFileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const result = e.target?.result;
            if (typeof result !== 'string') throw new Error("File could not be read");
            const data = JSON.parse(result);
            if (Array.isArray(data.cards)) {
                importCardsToDeck(deck.id, data.cards);
                alert(`${data.cards.length} cards imported successfully!`);
            } else {
                throw new Error("Invalid file format: 'cards' array not found.");
            }
        } catch (error) {
            console.error("Import failed:", error);
            alert(`Import failed. Please check the file format. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            // Reset file input value to allow re-uploading the same file
            if(importFileInputRef.current) importFileInputRef.current.value = "";
        }
    };
    reader.readAsText(file);
  };

  const allSelected = deck.cards.length > 0 && selectedCardIds.size === deck.cards.length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-3xl font-extrabold text-center sm:text-left">Managing: <span className="text-kuromi-pink">{deck.name}</span> ({deck.cards.length} Cards)</h2>
        <button onClick={handleAddNew} className="flex items-center bg-kuromi-pink text-black font-bold px-5 py-2.5 rounded-lg hover:bg-opacity-90 transition-all shadow-lg shadow-kuromi-pink/20 w-full sm:w-auto justify-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Card
        </button>
      </div>
      
      <div className="mb-6 p-4 bg-kuromi-surface rounded-xl border border-kuromi-purple/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
            <button onClick={handleImportClick} className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg bg-kuromi-purple text-white hover:bg-opacity-90 transition-colors">
                <UploadIcon className="w-5 h-5"/> Import Cards
            </button>
            <input type="file" accept=".json" ref={importFileInputRef} onChange={handleImportFile} className="hidden"/>
        </div>

        {deck.cards.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="select-all"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="h-5 w-5 rounded bg-kuromi-dark border-kuromi-purple/50 text-kuromi-pink focus:ring-kuromi-pink"
                />
                <label htmlFor="select-all" className="ml-3 font-medium cursor-pointer">
                    {allSelected ? 'Deselect All' : 'Select All'}
                </label>
            </div>
            <button onClick={handleExportSelected} disabled={selectedCardIds.size === 0} className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg bg-kuromi-purple text-white hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <DownloadIcon className="w-5 h-5"/> Export Selected ({selectedCardIds.size})
            </button>
          </div>
        )}
      </div>

      {deck.cards.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-kuromi-purple/50 rounded-xl">
              <h3 className="text-xl font-medium text-kuromi-text">This deck is empty!</h3>
              <p className="text-kuromi-muted mt-2">Click "Add New Card" or use the "Import Cards" button above to get started.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {deck.cards.map(card => (
            <CardPreview 
                key={card.id} 
                card={card} 
                onEdit={() => handleEdit(card)} 
                onDelete={() => handleDeleteRequest(card)}
                isSelected={selectedCardIds.has(card.id)}
                onSelect={() => handleCardSelect(card.id)}
            />
          ))}
        </div>
      )}

      {isEditorOpen && (
        <CardEditor
          deckId={deck.id}
          cardToEdit={cardToEdit}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {cardToDelete && (
          <ConfirmationModal 
            isOpen={!!cardToDelete}
            onClose={() => setCardToDelete(null)}
            onConfirm={confirmDelete}
            title="Delete Card"
            message="Are you sure you want to delete this flashcard? This action cannot be undone."
          />
      )}
    </div>
  );
};

export default DeckManager;