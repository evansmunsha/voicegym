// global.d.ts - add minimal browser speech API types used in the app

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
  }

  var SpeechRecognition: any;

  interface SpeechRecognition {
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
    onstart?: () => void;
    onresult?: (event: any) => void;
    onerror?: (event: any) => void;
    onend?: () => void;
    start: () => void;
    stop: () => void;
  }

  interface SpeechSynthesisUtterance {
    rate: number;
    onend?: () => void;
    onerror?: () => void;
  }
}

export {};
