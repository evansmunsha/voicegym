//speech.ts


/**
 * Speech Recognition Utility
 * Handles Web Speech API for voice recording and transcription
 */

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export class SpeechRecognizer {
  private recognition: any;
  private isListening: boolean = false;
  private transcript: string = "";
  private isFinal: boolean = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error("Speech Recognition API not supported in this browser");
    }
    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  private setupRecognition() {
    this.recognition.language = "en-US";
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
  }

  /**
   * Start listening for speech
   */
  start(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.transcript = "";
      this.isFinal = false;
      this.isListening = true;

      this.recognition.onstart = () => {
        console.log("Speech recognition started");
      };

      this.recognition.onresult = (event: any) => {
        this.transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          this.transcript += transcriptSegment;

          if (event.results[i].isFinal) {
            this.isFinal = true;
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        resolve(this.transcript);
      };

      this.recognition.start();
    });
  }

  /**
   * Stop listening for speech
   */
  stop() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Get current transcript
   */
  getTranscript(): string {
    return this.transcript;
  }

  /**
   * Check if listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Get final state
   */
  getIsFinal(): boolean {
    return this.isFinal;
  }
}

/**
 * Speak text using Web Speech API
 */
export function speakText(text: string, rate: number = 1): Promise<void> {
  return new Promise((resolve, reject) => {
    const SpeechSynthesis = window.speechSynthesis;
    if (!SpeechSynthesis) {
      reject(new Error("Speech Synthesis API not supported"));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Speech synthesis failed"));

    SpeechSynthesis.speak(utterance);
  });
}

/**
 * Stop current speech
 */
export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
