import React, { useRef } from 'react';
import { CloseIcon } from './ui';

interface FileInputProps {
  accept: string;
  value: string; // base64 data URL
  onChange: (file: File | null) => void;
}

const FileInput: React.FC<FileInputProps> = ({ accept, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isImage = accept.startsWith('image');
  const isAudio = accept.startsWith('audio');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onChange(file || null);
  };
  
  const handleClear = () => {
    onChange(null);
    if(inputRef.current) {
        inputRef.current.value = '';
    }
  }

  return (
    <div className="w-full">
      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-kuromi-purple/50 rounded-md p-4 text-center text-kuromi-muted hover:border-kuromi-pink hover:text-kuromi-pink transition-colors"
        >
          Click to select a file
        </button>
      ) : (
        <div className="relative p-2 border border-kuromi-purple/50 rounded-md bg-kuromi-dark">
            {isImage && <img src={value} alt="Preview" className="max-h-32 w-auto mx-auto rounded"/>}
            {isAudio && <audio controls src={value} className="w-full"></audio>}
            <button
                type="button"
                onClick={handleClear}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                aria-label="Clear file"
            >
                <CloseIcon className="w-4 h-4"/>
            </button>
        </div>
      )}
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileInput;