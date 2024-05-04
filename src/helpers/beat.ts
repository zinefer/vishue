// A class to store time-based state for a beat

// A type to store the beats per minute and the start offset
// this type is used to calculate the current beat based on the current time
export type BeatsIdentifier = {
  perMinute: number;
  startOffset: number;
}

// Beat range enum
export enum BeatRange {
  ZeroOneZero,
}

// A beat class that can return the current beat based on the current time
// and the beats per minute.
// 
// The beat representation can be a float from -1 to 0, 0 to 1 or -1 to 1.
// This is useful for animations that need to loop back and forth.
export class Beat {
  private identifier: BeatsIdentifier;
  private returnRange: BeatRange = BeatRange.ZeroOneZero;

  constructor(identifier: BeatsIdentifier) {
    this.identifier = identifier;
  }

  get(time: number): number {
      const elapsedTime = time - this.identifier.startOffset;
      const millisecondsPerBeat = 60 / this.identifier.perMinute * 1000 * 2 * 4;
      const progressWithinBeat = (elapsedTime % millisecondsPerBeat) / millisecondsPerBeat;
      return this.getBeatRange(progressWithinBeat);
  }

  private getBeatRange(value: number): number {
    switch (this.returnRange) {
      case BeatRange.ZeroOneZero:
        return value < 0.5 ? value * 2 : (1 - value) * 2;
      default:
        return value;
    }
  }
}



/* 
export class Beat {
  private bpm: BPM;
  private startTime: number;

  constructor(bpm: BPM) {
    this.bpm = bpm;
    this.startTime = performance.now();
  }

  // Get the current time in beats
  get time() {
    return (performance.now() - this.startTime) / 1000 * this.bpm.perMinute / 60 + this.bpm.startOffset;
  }

  // Get the current beat
  get beat() {
    return this.time % 1;
  }
}
*/