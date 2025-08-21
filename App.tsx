import React, { useState, useMemo } from 'react';
import { DecksContext } from './context/DecksContext';
import { useDecks } from './hooks/useDecks';
import DeckManager from './components/DeckManager';
import StudyView from './components/StudyView';
import DeckSelector from './components/DeckSelector';
import { BackIcon } from './components/ui';

type View = 'selector' | 'manager' | 'study';

const App: React.FC = () => {
  const decksData = useDecks();
  const [view, setView] = useState<View>('selector');
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  const activeDeck = useMemo(() => {
    return decksData.decks.find(d => d.id === activeDeckId) || null;
  }, [decksData.decks, activeDeckId]);

  const handleSelectDeck = (deckId: string, targetView: 'manager' | 'study') => {
    setActiveDeckId(deckId);
    setView(targetView);
  };

  const handleBackToDecks = () => {
    setActiveDeckId(null);
    setView('selector');
  }

  const renderContent = () => {
    if (decksData.loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-kuromi-muted">Loading your decks...</p>
        </div>
      );
    }

    switch (view) {
      case 'manager':
        return activeDeck ? <DeckManager deck={activeDeck} /> : <DeckSelector onSelectDeck={handleSelectDeck} />;
      case 'study':
        return activeDeck ? <StudyView deck={activeDeck} /> : <DeckSelector onSelectDeck={handleSelectDeck} />;
      case 'selector':
      default:
        return <DeckSelector onSelectDeck={handleSelectDeck} />;
    }
  };

  return (
    <DecksContext.Provider value={decksData}>
      <div className="min-h-screen flex flex-col font-sans">
        <header className="bg-kuromi-surface/80 backdrop-blur-sm border-b border-kuromi-purple/50 sticky top-0 z-20">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                 {view !== 'selector' && (
                    <button onClick={handleBackToDecks} className="flex items-center text-kuromi-muted hover:text-kuromi-pink mr-4 transition-colors">
                        <BackIcon className="w-5 h-5 mr-2" />
                        <span className="hidden sm:inline">Back to Decks</span>
                    </button>
                 )}
                <h1 className="text-2xl font-extrabold text-white tracking-wider">Kuromi Flashcards</h1>
              </div>
            </div>
          </nav>
        </header>

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
        
        <footer className="bg-kuromi-surface py-4 mt-8 border-t border-kuromi-purple/50">
            <div className="text-center text-sm text-kuromi-muted">
                Created with ♡. All your data is saved in your browser.
            </div>
        </footer>
      </div>
    </DecksContext.Provider>
  );
};

export default App;