/**
 * =========================================================================
 * श्रीमद् भागवत कथा - मुख्य जावास्क्रिप्ट (Simple & Peaceful Logic)
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initPeacefulMusicPlayer();
  initWhatsAppShare();
});

/* ==========================================================================
   1. PEACEFUL MUSIC PLAYER (NO AUTOPLAY, USER CLICK ONLY)
   ========================================================================== */
function initPeacefulMusicPlayer() {
  const config = window.KATHA_MUSIC_CONFIG || {
    audioFilePath: 'assets/music/bhagwat-bhajan.mp3',
    defaultVolume: 0.70,
    loop: true
  };

  const toggleBtn = document.getElementById('player-toggle-btn');
  const muteBtn = document.getElementById('player-mute-btn');
  const playerIcon = document.getElementById('player-icon');
  const muteIcon = document.getElementById('mute-icon');
  const playerStatus = document.getElementById('player-status');

  if (!toggleBtn) return;

  // Audio object
  const audio = new Audio();
  audio.preload = 'none'; // Do not preload heavy data until user plays
  audio.loop = config.loop !== false;
  audio.volume = config.defaultVolume || 0.70;
  audio.src = config.audioFilePath;

  let isPlaying = false;
  let synthEngine = null;

  function setPlayState(playing) {
    isPlaying = playing;
    if (playing) {
      if (playerIcon) playerIcon.textContent = '⏸';
      if (playerStatus) playerStatus.textContent = 'बज रहा है ♫';
      toggleBtn.setAttribute('aria-label', 'संगीत रोकें (Pause)');
    } else {
      if (playerIcon) playerIcon.textContent = '▶';
      if (playerStatus) playerStatus.textContent = 'क्लिक करें (Play)';
      toggleBtn.setAttribute('aria-label', 'संगीत बजाएं (Play)');
    }
  }

  // Pure Web Audio Indian Bansuri & Drone Synthesizer Fallback
  function createBansuriSynth() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(audio.volume * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Tanpura Drones (D, A, D)
      [146.83, 220.0, 293.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.05 / (idx + 1), ctx.currentTime);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
      });

      // Flute Melody: Shri Krishna Govind Hare Murari
      const melodyFreqs = [
        293.66, 329.63, 369.99, 440.0, 440.0, // Shri Krishna Govind...
        493.88, 440.0, 369.99, 329.63, 293.66, // ...Hare Murari
        369.99, 440.0, 493.88, 587.33,         // Hey Nath Narayan...
        493.88, 440.0, 369.99, 329.63, 293.66, // ...Vasudeva
        587.33, 659.25, 587.33, 493.88, 440.0  // Radhe Radhe Govind
      ];
      let noteIndex = 0;
      let fluteInterval = null;

      function playNextNote() {
        if (!synthActive) return;
        const freq = melodyFreqs[noteIndex % melodyFreqs.length];
        noteIndex++;

        const noteOsc = ctx.createOscillator();
        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, ctx.currentTime);

        const vibrato = ctx.createOscillator();
        vibrato.frequency.setValueAtTime(5.5, ctx.currentTime);
        const vibratoGain = ctx.createGain();
        vibratoGain.gain.setValueAtTime(freq * 0.015, ctx.currentTime);
        vibrato.connect(noteOsc.frequency);
        vibrato.start();

        const noteGain = ctx.createGain();
        const now = ctx.currentTime;
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.22, now + 0.35);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        noteOsc.connect(noteGain);
        noteGain.connect(masterGain);

        noteOsc.start(now);
        noteOsc.stop(now + 2.3);
        vibrato.stop(now + 2.3);
      }

      let synthActive = true;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      playNextNote();
      fluteInterval = setInterval(playNextNote, 2400);

      return {
        stop: () => {
          synthActive = false;
          if (fluteInterval) clearInterval(fluteInterval);
          masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
          setTimeout(() => ctx.close().catch(() => {}), 200);
        },
        setVolume: (vol) => {
          masterGain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
        }
      };
    } catch (e) {
      console.warn('Web Audio synth not supported.', e);
      return null;
    }
  }

  function play() {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setPlayState(true);
      }).catch((err) => {
        console.info('Audio file playback fallback to synth:', err);
        if (!synthEngine) {
          synthEngine = createBansuriSynth();
        }
        setPlayState(true);
      });
    } else {
      setPlayState(true);
    }
  }

  function pause() {
    audio.pause();
    if (synthEngine) {
      synthEngine.stop();
      synthEngine = null;
    }
    setPlayState(false);
  }

  toggleBtn.addEventListener('click', () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  });

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      audio.muted = !audio.muted;
      if (muteIcon) {
        muteIcon.textContent = audio.muted ? '🔇' : '🔊';
      }
      if (synthEngine) {
        synthEngine.setVolume(audio.muted ? 0 : audio.volume);
      }
    });
  }

  audio.addEventListener('playing', () => setPlayState(true));
  audio.addEventListener('pause', () => {
    if (!synthEngine) setPlayState(false);
  });
}

/* ==========================================================================
   2. WHATSAPP INVITATION SHARE
   ========================================================================== */
function initWhatsAppShare() {
  const whatsappBtn = document.getElementById('btn-whatsapp');
  if (!whatsappBtn) return;

  whatsappBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const currentUrl = window.location.href;
    const message = 
`॥ श्री राधे कृष्णाय नमः ॥
॥ शुभ आमंत्रण ॥

श्रीमद् भागवत कथा ज्ञान यज्ञ महोत्सव
📅 18 दिसंबर 2026 – 25 दिसंबर 2026
⏰ समय: दोपहर 2:00 बजे से सायं 6:00 बजे तक (तत्पश्चात महाआरती)
📍 स्थल: श्री बांके बिहारी सत्संग धाम प्रांगण, वृन्दावन धाम

"आप सभी धर्मप्रेमी श्रद्धालुओं एवं भक्तजनों को इस पावन कथा में सपरिवार सादर आमंत्रित किया जाता है।"

🌸 आमंत्रण पत्रिका देखें:
${currentUrl}

॥ राधे राधे ॥ जय श्रीकृष्ण ॥`;

    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(shareUrl, '_blank');
  });
}
