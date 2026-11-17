/**
 * =========================================================================
 * श्रीमद् भागवत कथा अमृत महोत्सव - मुख्य डिजिटल आमंत्रण जावास्क्रिप्ट
 * Premium Interactive Invitation Card Logic
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initEnvelopeInteraction();
  initPetalCanvas();
  initMusicPlayer();
  initProgrammeFilter();
  initActionButtons();
});

/* ==========================================================================
   1. ENVELOPE OPENING ANIMATION & TRANSITIONS
   ========================================================================== */
function initEnvelopeInteraction() {
  const envelopeScreen = document.getElementById('envelope-screen');
  const cardScreen = document.getElementById('card-screen');
  const openBtn = document.getElementById('open-envelope-btn');
  const flap = document.getElementById('envelope-flap');
  const viewCoverBtn = document.getElementById('view-cover-btn');

  if (!openBtn || !envelopeScreen || !cardScreen) return;

  function openInvitation() {
    // 1. Open the 3D flap
    if (flap) {
      flap.classList.add('opened');
    }

    // 2. Trigger celebratory petal & gold sparkle burst
    if (window.triggerPetalBurst) {
      window.triggerPetalBurst();
    }

    // 3. Try starting music (user gesture enables autoplay)
    if (window.playKathaMusic) {
      window.playKathaMusic();
    }

    // 4. Smooth transition from envelope to invitation card
    setTimeout(() => {
      envelopeScreen.classList.add('hidden');
      cardScreen.style.display = 'flex';

      // Trigger reflow for transition
      void cardScreen.offsetWidth;
      cardScreen.classList.add('revealed');

      if (viewCoverBtn) {
        viewCoverBtn.style.display = 'inline-flex';
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
  }

  function showCover() {
    cardScreen.classList.remove('revealed');
    setTimeout(() => {
      cardScreen.style.display = 'none';
      envelopeScreen.classList.remove('hidden');
      if (flap) {
        flap.classList.remove('opened');
      }
      if (viewCoverBtn) {
        viewCoverBtn.style.display = 'none';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  }

  openBtn.addEventListener('click', openInvitation);

  if (viewCoverBtn) {
    viewCoverBtn.addEventListener('click', showCover);
  }
}

/* ==========================================================================
   2. BACKGROUND DEVOTIONAL MUSIC PLAYER WITH GRACEFUL FALLBACK
   ========================================================================== */
function initMusicPlayer() {
  const config = window.KATHA_MUSIC_CONFIG || {
    audioFilePath: 'assets/music/bhagwat-bhajan.mp3',
    trackTitle: 'श्री कृष्ण गोविन्द हरे मुरारे',
    defaultVolume: 0.75,
    loop: true
  };

  const toggleBtn = document.getElementById('music-toggle-btn');
  const soundWave = document.getElementById('sound-wave');
  const playIcon = toggleBtn ? toggleBtn.querySelector('.play-icon') : null;
  const pauseIcon = toggleBtn ? toggleBtn.querySelector('.pause-icon') : null;

  const audio = new Audio();
  audio.preload = 'auto';
  audio.loop = config.loop !== false;
  audio.volume = config.defaultVolume || 0.75;
  audio.src = config.audioFilePath;

  let isPlaying = false;
  let synthEngine = null;

  function updateUI(playing) {
    isPlaying = playing;
    if (playing) {
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'inline-block';
      if (soundWave) soundWave.classList.add('active');
    } else {
      if (playIcon) playIcon.style.display = 'inline-block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (soundWave) soundWave.classList.remove('active');
    }
  }

  // Web Audio Bansuri & Tanpura Drone Synthesizer (Zero-dependency fallback)
  function createBansuriSynth() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(audio.volume * 0.45, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Tanpura Drones (D, A, D)
      [146.83, 220.0, 293.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.06 / (idx + 1), ctx.currentTime);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
      });

      // Krishna Flute Melody Notes: Shri Krishna Govind Hare Murari
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
        noteGain.gain.exponentialRampToValueAtTime(0.25, now + 0.35);
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
        }
      };
    } catch (e) {
      console.warn('Synth error:', e);
      return null;
    }
  }

  function playMusic() {
    if (isPlaying) return;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        updateUI(true);
      }).catch((err) => {
        console.info('Audio file playback failed, using bansuri synth:', err);
        if (!synthEngine) {
          synthEngine = createBansuriSynth();
        }
        updateUI(true);
      });
    } else {
      updateUI(true);
    }
  }

  function pauseMusic() {
    audio.pause();
    if (synthEngine) {
      synthEngine.stop();
      synthEngine = null;
    }
    updateUI(false);
  }

  function toggleMusic() {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleMusic);
  }

  audio.addEventListener('playing', () => updateUI(true));
  audio.addEventListener('pause', () => {
    if (!synthEngine) updateUI(false);
  });

  // Global handle for opening invitation trigger
  window.playKathaMusic = playMusic;
}

/* ==========================================================================
   3. FALLING FLOWER PETALS & GOLD SHIMMER CANVAS
   ========================================================================== */
function initPetalCanvas() {
  const canvas = document.getElementById('petal-canvas');
  const toggleBtn = document.getElementById('petal-toggle-btn');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const maxPetals = 38;
  let isRunning = true;

  // Petal types: Marigold yellow/orange & Rose red/pink + Golden Sparkles
  const petalPalettes = [
    { fill: '#FFA000', edge: '#FF6F00' }, // Marigold orange
    { fill: '#FFD54F', edge: '#FFA000' }, // Marigold gold
    { fill: '#D81B60', edge: '#AD1457' }, // Rose pink/red
    { fill: '#E53935', edge: '#B71C1C' }, // Sacred red petal
    { fill: '#FFF176', edge: '#FFD54F', isSparkle: true } // Golden sparkle
  ];

  class Petal {
    constructor(x, y, isBurst = false) {
      this.reset(x, y, isBurst);
    }

    reset(startX, startY, isBurst = false) {
      this.palette = petalPalettes[Math.floor(Math.random() * petalPalettes.length)];
      this.isSparkle = !!this.palette.isSparkle;

      this.x = startX !== undefined ? startX : Math.random() * width;
      this.y = startY !== undefined ? startY : -20 - Math.random() * 40;

      this.size = this.isSparkle ? 2 + Math.random() * 3 : 7 + Math.random() * 9;
      this.speedY = isBurst ? (Math.random() - 0.5) * 8 : 1 + Math.random() * 1.8;
      this.speedX = isBurst ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * 1.5;

      this.angle = Math.random() * Math.PI * 2;
      this.angularSpeed = (Math.random() - 0.5) * 0.04;
      this.oscillationSpeed = 0.02 + Math.random() * 0.03;
      this.oscillationDistance = 20 + Math.random() * 30;
      this.originX = this.x;
      this.step = Math.random() * 100;
      this.opacity = 0.7 + Math.random() * 0.3;
    }

    update() {
      this.step += this.oscillationSpeed;
      this.y += this.speedY;
      this.x = this.originX + Math.sin(this.step) * this.oscillationDistance;
      this.originX += this.speedX * 0.5;
      this.angle += this.angularSpeed;

      if (this.y > height + 25 || this.x < -30 || this.x > width + 30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.opacity;

      if (this.isSparkle) {
        // Draw 4-point golden star
        ctx.fillStyle = this.palette.fill;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.lineTo(this.size * 2, 0);
          ctx.lineTo(this.size * 0.4, this.size * 0.4);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Draw delicate curved Indian petal shape
        ctx.fillStyle = this.palette.fill;
        ctx.strokeStyle = this.palette.edge;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.5, this.size * 0.8, this.size * 0.5, 0, this.size);
        ctx.bezierCurveTo(-this.size * 0.8, this.size * 0.5, -this.size * 0.8, -this.size * 0.5, 0, -this.size);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Populate initial petals
  for (let i = 0; i < maxPetals; i++) {
    petals.push(new Petal(Math.random() * width, Math.random() * height));
  }

  function triggerPetalBurst() {
    const centerX = width / 2;
    const centerY = height / 2;
    for (let i = 0; i < 30; i++) {
      petals.push(new Petal(centerX, centerY, true));
    }
  }
  window.triggerPetalBurst = triggerPetalBurst;

  function render() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.update();
      p.draw();
      // Clean up extra burst petals
      if (petals.length > maxPetals && p.y > height) {
        petals.splice(i, 1);
      }
    }

    requestAnimationFrame(render);
  }

  render();

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isRunning = !isRunning;
      toggleBtn.classList.toggle('off', !isRunning);
      if (isRunning) {
        toggleBtn.querySelector('.btn-icon').textContent = '🌸';
        render();
      } else {
        toggleBtn.querySelector('.btn-icon').textContent = '⏸️';
        ctx.clearRect(0, 0, width, height);
      }
    });
  }
}

/* ==========================================================================
   4. EIGHT-DAY PROGRAMME QUICK FILTER / TABS
   ========================================================================== */
function initProgrammeFilter() {
  const filterBtns = document.querySelectorAll('.day-filter-btn');
  const dayCards = document.querySelectorAll('.day-card');

  if (!filterBtns.length || !dayCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedDay = btn.getAttribute('data-day');

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (selectedDay === 'all') {
        dayCards.forEach(card => card.classList.remove('dimmed'));
      } else {
        dayCards.forEach(card => {
          const itemDay = card.getAttribute('data-day-item');
          if (itemDay === selectedDay) {
            card.classList.remove('dimmed');
            // Smoothly scroll into view if on mobile
            if (window.innerWidth <= 768) {
              card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else {
            card.classList.add('dimmed');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   5. ACTION BUTTONS: WHATSAPP SHARE, GOOGLE MAPS, ADD TO CALENDAR
   ========================================================================== */
function initActionButtons() {
  const whatsappBtn = document.getElementById('btn-whatsapp-share');
  const calendarBtn = document.getElementById('btn-add-calendar');

  // WhatsApp Share with rich devotional message
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentUrl = window.location.href;
      const message = 
`॥ श्री राधे कृष्णाय नमः ॥
॥ सप्रेम आमंत्रण पत्र ॥

श्रीमद् भागवत कथा ज्ञान यज्ञ महोत्सव
📅 दिनांक: 18 दिसंबर 2026 से 25 दिसंबर 2026
⏰ दैनिक समय: दोपहर 2:00 बजे से सायं 6:00 बजे तक (तत्पश्चात महाआरती)
📍 स्थल: श्री बांके बिहारी सत्संग धाम प्रांगण, वृन्दावन धाम

"आप सपरिवार सादर आमंत्रित हैं। आपका आगमन हमारे लिए सौभाग्य एवं हर्ष का विषय होगा।"

🌸 डिजिटल आमंत्रण पत्र देखें:
${currentUrl}

राधे-राधे! जय श्रीकृष्ण!`;

      const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(shareUrl, '_blank');
    });
  }

  // Calendar .ics generator for all 8 days
  if (calendarBtn) {
    calendarBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Shrimad Bhagwat Katha//Digital Invitation//HI',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:bhagwat-katha-20261218@vrindavan.org',
        'DTSTAMP:20261117T000000Z',
        'DTSTART;VALUE=DATE:20261218',
        'DTEND;VALUE=DATE:20261226',
        'SUMMARY:श्रीमद् भागवत कथा ज्ञान यज्ञ महोत्सव (वृन्दावन धाम)',
        'DESCRIPTION:पावन श्रीमद् भागवत कथा ज्ञान यज्ञ महोत्सव। समय: प्रतिदिन दोपहर 2:00 बजे से सायं 6:00 बजे तक। आप सपरिवार सादर आमंत्रित हैं।',
        'LOCATION:श्री बांके बिहारी सत्संग धाम प्रांगण, पावन ज्ञान यज्ञ मंडप, वृन्दावन धाम',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ];

      const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = downloadUrl;
      tempLink.setAttribute('download', 'Shrimad-Bhagwat-Katha-Vrindavan-2026.ics');
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(downloadUrl);
    });
  }
}
