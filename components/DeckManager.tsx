
import React, { useState } from 'react';
import { useDeckContext } from '../context/DeckContext';
import type { Flashcard } from '../types';
import CardEditor from './CardEditor';
import ConfirmationModal from './ConfirmationModal';
import { PlusIcon, EditIcon, TrashIcon } from './ui';

const CardPreview: React.FC<{ card: Flashcard; onEdit: () => void; onDelete: () => void; }> = ({ card, onEdit, onDelete }) => {
    const truncate = (str: string = '', len: number) => {
        return str.length > len ? str.substring(0, len) + '...' : str;
    };
    
    return (
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
                <div className="mb-2">
                    <h3 className="font-semibold text-sm text-slate-500">FRONT</h3>
                    <p className="text-slate-800">{truncate(card.front.text, 50)}</p>
                    {card.front.image && <div className="text-xs text-indigo-500">[Image]</div>}
                    {card.front.audio && <div className="text-xs text-indigo-500">[Audio]</div>}
                </div>
                <hr className="my-2"/>
                <div>
                    <h3 className="font-semibold text-sm text-slate-500">BACK</h3>
                    <p className="text-slate-800">{truncate(card.back.text, 50)}</p>
                    {card.back.image && <div className="text-xs text-indigo-500">[Image]</div>}
                    {card.back.audio && <div className="text-xs text-indigo-500">[Audio]</div>}
                </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
                <button onClick={onEdit} className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"><EditIcon className="w-5 h-5"/></button>
                <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-600 transition-colors"><TrashIcon className="w-5 h-5"/></button>
            </div>
        </div>
    );
};

const DeckManager: React.FC = () => {
  const { deck, deleteCard } = useDeckContext();
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
        deleteCard(cardToDelete.id);
        setCardToDelete(null);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">My Deck ({deck.length} Cards)</h2>
        <button onClick={handleAddNew} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Card
        </button>
      </div>
      
      {deck.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-lg">
              <h3 className="text-xl font-medium text-slate-700">Your deck is empty!</h3>
              <p className="text-slate-500 mt-2">Click "Add New Card" to get started.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {deck.map(card => (
            <CardPreview key={card.id} card={card} onEdit={() => handleEdit(card)} onDelete={() => handleDeleteRequest(card)} />
          ))}
        </div>
      )}

      {isEditorOpen && (
        <CardEditor
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
