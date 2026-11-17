const fs = require('fs');
const path = require('path');

// Generate 45 seconds of soothing Indian Bansuri (Flute) & Tanpura ambient music
const sampleRate = 44100;
const duration = 40; // 40 seconds loop
const totalSamples = sampleRate * duration;
const numChannels = 2;
const bytesPerSample = 2;
const blockAlign = numChannels * bytesPerSample;
const byteRate = sampleRate * blockAlign;
const dataSize = totalSamples * blockAlign;

const buffer = Buffer.alloc(44 + dataSize);

// Write WAV Header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Frequencies (Key of D)
// Sa: 293.66 Hz, Re: 329.63 Hz, Ga: 369.99 Hz, Ma: 392.00 Hz, Pa: 440.00 Hz, Dha: 493.88 Hz, Ni: 554.37 Hz, Sa2: 587.33 Hz, Re2: 659.25 Hz
const NOTES = {
  REST: 0,
  LowPa: 220.00,
  LowDha: 246.94,
  LowNi: 277.18,
  Sa: 293.66,
  Re: 329.63,
  Ga: 369.99,
  Ma: 392.00,
  Pa: 440.00,
  Dha: 493.88,
  Ni: 554.37,
  Sa2: 587.33,
  Re2: 659.25,
  Ga2: 739.99
};

// Devotional Melody (Raag Yaman / Bhupali style sweet phrases)
const melody = [
  // Phrase 1: Gentle introductory invocation
  { note: NOTES.Sa, dur: 3.0 },
  { note: NOTES.Re, dur: 1.5 },
  { note: NOTES.Ga, dur: 2.5 },
  { note: NOTES.Pa, dur: 3.0 },
  { note: NOTES.REST, dur: 0.5 },
  
  // Phrase 2: Ascending grace
  { note: NOTES.Ga, dur: 1.5 },
  { note: NOTES.Pa, dur: 1.5 },
  { note: NOTES.Dha, dur: 2.5 },
  { note: NOTES.Sa2, dur: 3.5 },
  { note: NOTES.REST, dur: 0.5 },

  // Phrase 3: High devotional crest
  { note: NOTES.Sa2, dur: 1.5 },
  { note: NOTES.Re2, dur: 1.5 },
  { note: NOTES.Sa2, dur: 2.0 },
  { note: NOTES.Dha, dur: 2.0 },
  { note: NOTES.Pa, dur: 3.0 },
  { note: NOTES.REST, dur: 0.5 },

  // Phrase 4: Gentle descent to tranquility
  { note: NOTES.Ga, dur: 2.0 },
  { note: NOTES.Pa, dur: 1.5 },
  { note: NOTES.Ga, dur: 1.5 },
  { note: NOTES.Re, dur: 2.5 },
  { note: NOTES.Sa, dur: 4.5 },
  { note: NOTES.REST, dur: 1.0 },

  // Phrase 5: Deep meditative resolution
  { note: NOTES.LowDha, dur: 1.5 },
  { note: NOTES.LowNi, dur: 1.5 },
  { note: NOTES.Sa, dur: 4.0 }
];

// Precompute note intervals
let timeline = [];
let currentTime = 0.5;
for (const p of melody) {
  timeline.push({
    start: currentTime,
    end: currentTime + p.dur,
    freq: p.note,
    dur: p.dur
  });
  currentTime += p.dur;
}

// Render audio
for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;

  // 1. Tanpura Drone (Sa, Pa, Sa', Low Sa) with subtle jawari harmonics
  const tanpuraSa = 146.83; // D3
  const tanpuraPa = 220.00; // A3
  const tanpuraHighSa = 293.66; // D4

  // Slowly cycle tanpura strings: Pa -> Sa -> Sa -> Low Sa
  const cyclePeriod = 5.0; // 5 seconds per cycle
  const cyclePhase = (t % cyclePeriod) / cyclePeriod;
  const stringPluck1 = Math.exp(-((cyclePhase - 0.0) % 1.0) * 4);
  const stringPluck2 = Math.exp(-((cyclePhase - 0.25) % 1.0) * 4);
  const stringPluck3 = Math.exp(-((cyclePhase - 0.50) % 1.0) * 4);
  const stringPluck4 = Math.exp(-((cyclePhase - 0.75) % 1.0) * 4);

  let droneLeft = 0;
  let droneRight = 0;

  // Add rich harmonic overtones for authentic warm acoustic Indian Tanpura
  const addString = (freq, pluck, pan) => {
    let s = 0;
    s += Math.sin(2 * Math.PI * freq * t) * 0.45;
    s += Math.sin(2 * Math.PI * freq * 2 * t) * 0.30;
    s += Math.sin(2 * Math.PI * freq * 3 * t) * 0.15;
    s += Math.sin(2 * Math.PI * freq * 4 * t) * 0.08;
    s += Math.sin(2 * Math.PI * freq * 5 * t) * 0.04;
    // jawari shimmer
    s += Math.sin(2 * Math.PI * (freq * 3.01) * t) * 0.06;
    const amp = pluck * 0.14;
    droneLeft += s * amp * (1 - pan);
    droneRight += s * amp * pan;
  };

  addString(tanpuraPa, stringPluck1, 0.4);
  addString(tanpuraHighSa, stringPluck2, 0.6);
  addString(tanpuraHighSa, stringPluck3, 0.45);
  addString(tanpuraSa, stringPluck4, 0.55);

  // Constant base warm drone
  const constantDrone = (
    Math.sin(2 * Math.PI * tanpuraSa * t) * 0.06 +
    Math.sin(2 * Math.PI * tanpuraPa * t) * 0.04 +
    Math.sin(2 * Math.PI * tanpuraHighSa * t) * 0.03
  );
  droneLeft += constantDrone;
  droneRight += constantDrone;

  // 2. Bansuri (Flute) synthesis
  let flute = 0;
  for (const seg of timeline) {
    if (t >= seg.start && t < seg.end && seg.freq > 0) {
      const segT = t - seg.start;
      const progress = segT / seg.dur;
      
      // Gentle attack and release envelope (flute breath swelling)
      let env = 1.0;
      const attackTime = 0.35;
      const releaseTime = 0.4;
      if (segT < attackTime) {
        env = Math.sin((segT / attackTime) * (Math.PI / 2));
      } else if (t > seg.end - releaseTime) {
        const rem = (seg.end - t) / releaseTime;
        env = Math.sin(Math.max(0, rem) * (Math.PI / 2));
      }

      // Devotional Vibrato (develops naturally after initial attack)
      const vibratoStart = 0.4;
      const vibratoDepth = segT > vibratoStart ? Math.min(0.015, (segT - vibratoStart) * 0.015) : 0;
      const vibrato = Math.sin(2 * Math.PI * 5.2 * t) * vibratoDepth;
      const currentFreq = seg.freq * (1 + vibrato);

      // Flute timbre (dominant fundamental + gentle 2nd, 3rd, 4th harmonics + warm breath)
      let fluteSample = Math.sin(2 * Math.PI * currentFreq * t);
      fluteSample += Math.sin(2 * Math.PI * currentFreq * 2 * t) * 0.28;
      fluteSample += Math.sin(2 * Math.PI * currentFreq * 3 * t) * 0.12;
      fluteSample += Math.sin(2 * Math.PI * currentFreq * 4 * t) * 0.05;

      // Subtle breath turbulence
      const breath = (Math.random() * 2 - 1) * 0.035;
      flute = (fluteSample + breath) * env * 0.28;
      break;
    }
  }

  // Gentle stereo panning & reverb illusion
  const leftTotal = droneLeft * 0.6 + flute * 0.75;
  const rightTotal = droneRight * 0.6 + flute * 0.8;

  // Fade in at start and fade out at end for seamless looping
  let masterEnv = 1.0;
  if (t < 2.0) {
    masterEnv = t / 2.0;
  } else if (t > duration - 2.0) {
    masterEnv = (duration - t) / 2.0;
  }

  const leftClamped = Math.max(-1, Math.min(1, leftTotal * masterEnv));
  const rightClamped = Math.max(-1, Math.min(1, rightTotal * masterEnv));

  const left16 = Math.floor(leftClamped * 32767);
  const right16 = Math.floor(rightClamped * 32767);

  const offset = 44 + i * 4;
  buffer.writeInt16LE(left16, offset);
  buffer.writeInt16LE(right16, offset + 2);
}

// Save as both bhagwat-bhajan.mp3 and bhagwat-bhajan.wav
const wavPath = path.join(__dirname, 'assets', 'music', 'bhagwat-bhajan.wav');
const mp3Path = path.join(__dirname, 'assets', 'music', 'bhagwat-bhajan.mp3');

fs.writeFileSync(wavPath, buffer);
fs.writeFileSync(mp3Path, buffer);

console.log('Devotional audio created successfully:');
console.log('  WAV:', wavPath, '(' + (buffer.length / 1024 / 1024).toFixed(2) + ' MB)');
console.log('  MP3:', mp3Path, '(' + (buffer.length / 1024 / 1024).toFixed(2) + ' MB)');
