import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, StopIcon, CloseIcon } from './ui';

interface AudioRecorderProps {
  value: string; // base64 data URL
  onRecordingComplete: (audioBase64: string | null) => void;
}

type RecordingStatus = 'idle' | 'recording' | 'denied' | 'error';

const AudioRecorder: React.FC<AudioRecorderProps> = ({ value, onRecordingComplete }) => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus('recording');
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          onRecordingComplete(reader.result as string);
        };
        stream.getTracks().forEach(track => track.stop()); // Stop the microphone access
      };

      mediaRecorderRef.current.start();
      startTimer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setStatus('denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      setStatus('idle');
      stopTimer();
    }
  };
  
  const handleClear = () => {
      onRecordingComplete(null);
  }

  const startTimer = () => {
    setTimer(0);
    timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
    }, 1000);
  };
  
  const stopTimer = () => {
      if(timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
      }
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
  }

  if (value) {
    return (
      <div className="relative p-2 border border-kuromi-purple/50 rounded-md bg-kuromi-dark">
        <audio controls src={value} className="w-full"></audio>
        <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            aria-label="Clear audio"
        >
            <CloseIcon className="w-4 h-4"/>
        </button>
      </div>
    );
  }
  
  if (status === 'denied') {
      return <div className="w-full border-2 border-dashed border-red-400 rounded-md p-4 text-center text-red-400">Microphone access denied. Please enable it in your browser settings.</div>
  }

  return (
    <div className="w-full flex items-center justify-center border-2 border-dashed border-kuromi-purple/50 rounded-md p-4">
      {status === 'recording' ? (
        <div className="flex flex-col items-center">
            <div className="flex items-center text-red-500 font-semibold">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span>
                Recording... {formatTime(timer)}
            </div>
            <button
                type="button"
                onClick={stopRecording}
                className="mt-2 flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
                <StopIcon className="w-5 h-5 mr-2" />
                Stop Recording
            </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center text-kuromi-muted hover:text-kuromi-pink transition-colors"
        >
          <MicIcon className="w-5 h-5 mr-2" />
          Start Recording
        </button>
      )}
    </div>
  );
};

export default AudioRecorder;