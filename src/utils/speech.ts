
/**
 * Utility for Web Speech API Speech Recognition
 */

export interface SpeechRecognitionOptions {
  lang: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onStart?: () => void;
}

export const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  return new SpeechRecognition();
};

export const isSpeechRecognitionSupported = () => {
  return !!getSpeechRecognition();
};

export const startSpeechRecognition = (options: SpeechRecognitionOptions) => {
  const recognition = getSpeechRecognition();
  if (!recognition) {
    options.onError?.('Speech recognition not supported');
    return null;
  }

  recognition.lang = options.lang;
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = options.interimResults ?? true;

  recognition.onstart = () => {
    options.onStart?.();
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const transcript = finalTranscript || interimTranscript;
    options.onResult?.(transcript, !!finalTranscript);
  };

  recognition.onerror = (event: any) => {
    options.onError?.(event.error);
  };

  recognition.onend = () => {
    options.onEnd?.();
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    console.error('Failed to start speech recognition:', err);
    options.onError?.('Failed to start');
    return null;
  }
};
