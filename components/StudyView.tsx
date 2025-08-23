
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Deck, Flashcard as FlashcardType } from '../types';
import Flashcard from './Flashcard';
import { ShuffleIcon, CheckIcon, XIcon, TagIcon } from './ui';
import { useDecksContext } from '../context/DecksContext';

interface StudyViewProps {
    deck: Deck;
}

const StudyView: React.FC<StudyViewProps> = ({ deck }) => {
  const { updateCardMastery } = useDecksContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyCards, setStudyCards] = useState<FlashcardType[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyTaggedOnly, setStudyTaggedOnly] = useState(false);
  
  const taggedCardsCount = useMemo(() => deck.cards.filter(c => c.needsStudy).length, [deck.cards]);
  
  const filteredCards = useMemo(() => {
    return studyTaggedOnly ? deck.cards.filter(c => c.needsStudy) : deck.cards;
  }, [studyTaggedOnly, deck.cards]);

  const cardIdOrder = useMemo(() => JSON.stringify(filteredCards.map(c => c.id)), [filteredCards]);

  useEffect(() => {
    setStudyCards(filteredCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(false);
  }, [cardIdOrder]);


  const goToNext = useCallback(() => {
    if (studyCards.length > 0) {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev + 1) % studyCards.length);
    }
  }, [studyCards.length]);

  const goToPrev = useCallback(() => {
    if (studyCards.length > 0) {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev - 1 + studyCards.length) % studyCards.length);
    }
  }, [studyCards.length]);

  const handleFeedback = (isCorrect: boolean) => {
    const card = studyCards[currentIndex];
    if (card) {
        updateCardMastery(deck.id, card.id, isCorrect);
    }
    // Advance to the next card after a short delay to allow the state to update
    setTimeout(goToNext, 100);
  }
  
  const handleShuffle = () => {
    setIsFlipped(false);
    if (!isShuffled) {
        const shuffled = [...filteredCards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setStudyCards(shuffled);
        setIsShuffled(true);
    } else {
        setStudyCards(filteredCards);
        setIsShuffled(false);
    }
    setCurrentIndex(0);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') goToNext();
        else if (event.key === 'ArrowLeft') goToPrev();
        else if (event.key === ' ') {
            event.preventDefault(); // Prevent page scroll
            setIsFlipped(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  if (deck.cards.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">No cards to study in "{deck.name}"</h2>
        <p className="text-kuromi-muted mt-2">Please add some cards in the "Manage" view first.</p>
      </div>
    );
  }

  const currentCard = studyCards[currentIndex];

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-2 text-center">Studying: <span className="text-kuromi-pink">{deck.name}</span></h2>
      
      <div className="w-full max-w-2xl mb-4 p-4 bg-kuromi-surface rounded-xl border border-kuromi-purple/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
            <TagIcon className="w-5 h-5 mr-2 text-kuromi-pink"/>
            <span className="font-bold">{taggedCardsCount} cards need study</span>
        </div>
        <label className="flex items-center cursor-pointer">
            <span className="mr-3 font-medium">Study tagged only</span>
            <div className="relative">
                <input type="checkbox" checked={studyTaggedOnly} onChange={() => setStudyTaggedOnly(p => !p)} className="sr-only" />
                <div className={`block w-14 h-8 rounded-full transition-colors ${studyTaggedOnly ? 'bg-kuromi-pink' : 'bg-kuromi-dark'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${studyTaggedOnly ? 'transform translate-x-6' : ''}`}></div>
            </div>
        </label>
      </div>

      <div className="w-full max-w-2xl aspect-[4/3] mb-4 mx-auto">
        {currentCard ? (
            <Flashcard card={currentCard} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} key={currentCard.id}/>
        ) : (
             <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                <h3 className="text-xl font-medium text-kuromi-text">No cards in this study mode.</h3>
                <p className="text-kuromi-muted mt-2">{studyTaggedOnly ? 'Try marking some cards as wrong to tag them for study.' : 'This deck is empty.'}</p>
            </div>
        )}
      </div>
      
      <div className="flex items-center justify-center w-full max-w-2xl space-x-4 mb-2">
        {isFlipped ? (
            <>
                <button onClick={() => handleFeedback(false)} className="flex-1 flex items-center justify-center gap-2 bg-kuromi-pink text-black font-bold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all shadow-lg shadow-kuromi-pink/20">
                    <XIcon className="w-6 h-6"/> Wrong
                </button>
                <button onClick={() => handleFeedback(true)} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-600 transition-all shadow-lg shadow-green-500/20">
                    <CheckIcon className="w-6 h-6"/> Right
                </button>
            </>
        ) : (
            <>
                <button onClick={goToPrev} className="bg-kuromi-surface px-6 py-2 rounded-lg hover:bg-kuromi-purple/30 transition-colors border border-kuromi-purple/50 font-semibold">
                    Previous
                </button>
                <button onClick={handleShuffle} title={isShuffled ? 'Return to original order' : 'Shuffle cards'} className={`p-3 rounded-full transition-colors border ${isShuffled ? 'bg-kuromi-pink/20 text-kuromi-pink border-kuromi-pink/50' : 'bg-kuromi-surface text-kuromi-muted hover:bg-kuromi-purple/30 border-kuromi-purple/50'}`}>
                    <ShuffleIcon className="w-6 h-6" />
                </button>
                <button onClick={goToNext} className="bg-kuromi-surface px-6 py-2 rounded-lg hover:bg-kuromi-purple/30 transition-colors border border-kuromi-purple/50 font-semibold">
                    Next
                </button>
            </>
        )}
      </div>

      <div className="text-lg font-medium text-kuromi-muted mt-2">
          {studyCards.length > 0 ? currentIndex + 1 : 0} / {studyCards.length}
      </div>
       <div className="mt-6 text-sm text-kuromi-muted text-center">
        Tip: Use ← → keys to navigate, and the spacebar to flip the card.
       </div>
    </div>
  );
};

export default StudyView;