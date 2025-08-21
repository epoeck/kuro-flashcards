import React, { useState } from 'react';
import { useDecksContext } from '../context/DecksContext';
import type { Flashcard, Deck } from '../types';
import CardEditor from './CardEditor';
import ConfirmationModal from './ConfirmationModal';
import { PlusIcon, EditIcon, TrashIcon } from './ui';

interface DeckManagerProps {
    deck: Deck;
}

const CardPreview: React.FC<{ card: Flashcard; onEdit: () => void; onDelete: () => void; }> = ({ card, onEdit, onDelete }) => {
    const truncate = (str: string = '', len: number) => {
        return str.length > len ? str.substring(0, len) + '...' : str;
    };
    
    return (
        <div className="bg-kuromi-surface rounded-xl p-4 flex flex-col justify-between border border-kuromi-purple/50 hover:border-kuromi-pink hover:shadow-kuromi transition-all duration-300">
            <div>
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
                <button onClick={onEdit} className="p-2 text-kuromi-muted hover:text-kuromi-pink transition-colors"><EditIcon className="w-5 h-5"/></button>
                <button onClick={onDelete} className="p-2 text-kuromi-muted hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5"/></button>
            </div>
        </div>
    );
};

const DeckManager: React.FC<DeckManagerProps> = ({ deck }) => {
  const { deleteCard } = useDecksContext();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Flashcard | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Flashcard | null>(null);

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
        setCardToDelete(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-extrabold text-center sm:text-left">Managing: <span className="text-kuromi-pink">{deck.name}</span> ({deck.cards.length} Cards)</h2>
        <button onClick={handleAddNew} className="flex items-center bg-kuromi-pink text-black font-bold px-5 py-2.5 rounded-lg hover:bg-opacity-90 transition-all shadow-lg shadow-kuromi-pink/20 w-full sm:w-auto justify-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Card
        </button>
      </div>
      
      {deck.cards.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-kuromi-purple/50 rounded-xl">
              <h3 className="text-xl font-medium text-kuromi-text">This deck is empty!</h3>
              <p className="text-kuromi-muted mt-2">Click "Add New Card" to get started.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {deck.cards.map(card => (
            <CardPreview key={card.id} card={card} onEdit={() => handleEdit(card)} onDelete={() => handleDeleteRequest(card)} />
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