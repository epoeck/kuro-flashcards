import React, { useState, useEffect } from 'react';
import { useDecksContext } from '../context/DecksContext';
import type { Flashcard, CardContent } from '../types';
import FileInput from './FileInput';
import AudioRecorder from './AudioRecorder';
import { CloseIcon } from './ui';

interface CardEditorProps {
  deckId: string;
  cardToEdit: Flashcard | null;
  onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
};

const CardEditor: React.FC<CardEditorProps> = ({ deckId, cardToEdit, onClose }) => {
  const { addCard, updateCard } = useDecksContext();
  const [front, setFront] = useState<CardContent>({ text: '', image: '', audio: '' });
  const [back, setBack] = useState<CardContent>({ text: '', image: '', audio: '' });
  
  useEffect(() => {
    if (cardToEdit) {
      setFront(cardToEdit.front);
      setBack(cardToEdit.back);
    }
  }, [cardToEdit]);

  const handleContentChange = (side: 'front' | 'back', content: CardContent) => {
    if (side === 'front') {
      setFront(content);
    } else {
      setBack(content);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cardData = { front, back };
    if (cardToEdit) {
      updateCard(deckId, { ...cardData, id: cardToEdit.id });
    } else {
      addCard(deckId, cardData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-30 p-4">
      <div className="bg-kuromi-surface rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-kuromi-purple/50">
        <div className="flex justify-between items-center p-4 border-b border-kuromi-purple/50">
          <h2 className="text-xl font-bold">{cardToEdit ? 'Edit Card' : 'Add New Card'}</h2>
          <button onClick={onClose} className="p-2 text-kuromi-muted hover:text-kuromi-text"><CloseIcon className="w-6 h-6"/></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto">
            <div className="flex flex-col md:flex-row p-6 gap-6">
                <CardSideEditor title="Front" content={front} onChange={(c) => handleContentChange('front', c)} />
                <div className="border-l border-kuromi-purple/50 hidden md:block mx-2"></div>
                <hr className="md:hidden border-kuromi-purple/50"/>
                <CardSideEditor title="Back" content={back} onChange={(c) => handleContentChange('back', c)} />
            </div>
            <div className="flex justify-end p-4 bg-kuromi-dark/50 border-t border-kuromi-purple/50 rounded-b-lg">
                <button type="button" onClick={onClose} className="px-4 py-2 mr-2 bg-kuromi-surface border border-kuromi-purple/50 rounded-md hover:bg-kuromi-purple/20">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-kuromi-pink text-black font-bold rounded-md hover:bg-opacity-90">Save Card</button>
            </div>
        </form>
      </div>
    </div>
  );
};

interface CardSideEditorProps {
    title: string;
    content: CardContent;
    onChange: (content: CardContent) => void;
}

const CardSideEditor: React.FC<CardSideEditorProps> = ({ title, content, onChange }) => {
    const [audioInputMode, setAudioInputMode] = useState<'upload' | 'record'>('upload');

    const handleFileChange = async (file: File | null, type: 'image' | 'audio') => {
        if (!file) {
            onChange({ ...content, [type]: '' });
            return;
        }
        try {
            const base64 = await fileToBase64(file);
            onChange({ ...content, [type]: base64 });
        } catch (error) {
            console.error("Error converting file to Base64", error);
        }
    }

    const handleRecordingComplete = (audioBase64: string | null) => {
        onChange({ ...content, audio: audioBase64 || '' });
    }

    return (
        <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div>
                <label className="block text-sm font-medium text-kuromi-muted mb-1">Text</label>
                <textarea
                    value={content.text}
                    onChange={(e) => onChange({ ...content, text: e.target.value })}
                    rows={4}
                    className="w-full p-2 bg-kuromi-dark border border-kuromi-purple/50 rounded-md focus:ring-2 focus:ring-kuromi-pink focus:border-kuromi-pink placeholder-kuromi-muted/50"
                    placeholder={`Text for the ${title.toLowerCase()} of the card...`}
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-kuromi-muted mb-1">Image</label>
                <FileInput
                    accept="image/*"
                    value={content.image || ''}
                    onChange={(file) => handleFileChange(file, 'image')}
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-kuromi-muted mb-1">Audio</label>
                <div className="flex items-center space-x-2 mb-2">
                    <button type="button" onClick={() => setAudioInputMode('upload')} className={`px-3 py-1 text-sm rounded-full transition-colors ${audioInputMode === 'upload' ? 'bg-kuromi-pink text-black font-bold' : 'bg-kuromi-dark text-kuromi-text'}`}>Upload File</button>
                    <button type="button" onClick={() => setAudioInputMode('record')} className={`px-3 py-1 text-sm rounded-full transition-colors ${audioInputMode === 'record' ? 'bg-kuromi-pink text-black font-bold' : 'bg-kuromi-dark text-kuromi-text'}`}>Record Audio</button>
                </div>
                {audioInputMode === 'upload' ? (
                    <FileInput
                        accept="audio/*"
                        value={content.audio || ''}
                        onChange={(file) => handleFileChange(file, 'audio')}
                    />
                ) : (
                    <AudioRecorder
                        value={content.audio || ''}
                        onRecordingComplete={handleRecordingComplete}
                    />
                )}
            </div>
        </div>
    )
}

export default CardEditor;