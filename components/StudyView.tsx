import React, { useState, useEffect, useCallback } from 'react';
import type { Deck } from '../types';
import Flashcard from './Flashcard';

interface StudyViewProps {
    deck: Deck;
}

const StudyView: React.FC<StudyViewProps> = ({ deck }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Reset index if deck changes or becomes empty
  useEffect(() => {
    setCurrentIndex(0);
  }, [deck.id]);

  const goToNext = useCallback(() => {
    if (deck.cards.length > 0) {
        setCurrentIndex(prev => (prev + 1) % deck.cards.length);
    }
  }, [deck.cards.length]);

  const goToPrev = useCallback(() => {
    if (deck.cards.length > 0) {
        setCurrentIndex(prev => (prev - 1 + deck.cards.length) % deck.cards.length);
    }
  }, [deck.cards.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') {
            goToNext();
        } else if (event.key === 'ArrowLeft') {
            goToPrev();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrev]);

  if (deck.cards.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">No cards to study in "{deck.name}"</h2>
        <p className="text-kuromi-muted mt-2">Please add some cards in the "Manage" view first.</p>
      </div>
    );
  }

  const currentCard = deck.cards[currentIndex];

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-center">Studying: <span className="text-kuromi-pink">{deck.name}</span></h2>
      <div className="w-full max-w-2xl mb-4">
        {currentCard && <Flashcard card={currentCard} key={currentCard.id}/>}
      </div>
      <div className="flex items-center justify-between w-full max-w-2xl">
        <button
          onClick={goToPrev}
          className="bg-kuromi-surface px-6 py-2 rounded-lg hover:bg-kuromi-purple/30 transition-colors border border-kuromi-purple/50 font-semibold"
        >
          Previous
        </button>
        <div className="text-lg font-medium text-kuromi-muted">
          {currentIndex + 1} / {deck.cards.length}
        </div>
        <button
          onClick={goToNext}
          className="bg-kuromi-surface px-6 py-2 rounded-lg hover:bg-kuromi-purple/30 transition-colors border border-kuromi-purple/50 font-semibold"
        >
          Next
        </button>
      </div>
       <div className="mt-6 text-sm text-kuromi-muted text-center">
        Tip: You can use the left and right arrow keys to navigate. Click the card to flip.
       </div>
    </div>
  );
};

export default StudyView;