
import React, { useState } from 'react';
import { DeckContext } from './context/DeckContext';
import { useDeck } from './hooks/useDeck';
import DeckManager from './components/DeckManager';
import StudyView from './components/StudyView';
import { DeckIcon, StudyIcon } from './components/ui';

type View = 'manager' | 'study';

const App: React.FC = () => {
  const deckData = useDeck();
  const [view, setView] = useState<View>('manager');

  return (
    <DeckContext.Provider value={deckData}>
      <div className="min-h-screen flex flex-col font-sans">
        <header className="bg-white shadow-md sticky top-0 z-20">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-slate-900">Multimedia Flashcards</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setView('manager')}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'manager'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <DeckIcon className="w-5 h-5 mr-2" />
                  Manage Deck
                </button>
                <button
                  onClick={() => setView('study')}
                  disabled={deckData.deck.length === 0}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'study'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <StudyIcon className="w-5 h-5 mr-2" />
                  Study
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {deckData.loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg text-slate-500">Loading your deck...</p>
            </div>
          ) : view === 'manager' ? (
            <DeckManager />
          ) : (
            <StudyView />
          )}
        </main>
        
        <footer className="bg-white py-4 mt-8 border-t border-slate-200">
            <div className="text-center text-sm text-slate-500">
                Created for local use. All your data is saved in your browser.
            </div>
        </footer>
      </div>
    </DeckContext.Provider>
  );
};

export default App;
