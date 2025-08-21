
import React, { useState, useRef, useEffect } from 'react';
import { useDecksContext } from '../context/DecksContext';
import type { Deck } from '../types';
import { StudyIcon, EditIcon, TrashIcon, DeckIcon } from './ui';
import ConfirmationModal from './ConfirmationModal';
import ImportDeckModal from './ImportDeckModal';

interface DeckSelectorProps {
    onSelectDeck: (deckId: string, view: 'manager' | 'study') => void;
}

const DeckItem: React.FC<{
    deck: Deck;
    onSelect: (view: 'manager' | 'study') => void;
    onDelete: () => void;
}> = ({ deck, onSelect, onDelete }) => {
    const { updateDeckName } = useDecksContext();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(deck.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }

    const saveName = () => {
        if (name.trim() && name.trim() !== deck.name) {
            updateDeckName(deck.id, name.trim());
        } else {
            setName(deck.name);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveName();
        } else if (e.key === 'Escape') {
            setName(deck.name);
            setIsEditing(false);
        }
    }

    return (
        <div className="bg-kuromi-surface rounded-xl p-4 flex flex-col justify-between border border-kuromi-purple/50 hover:border-kuromi-pink hover:shadow-kuromi transition-all duration-300">
            <div className="flex-grow">
                {isEditing ? (
                    <input 
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        onBlur={saveName}
                        onKeyDown={handleKeyDown}
                        className="w-full p-1 bg-kuromi-dark border border-kuromi-pink rounded-md text-xl font-bold"
                    />
                ) : (
                    <h3 onDoubleClick={() => setIsEditing(true)} className="text-xl font-bold text-kuromi-text truncate cursor-pointer" title="Double-click to rename">{deck.name}</h3>
                )}
                <p className="text-sm text-kuromi-muted mt-1">{deck.cards.length} card{deck.cards.length !== 1 && 's'}</p>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-kuromi-purple/20">
                <button onClick={() => onSelect('study')} disabled={deck.cards.length === 0} className="flex items-center text-sm font-medium text-kuromi-pink hover:text-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed">
                    <StudyIcon className="w-5 h-5 mr-2" />
                    Study
                </button>
                <div className="flex items-center space-x-2">
                    <button onClick={() => onSelect('manager')} className="p-2 text-kuromi-muted hover:text-kuromi-pink transition-colors" title="Manage Cards"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={onDelete} className="p-2 text-kuromi-muted hover:text-red-500 transition-colors" title="Delete Deck"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
        </div>
    )
}


const DeckSelector: React.FC<DeckSelectorProps> = ({ onSelectDeck }) => {
    const { decks, addDeck, deleteDeck, importNewDeck } = useDecksContext();
    const [newDeckName, setNewDeckName] = useState('');
    const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleCreateDeck = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDeckName.trim()) {
            addDeck(newDeckName.trim());
            setNewDeckName('');
        }
    };

    const confirmDelete = () => {
        if (deckToDelete) {
            deleteDeck(deckToDelete.id);
            setDeckToDelete(null);
        }
    }

    return (
        <div>
            <div className="mb-8 p-6 bg-kuromi-surface rounded-xl border border-kuromi-purple/50">
                <h2 className="text-2xl font-extrabold mb-4">Create a New Deck</h2>
                <form onSubmit={handleCreateDeck} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={newDeckName}
                        onChange={(e) => setNewDeckName(e.target.value)}
                        placeholder="Enter deck name..."
                        className="flex-grow p-3 bg-kuromi-dark border border-kuromi-purple/50 rounded-lg focus:ring-2 focus:ring-kuromi-pink focus:border-kuromi-pink placeholder-kuromi-muted/50"
                    />
                    <button type="submit" className="bg-kuromi-pink text-black font-bold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all shadow-lg shadow-kuromi-pink/20">
                        Create Deck
                    </button>
                </form>
                 <div className="mt-4 text-center">
                  <button onClick={() => setIsImportModalOpen(true)} className="text-kuromi-purple hover:text-kuromi-pink font-bold py-2 px-4 rounded transition-colors">
                    ... or Import Deck From File
                  </button>
                </div>
            </div>

            <h2 className="text-3xl font-extrabold mb-6">My Decks ({decks.length})</h2>

            {decks.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-kuromi-purple/50 rounded-xl">
                    <DeckIcon className="w-16 h-16 mx-auto text-kuromi-purple mb-4"/>
                    <h3 className="text-xl font-medium text-kuromi-text">You have no decks yet!</h3>
                    <p className="text-kuromi-muted mt-2">Use the form above to create your first deck or import one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {decks.map(deck => (
                        <DeckItem 
                            key={deck.id} 
                            deck={deck} 
                            onSelect={(view) => onSelectDeck(deck.id, view)}
                            onDelete={() => setDeckToDelete(deck)}
                        />
                    ))}
                </div>
            )}
            {deckToDelete && (
                <ConfirmationModal 
                    isOpen={!!deckToDelete}
                    onClose={() => setDeckToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Delete Deck"
                    message={`Are you sure you want to delete the deck "${deckToDelete.name}"? All cards within it will be lost. This action cannot be undone.`}
                />
            )}
            {isImportModalOpen && (
              <ImportDeckModal
                onClose={() => setIsImportModalOpen(false)}
                onImport={importNewDeck}
              />
            )}
        </div>
    );
};

export default DeckSelector;
