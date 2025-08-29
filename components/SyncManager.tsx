import React, { useState } from 'react';
import { useDecksContext } from '../context/DecksContext';
import { CopyIcon, CheckIcon, SyncIcon } from './ui';

const SyncManager: React.FC = () => {
  const { syncId, loadDecksFromSyncId } = useDecksContext();
  const [inputSyncId, setInputSyncId] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopyToClipboard = () => {
    if (syncId) {
      navigator.clipboard.writeText(syncId);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
    }
  };
  
  const handleLoadDecks = (e: React.FormEvent) => {
      e.preventDefault();
      if(inputSyncId.trim()){
          if(window.confirm(`Tem a certeza? Isto irá substituir os seus decks atuais por aqueles do ID que inseriu.`)){
              loadDecksFromSyncId(inputSyncId.trim());
          }
      }
  }

  return (
    <div className="mb-8 p-6 bg-kuromi-surface rounded-xl border border-kuromi-purple/50">
      <h2 className="text-2xl font-extrabold mb-4 flex items-center"><SyncIcon className="w-6 h-6 mr-3 text-kuromi-purple"/>Sincronização na Nuvem</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-kuromi-muted mb-1">O seu ID de Sincronização Pessoal</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={syncId || 'Crie o seu primeiro deck para obter um ID...'}
              className="flex-grow p-3 bg-kuromi-dark border border-kuromi-purple/50 rounded-lg placeholder-kuromi-muted/50 text-kuromi-text"
            />
            <button 
                onClick={handleCopyToClipboard}
                disabled={!syncId}
                className="w-12 h-12 flex items-center justify-center bg-kuromi-purple text-white rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasCopied ? <CheckIcon className="w-6 h-6"/> : <CopyIcon className="w-6 h-6"/>}
            </button>
          </div>
          <p className="text-xs text-kuromi-muted mt-2">Guarde este ID. Use-o noutro dispositivo para carregar os seus decks.</p>
        </div>

        <hr className="border-kuromi-purple/20"/>

        <div>
          <form onSubmit={handleLoadDecks}>
            <label htmlFor="loadId" className="block text-sm font-medium text-kuromi-muted mb-1">Carregar Decks de um ID</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                id="loadId"
                type="text"
                value={inputSyncId}
                onChange={(e) => setInputSyncId(e.target.value)}
                placeholder="Cole um ID de sincronização aqui..."
                className="flex-grow p-3 bg-kuromi-dark border border-kuromi-purple/50 rounded-lg focus:ring-2 focus:ring-kuromi-pink focus:border-kuromi-pink placeholder-kuromi-muted/50"
              />
              <button type="submit" className="bg-kuromi-pink text-black font-bold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all shadow-lg shadow-kuromi-pink/20">
                Carregar Decks
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SyncManager;