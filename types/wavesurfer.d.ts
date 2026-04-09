declare module 'wavesurfer.js' {
  export default class WaveSurfer {
    constructor(options?: any);
    load(src: string): void;
    play(): void;
    destroy(): void;
    on(event: string, cb: (...args: any[]) => void): void;
    static create(options?: any): WaveSurfer;
  }
}
