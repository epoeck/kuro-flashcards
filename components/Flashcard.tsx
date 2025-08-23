
import React from 'react';
import type { Flashcard as FlashcardType, CardContent } from '../types';

const CardSide: React.FC<{ content: CardContent }> = ({ content }) => {
    return (
        <div className="bg-gradient-to-br from-kuromi-surface to-kuromi-dark rounded-xl border border-kuromi-purple/50 w-full h-full p-6 flex flex-col justify-center items-center text-center overflow-auto">
            {content.image && <img src={content.image} alt="Card visual" className="max-w-full max-h-48 object-contain rounded-md mb-4"/>}
            {content.text && <p className="text-2xl text-kuromi-text mb-4 whitespace-pre-wrap">{content.text}</p>}
            {content.audio && <audio controls src={content.audio} className="w-full max-w-xs"></audio>}
        </div>
    );
};


const Flashcard: React.FC<{ card: FlashcardType, isFlipped: boolean, onFlip: () => void }> = ({ card, isFlipped, onFlip }) => {
  return (
    <div
      className="w-full h-full cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
      role="button"
      aria-label="Flip card"
    >
      <div
        className="relative w-full h-full transition-transform duration-700 rounded-xl shadow-kuromi overflow-hidden"
        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
          <CardSide content={card.front} />
        </div>
        <div className="absolute w-full h-full" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
          <CardSide content={card.back} />
        </div>
      </div>
    </div>
  );
};

export default Flashcard;