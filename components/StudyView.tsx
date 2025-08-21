
import React, { useState, useEffect, useCallback } from 'react';
import { useDeckContext } from '../context/DeckContext';
import Flashcard from './Flashcard';

const StudyView: React.FC = () => {
  const { deck } = useDeckContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % deck.length);
  }, [deck.length]);

  const goToPrev = () => {
    setCurrentIndex(prev => (prev - 1 + deck.length) % deck.length);
  };

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

  if (deck.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">No cards to study</h2>
        <p className="text-slate-500 mt-2">Please add some cards in the "Manage Deck" view first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Study Mode</h2>
      <div className="w-full max-w-2xl mb-4">
        <Flashcard card={deck[currentIndex]} key={deck[currentIndex].id}/>
      </div>
      <div className="flex items-center justify-between w-full max-w-2xl">
        <button
          onClick={goToPrev}
          className="bg-white px-6 py-2 rounded-md shadow hover:bg-slate-100 transition-colors border border-slate-300"
        >
          Previous
        </button>
        <div className="text-lg font-medium text-slate-600">
          {currentIndex + 1} / {deck.length}
        </div>
        <button
          onClick={goToNext}
          className="bg-white px-6 py-2 rounded-md shadow hover:bg-slate-100 transition-colors border border-slate-300"
        >
          Next
        </button>
      </div>
       <div className="mt-6 text-sm text-slate-500">
        Tip: You can use the left and right arrow keys to navigate. Click the card to flip.
       </div>
    </div>
  );
};

export default StudyView;
