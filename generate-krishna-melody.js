const fs = require('fs');
const path = require('path');

// Generate 60 seconds of soulful, sweet Indian Krishna Bansuri & Tanpura Melody
const sampleRate = 44100;
const duration = 64; // 64 seconds loop
const totalSamples = sampleRate * duration;
const numChannels = 2;
const bytesPerSample = 2;
const blockAlign = numChannels * bytesPerSample;
const byteRate = sampleRate * blockAlign;
const dataSize = totalSamples * blockAlign;

const buffer = Buffer.alloc(44 + dataSize);

// Write standard 16-bit PCM WAV Header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(bytesPerSample * 8, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Key of D (Pure Indian Bansuri pitch)
const NOTES = {
  REST: 0,
  LowPa: 220.00,
  LowDha: 246.94,
  LowNi: 277.18,
  Sa: 293.66,
  Re: 329.63,
  Ga: 369.99,
  Ma: 392.00,
  TivraMa: 415.30,
  Pa: 440.00,
  Dha: 493.88,
  Ni: 554.37,
  Sa2: 587.33,
  Re2: 659.25,
  Ga2: 739.99
};

// Recognizable Devotional Krishna Melody (Shri Krishna Govind Hare Murari & Achyutam Keshavam)
const melody = [
  // Intro flute call
  { note: NOTES.Sa, dur: 2.0 },
  { note: NOTES.Re, dur: 1.0 },
  { note: NOTES.Ga, dur: 2.0 },
  { note: NOTES.Pa, dur: 3.0 },
  { note: NOTES.REST, dur: 0.5 },

  // Phrase 1: "Shri Krishna Govind..." (Sa Re Ga Pa Pa)
  { note: NOTES.Sa, dur: 1.0 },
  { note: NOTES.Re, dur: 0.8 },
  { note: NOTES.Ga, dur: 1.2 },
  { note: NOTES.Pa, dur: 2.0 },
  { note: NOTES.Pa, dur: 1.5 },
  // "...Hare Murari" (Dha Pa Ga Re Sa)
  { note: NOTES.Dha, dur: 1.0 },
  { note: NOTES.Pa, dur: 1.5 },
  { note: NOTES.Ga, dur: 1.2 },
  { note: NOTES.Re, dur: 1.0 },
  { note: NOTES.Sa, dur: 2.5 },
  { note: NOTES.REST, dur: 0.5 },

  // Phrase 2: "Hey Nath Narayan..." (Ga Pa Dha Sa2)
  { note: NOTES.Ga, dur: 1.2 },
  { note: NOTES.Pa, dur: 1.2 },
  { note: NOTES.Dha, dur: 1.5 },
  { note: NOTES.Sa2, dur: 2.5 },
  // "...Vasudeva" (Dha Pa Ga Re Sa)
  { note: NOTES.Dha, dur: 1.0 },
  { note: NOTES.Pa, dur: 1.2 },
  { note: NOTES.Ga, dur: 1.2 },
  { note: NOTES.Re, dur: 1.0 },
  { note: NOTES.Sa, dur: 3.0 },
  { note: NOTES.REST, dur: 0.8 },

  // Phrase 3: High lyrical crest (Radhe Radhe Govinda...)
  { note: NOTES.Sa2, dur: 1.8 },
  { note: NOTES.Re2, dur: 1.2 },
  { note: NOTES.Sa2, dur: 2.0 },
  { note: NOTES.Dha, dur: 1.5 },
  { note: NOTES.Pa, dur: 2.5 },
  { note: NOTES.REST, dur: 0.5 },

  // Phrase 4: "Achyutam Keshavam..." (Sa Re Ga, Ga Re Ga Pa)
  { note: NOTES.Sa, dur: 1.0 },
  { note: NOTES.Re, dur: 1.0 },
  { note: NOTES.Ga, dur: 1.8 },
  { note: NOTES.Ga, dur: 1.0 },
  { note: NOTES.Re, dur: 0.8 },
  { note: NOTES.Ga, dur: 1.2 },
  { note: NOTES.Pa, dur: 2.5 },
  // "...Krishna Damodaram" (Pa Dha Pa Ga Re Sa)
  { note: NOTES.Pa, dur: 1.0 },
  { note: NOTES.Dha, dur: 1.2 },
  { note: NOTES.Pa, dur: 1.0 },
  { note: NOTES.Ga, dur: 1.2 },
  { note: NOTES.Re, dur: 1.0 },
  { note: NOTES.Sa, dur: 3.5 },
  { note: NOTES.REST, dur: 0.8 },

  // Phrase 5: Sweet outro descent to peace
  { note: NOTES.LowDha, dur: 1.5 },
  { note: NOTES.LowNi, dur: 1.5 },
  { note: NOTES.Sa, dur: 4.5 },
  { note: NOTES.REST, dur: 1.0 }
];

// Timeline computation
let timeline = [];
let currentTime = 1.0;
for (const p of melody) {
  timeline.push({
    start: currentTime,
    end: currentTime + p.dur,
    freq: p.note,
    dur: p.dur
  });
  currentTime += p.dur;
}

// Temple bell chime timestamps
const bellTimes = [1.0, 9.5, 18.0, 26.5, 36.0, 47.0];

for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;

  // 1. Tanpura drone (Sa, Pa, Sa', Low Sa) with authentic harmonic resonance
  const tanpuraSa = 146.83;
  const tanpuraPa = 220.00;
  const tanpuraHighSa = 293.66;

  const cyclePeriod = 4.0;
  const cyclePhase = (t % cyclePeriod) / cyclePeriod;
  const p1 = Math.exp(-((cyclePhase - 0.0) % 1.0) * 3.5);
  const p2 = Math.exp(-((cyclePhase - 0.25) % 1.0) * 3.5);
  const p3 = Math.exp(-((cyclePhase - 0.50) % 1.0) * 3.5);
  const p4 = Math.exp(-((cyclePhase - 0.75) % 1.0) * 3.5);

  let droneLeft = 0;
  let droneRight = 0;

  const addTanpuraString = (freq, pluck, pan) => {
    let s = 0;
    s += Math.sin(2 * Math.PI * freq * t) * 0.40;
    s += Math.sin(2 * Math.PI * freq * 2 * t) * 0.28;
    s += Math.sin(2 * Math.PI * freq * 3 * t) * 0.16;
    s += Math.sin(2 * Math.PI * freq * 4 * t) * 0.08;
    s += Math.sin(2 * Math.PI * (freq * 3.01) * t) * 0.05; // Jawari buzz
    const amp = pluck * 0.15;
    droneLeft += s * amp * (1 - pan);
    droneRight += s * amp * pan;
  };

  addTanpuraString(tanpuraPa, p1, 0.35);
  addTanpuraString(tanpuraHighSa, p2, 0.65);
  addTanpuraString(tanpuraHighSa, p3, 0.45);
  addTanpuraString(tanpuraSa, p4, 0.55);

  // Warm foundation pad
  const pad = (
    Math.sin(2 * Math.PI * tanpuraSa * t) * 0.05 +
    Math.sin(2 * Math.PI * tanpuraPa * t) * 0.04
  );
  droneLeft += pad;
  droneRight += pad;

  // 2. Temple bell (Manjira) chime
  let bellSound = 0;
  for (const bt of bellTimes) {
    if (t >= bt && t < bt + 3.0) {
      const dt = t - bt;
      const env = Math.exp(-dt * 3.0);
      bellSound += (
        Math.sin(2 * Math.PI * 2093.0 * dt) * 0.5 +
        Math.sin(2 * Math.PI * 4186.0 * dt) * 0.3 +
        Math.sin(2 * Math.PI * 5587.0 * dt) * 0.2
      ) * env * 0.08;
    }
  }

  // 3. Bansuri (Bamboo Flute)
  let flute = 0;
  for (const seg of timeline) {
    if (t >= seg.start && t < seg.end && seg.freq > 0) {
      const segT = t - seg.start;
      
      // Attack and release envelope (sweet flute breath)
      let env = 1.0;
      const attack = 0.25;
      const release = 0.35;
      if (segT < attack) {
        env = Math.sin((segT / attack) * (Math.PI / 2));
      } else if (t > seg.end - release) {
        const rem = (seg.end - t) / release;
        env = Math.sin(Math.max(0, rem) * (Math.PI / 2));
      }

      // Natural flute vibrato (develops after 0.3s)
      const vibStart = 0.3;
      const vibDepth = segT > vibStart ? Math.min(0.016, (segT - vibStart) * 0.018) : 0;
      const vib = Math.sin(2 * Math.PI * 5.2 * t) * vibDepth;
      const f = seg.freq * (1 + vib);

      // Flute timbre (pure hollow bamboo harmonics)
      let sample = Math.sin(2 * Math.PI * f * t);
      sample += Math.sin(2 * Math.PI * f * 2 * t) * 0.26;
      sample += Math.sin(2 * Math.PI * f * 3 * t) * 0.12;
      sample += Math.sin(2 * Math.PI * f * 4 * t) * 0.04;

      // Soft breath turbulence
      const breath = (Math.random() * 2 - 1) * 0.03;
      flute = (sample + breath) * env * 0.32;
      break;
    }
  }

  // Mix channels with stereo spatialization
  const leftTotal = droneLeft * 0.65 + flute * 0.78 + bellSound * 0.5;
  const rightTotal = droneRight * 0.65 + flute * 0.82 + bellSound * 0.7;

  // Master fade
  let master = 1.0;
  if (t < 2.0) master = t / 2.0;
  else if (t > duration - 2.5) master = (duration - t) / 2.5;

  const leftClamped = Math.max(-1, Math.min(1, leftTotal * master));
  const rightClamped = Math.max(-1, Math.min(1, rightTotal * master));

  const left16 = Math.floor(leftClamped * 32767);
  const right16 = Math.floor(rightClamped * 32767);

  const offset = 44 + i * 4;
  buffer.writeInt16LE(left16, offset);
  buffer.writeInt16LE(right16, offset + 2);
}

// Write to both assets/music/bhagwat-bhajan.mp3 and .wav, and create krishna-melody.mp3
const musicDir = path.join(__dirname, 'assets', 'music');
fs.writeFileSync(path.join(musicDir, 'bhagwat-bhajan.mp3'), buffer);
fs.writeFileSync(path.join(musicDir, 'bhagwat-bhajan.wav'), buffer);
fs.writeFileSync(path.join(musicDir, 'krishna-melody.mp3'), buffer);
fs.writeFileSync(path.join(musicDir, 'krishna-melody.wav'), buffer);

console.log('Sweet Krishna melody generated successfully (duration: ' + duration + 's, size: ' + (buffer.length / 1024 / 1024).toFixed(2) + ' MB)');
