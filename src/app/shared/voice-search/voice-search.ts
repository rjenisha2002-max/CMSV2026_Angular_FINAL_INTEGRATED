import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// The Web Speech API types aren't part of standard lib.dom.d.ts in all TS
// versions, so we declare the minimal shape we use here.
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultLike[];
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

/**
 * Reusable microphone / voice-search button.
 *
 * Drop it next to any search <input> and listen for the (result) event
 * to get the transcribed text:
 *
 *   <input [(ngModel)]="searchTerm" />
 *   <app-voice-search (result)="searchTerm = $event; search()"></app-voice-search>
 *
 * It gracefully disables itself if the browser doesn't support the
 * Web Speech API (e.g. Firefox), so it never breaks existing search UI.
 */
@Component({
  selector: 'app-voice-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-search.html',
  styleUrl: './voice-search.scss'
})
export class VoiceSearch implements OnDestroy {
  /** BCP-47 language tag for recognition, e.g. 'en-US', 'en-IN'. */
  @Input() lang = 'en-IN';
  /** Optional title/tooltip override. */
  @Input() title = 'Search by voice';

  /** Emits the final recognized phrase. */
  @Output() result = new EventEmitter<string>();
  /** Emits live interim transcript while the user is still speaking. */
  @Output() interim = new EventEmitter<string>();

  listening = false;
  error = '';
  readonly supported: boolean;

  private recognition: SpeechRecognitionLike | null = null;

  constructor() {
    const SpeechRecognitionCtor: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.supported = !!SpeechRecognitionCtor;

    if (this.supported) {
      this.recognition = new SpeechRecognitionCtor();
      this.recognition!.continuous = false;
      this.recognition!.interimResults = true;
      this.recognition!.maxAlternatives = 1;

      this.recognition!.onresult = (event: SpeechRecognitionEventLike) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += chunk;
          } else {
            interimTranscript += chunk;
          }
        }
        if (interimTranscript) {
          this.interim.emit(interimTranscript.trim());
        }
        if (finalTranscript) {
          this.result.emit(finalTranscript.trim());
        }
      };

      this.recognition!.onerror = (event: any) => {
        this.listening = false;
        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          this.error = 'Microphone access denied.';
        } else if (event?.error === 'no-speech') {
          this.error = 'No speech detected. Try again.';
        } else {
          this.error = 'Voice search failed. Try again.';
        }
      };

      this.recognition!.onend = () => {
        this.listening = false;
      };
    }
  }

  toggle(): void {
    if (!this.supported || !this.recognition) return;

    if (this.listening) {
      this.recognition.stop();
      this.listening = false;
      return;
    }

    this.error = '';
    this.recognition.lang = this.lang;
    try {
      this.recognition.start();
      this.listening = true;
    } catch {
      // start() throws if called while already running; ignore.
    }
  }

  ngOnDestroy(): void {
    this.recognition?.abort();
  }
}
