'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';


// Minimal fallback types for Web Speech API (for build environments)
declare global {
  // Only declare if not already present
  // @ts-ignore
  var SpeechRecognition: any;
  // @ts-ignore
  var webkitSpeechRecognition: any;
  // @ts-ignore
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  // @ts-ignore
  type SpeechRecognition = any;
  // @ts-ignore
  type SpeechRecognitionEvent = any;
  // @ts-ignore
  type SpeechRecognitionErrorEvent = any;
}

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onResponse: (response: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscript, onResponse, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          onTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const startRecording = () => {
    if (recognitionRef.current && !disabled) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const speakResponse = (text: string) => {
    if (synthesisRef.current) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synthesisRef.current.speak(utterance);
    }
  };

  const handleResponse = (response: string) => {
    onResponse(response);
    speakResponse(response);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Voice Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`voice-button ${isRecording ? 'recording' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? (
          <MicOff size={32} className="animate-pulse" />
        ) : (
          <Mic size={32} />
        )}
      </motion.div>

      {/* Status */}
      <div className="text-center">
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 font-medium"
          >
            Listening... Speak now!
          </motion.div>
        )}
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center space-x-2 text-primary-600"
          >
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </motion.div>
        )}
      </div>

      {/* Transcript */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card max-w-md w-full"
        >
          <h3 className="text-lg font-semibold mb-2">You said:</h3>
          <p className="text-gray-700">{transcript}</p>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-center text-gray-600 max-w-sm">
        <p className="text-sm">
          {isRecording 
            ? 'Click the microphone again to stop recording'
            : 'Click the microphone to start voice input'
          }
        </p>
      </div>
    </div>
  );
}
