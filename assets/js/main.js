/**
 * =========================================================================
 * श्रीमद् भागवत कथा अमृत महोत्सव - मुख्य जावास्क्रिप्ट (Main Interactive Script)
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initMusicPlayer();
  initPetalCanvas();
  initScrollAnimations();
  initGalleryLightbox();
  initMobileNav();
  initActionButtons();
});

/* ==========================================================================
   1. BACKGROUND MUSIC PLAYER (resilient, configurable, interactive)
   ========================================================================== */
function initMusicPlayer() {
  const config = window.KATHA_MUSIC_CONFIG || {
    audioFilePath: 'assets/music/bhagwat-bhajan.mp3',
    fallbackFilePath: 'assets/music/bhagwat-bhajan.wav',
    trackTitle: 'श्रीकृष्ण मधुर बांसुरी एवं पावन भजन',
    defaultVolume: 0.65,
    loop: true
  };

  const musicBar = document.getElementById('floating-music-bar');
  const playBtn = document.getElementById('music-play-btn');
  const muteBtn = document.getElementById('music-mute-btn');
  const volumeSlider = document.getElementById('music-volume-slider');
  const musicStatus = document.getElementById('music-status');
  const musicTitle = document.getElementById('music-title');

  if (musicTitle) {
    musicTitle.textContent = config.trackTitle;
  }

  // Audio element setup
  const audio = new Audio();
  audio.preload = 'auto';
  audio.loop = config.loop !== false;
  audio.volume = config.defaultVolume || 0.75;
  if (volumeSlider) {
    volumeSlider.value = audio.volume;
  }

  // Load primary audio path
  audio.src = config.audioFilePath;
  let hasTriedFallback = false;

  audio.addEventListener('playing', () => {
    setPlayState(true);
  });

  audio.addEventListener('pause', () => {
    if (!synthActive) {
      setPlayState(false);
    }
  });

  audio.addEventListener('error', (e) => {
    console.warn('Audio tag notice:', e);
    if (!hasTriedFallback && config.fallbackFilePath) {
      hasTriedFallback = true;
      audio.src = config.fallbackFilePath;
      audio.load();
      if (isPlaying) {
        audio.play().catch(err => console.warn('Fallback error:', err));
      }
    }
  });

  let isPlaying = false;
  let synthActive = false;
  let synthEngine = null;

  // Web Audio API Indian Bansuri & Drone Synthesizer (Zero-dependency fallback)
  function createBansuriSynth() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(audio.volume * 0.45, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Tanpura Drones (D: 146.83 Hz, A: 220 Hz, D4: 293.66 Hz)
      const droneFreqs = [146.83, 220.0, 293.66];
      const droneGains = [];

      droneFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.08 / (idx + 1), ctx.currentTime);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        droneGains.push(g);
      });

      // Recognizable Krishna Bansuri Melody (Shri Krishna Govind Hare Murari & Achyutam Keshavam)
      const melodyFreqs = [
        293.66, 329.63, 369.99, 440.0, 440.0, // Shri Krishna Govind...
        493.88, 440.0, 369.99, 329.63, 293.66, // ...Hare Murari
        369.99, 440.0, 493.88, 587.33,         // Hey Nath Narayan...
        493.88, 440.0, 369.99, 329.63, 293.66, // ...Vasudeva
        587.33, 659.25, 587.33, 493.88, 440.0, // Radhe Radhe Govind...
        369.99, 329.63, 293.66                  // Gopal Radhe
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

        // Flute vibrato
        const vibrato = ctx.createOscillator();
        vibrato.frequency.setValueAtTime(5.5, ctx.currentTime);
        const vibratoGain = ctx.createGain();
        vibratoGain.gain.setValueAtTime(freq * 0.015, ctx.currentTime);
        vibrato.connect(noteOsc.frequency);
        vibrato.start();

        const noteGain = ctx.createGain();
        const now = ctx.currentTime;
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.25, now + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

        noteOsc.connect(noteGain);
        noteGain.connect(masterGain);

        noteOsc.start(now);
        noteOsc.stop(now + 2.5);
        vibrato.stop(now + 2.5);
      }

      function startSynth() {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        synthActive = true;
        playNextNote();
        fluteInterval = setInterval(playNextNote, 2600);
      }

      function stopSynth() {
        synthActive = false;
        if (fluteInterval) clearInterval(fluteInterval);
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        setTimeout(() => ctx.close().catch(() => {}), 200);
      }

      function setSynthVolume(vol) {
        masterGain.gain.setValueAtTime(vol * 0.45, ctx.currentTime);
      }

      return { start: startSynth, stop: stopSynth, setVolume: setSynthVolume };
    } catch (e) {
      console.warn('Web Audio synth not supported in this browser.', e);
      return null;
    }
  }

  function togglePlay() {
    if (!isPlaying) {
      // Start playback
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setPlayState(true);
        }).catch(() => {
          // Fallback to web audio synth if audio tag is blocked
          if (!synthEngine) {
            synthEngine = createBansuriSynth();
          }
          if (synthEngine) {
            synthEngine.start();
          }
          setPlayState(true);
        });
      } else {
        setPlayState(true);
      }
    } else {
      // Pause
      audio.pause();
      if (synthEngine) {
        synthEngine.stop();
        synthEngine = null;
      }
      setPlayState(false);
    }
  }

  function setPlayState(playing) {
    isPlaying = playing;
    if (playing) {
      if (musicBar) musicBar.classList.add('playing');
      if (playBtn) playBtn.innerHTML = '&#10074;&#10074;'; // Pause icon
      if (musicStatus) musicStatus.textContent = 'संगीत चालू है ♫';
    } else {
      if (musicBar) musicBar.classList.remove('playing');
      if (playBtn) playBtn.innerHTML = '&#9654;'; // Play icon
      if (musicStatus) musicStatus.textContent = 'संगीत बजाएं (Play)';
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', togglePlay);
  }

  // Mute / Unmute
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      audio.muted = !audio.muted;
      muteBtn.innerHTML = audio.muted ? '🔇' : '🔊';
      if (synthEngine) {
        synthEngine.setVolume(audio.muted ? 0 : audio.volume);
      }
    });
  }

  // Volume slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      audio.volume = vol;
      if (audio.muted && vol > 0) {
        audio.muted = false;
        if (muteBtn) muteBtn.innerHTML = '🔊';
      }
      if (synthEngine) {
        synthEngine.setVolume(vol);
      }
    });
  }
}

/* ==========================================================================
   2. FLOATING FLOWER PETALS (Golden Marigold & Rose Petals Shower)
   ========================================================================== */
function initPetalCanvas() {
  const canvas = document.getElementById('petal-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const TOTAL_PETALS = 38;
  let isPetalActive = true;

  // Petal Colors (Saffron marigold gold, royal rose pink, amber)
  const petalColors = [
    { fill: '#FFB300', stroke: '#E65100' }, // Marigold Golden Yellow
    { fill: '#FF7043', stroke: '#BF360C' }, // Saffron Orange
    { fill: '#F06292', stroke: '#AD1457' }, // Rose Pink
    { fill: '#FFD54F', stroke: '#F57F17' }, // Bright Gold
    { fill: '#E91E63', stroke: '#880E4F' }  // Deep Rose Red
  ];

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -30;
      this.size = Math.random() * 12 + 10;
      this.speedY = Math.random() * 1.5 + 0.8;
      this.speedX = (Math.random() - 0.5) * 1.2;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.04;
      this.swing = Math.random() * 2;
      this.swingSpeed = Math.random() * 0.03 + 0.01;
      this.swingPhase = Math.random() * Math.PI * 2;
      this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
      this.opacity = Math.random() * 0.5 + 0.45;
    }

    update() {
      this.y += this.speedY;
      this.swingPhase += this.swingSpeed;
      this.x += Math.sin(this.swingPhase) * this.swing + this.speedX;
      this.rotation += this.rotationSpeed;

      if (this.y > height + 40 || this.x < -40 || this.x > width + 40) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(1, 0.5 + 0.5 * Math.sin(this.swingPhase));
      ctx.globalAlpha = this.opacity;

      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size * 0.75, -this.size * 0.5, this.size * 0.85, this.size * 0.4, 0, this.size);
      ctx.bezierCurveTo(-this.size * 0.85, this.size * 0.4, -this.size * 0.75, -this.size * 0.5, 0, -this.size);
      ctx.closePath();

      ctx.fillStyle = this.color.fill;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = this.color.stroke;
      ctx.stroke();

      ctx.restore();
    }
  }

  for (let i = 0; i < TOTAL_PETALS; i++) {
    petals.push(new Petal());
  }

  function animate() {
    if (isPetalActive) {
      ctx.clearRect(0, 0, width, height);
      for (const p of petals) {
        p.update();
        p.draw();
      }
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // Petal shower toggle button
  const petalToggleBtn = document.getElementById('petal-toggle-btn');
  if (petalToggleBtn) {
    petalToggleBtn.addEventListener('click', () => {
      isPetalActive = !isPetalActive;
      if (!isPetalActive) {
        ctx.clearRect(0, 0, width, height);
        petalToggleBtn.innerHTML = '🌸 पुष्प वर्षा चालू करें';
      } else {
        petalToggleBtn.innerHTML = '🌸 पुष्प वर्षा विराम';
      }
    });
  }
}

/* ==========================================================================
   3. SCROLL ANIMATIONS & ACTIVE NAV
   ========================================================================== */
function initScrollAnimations() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // Header shadow on scroll
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Active link highlighting
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Intersection Observer for Reveal on Scroll
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.timeline-item, .gallery-card, .quote-card, .feature-box').forEach(el => {
    revealObserver.observe(el);
  });
}

/* ==========================================================================
   4. DEVOTIONAL GALLERY LIGHTBOX MODAL
   ========================================================================== */
function initGalleryLightbox() {
  const galleryData = [
    {
      title: "भगवान श्रीकृष्ण की मधुर बंशी वादन लीला",
      src: "assets/images/hero-krishna.jpg",
      desc: "पवित्र यमुना तट पर कदम्ब वृक्ष की शीतल छाया में भगवान श्रीकृष्ण की मनमोहिनी बंशी धुन से सम्पूर्ण ब्रजमंडल, गो-गोपियाँ एवं मयूर मुग्ध हो उठते हैं।"
    },
    {
      title: "श्री राधा-कृष्ण का दिव्य युगल दर्शन",
      src: "assets/images/radha-krishna.jpg",
      desc: "श्रीधाम वृन्दावन के पावन निकुंजों में लाडली श्रीराधा रानी एवं नंदनंदन श्रीकृष्ण का अगाध, अलौकिक एवं प्रेमामृतमय दिव्य दर्शन।"
    },
    {
      title: "गिरिराज गोवर्धन धारण लीला",
      src: "assets/images/govardhan-leela.jpg",
      desc: "इंद्र के घमंड का नाश करने एवं ब्रजवासियों तथा सुरभि गौवों की रक्षा हेतु भगवान श्रीकृष्ण ने कनिष्ठिका अंगुली पर विशाल गोवर्धन पर्वत धारण किया था।"
    },
    {
      title: "बालकृष्ण माखनचोरी एवं वात्सल्य लीला",
      src: "assets/images/bal-krishna.jpg",
      desc: "गोकुल में नटखट कान्हा की बाल लीलाएं, सखाओं संग माखन चुराना और माता यशोदा के वात्सल्य प्रेम का रसपूर्ण वर्णन।"
    },
    {
      title: "श्रीकृष्ण एवं सुदामा का पावन मिलन",
      src: "assets/images/krishna-sudama.jpg",
      desc: "द्वारिकाधीश प्रभु श्रीकृष्ण द्वारा अपने दीन-हीन दरिद्र बालसखा सुदामा को गले लगाना और अश्रुओं से चरण पखारना, निष्कपट मित्रता का सर्वोच्च उदाहरण है।"
    },
    {
      title: "परम पवित्र श्रीमद् भागवत महापुराण ग्रंथ",
      src: "assets/images/bhagwat-granth.jpg",
      desc: "वेदव्यास रचित अठारह पुराणों में मुकुटमणि श्रीमद् भागवत महापुराण, जो कलिकाल में जीवों के कल्याण एवं भगवद्-प्राप्ति का सर्वोत्तम साधन है।"
    },
    {
      title: "दीपमालिकाओं से सुसज्जित भव्य देवालय",
      src: "assets/images/temple-darshan.jpg",
      desc: "संध्या आरती के पावन समय सहस्रों दीपकों, पुष्पमालाओं एवं सुगंधित धूप से आलोकित पारंपरिक वैदिक मंदिर प्रांगण का दिव्य दर्शन।"
    },
    {
      title: "पावन मंगल कलश एवं वैदिक हवन कुंड",
      src: "assets/images/kalash-havan.jpg",
      desc: "श्रीमद् भागवत ज्ञान यज्ञ में वेदी पूजन, नवग्रह-पीठ, मंगल कलश स्थापना एवं पूर्णाहुति यज्ञ कुंड की पवित्र अग्नि की पावन झांकी।"
    }
  ];

  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalTitle = document.getElementById('lightbox-title');
  const modalDesc = document.getElementById('lightbox-desc');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!modal) return;

  let currentIndex = 0;

  function showImage(index) {
    if (index < 0) index = galleryData.length - 1;
    if (index >= galleryData.length) index = 0;
    currentIndex = index;

    const item = galleryData[currentIndex];
    modalImg.src = item.src;
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.desc;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-card').forEach((card, idx) => {
    card.addEventListener('click', () => {
      showImage(idx);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (prevBtn) prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}

/* ==========================================================================
   5. MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    toggleBtn.innerHTML = navMenu.classList.contains('open') ? '&#10005;' : '&#9776;';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggleBtn.innerHTML = '&#9776;';
    });
  });
}

/* ==========================================================================
   6. INVITATION SHARING & CALENDAR INTEGRATION
   ========================================================================== */
function initActionButtons() {
  const whatsappBtn = document.getElementById('btn-share-whatsapp');
  const calendarBtn = document.getElementById('btn-add-calendar');

  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const message = `॥ श्री राधे कृष्णाय नमः ॥\n\nसप्रेम आमंत्रण: श्रीमद् भागवत कथा ज्ञान यज्ञ\n\nदिनांक: 18 से 25 दिसंबर 2026\nस्थान: पावन सत्संग भवन प्रांगण, वृन्दावन धाम\n\n"श्रीमद् भागवत कथा श्रवण से जीवन में भक्ति, ज्ञान एवं आध्यात्मिक शांति का संचार होता है।"\n\nआप सभी सपरिवार सादर आमंत्रित हैं। कृपया पधारकर पुण्य लाभ प्राप्त करें। राधे-राधे!\n\nनिमंत्रण देखें: ${window.location.href}`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    });
  }

  if (calendarBtn) {
    calendarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Generate .ics iCalendar file for 18 Dec 2026 to 25 Dec 2026
      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Shrimad Bhagwat Katha//Invitation//HI',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:bhagwat-katha-20261218@invitation',
        'DTSTAMP:20261117T000000Z',
        'DTSTART;VALUE=DATE:20261218',
        'DTEND;VALUE=DATE:20261226',
        'SUMMARY:श्रीमद् भागवत कथा ज्ञान यज्ञ (18 से 25 दिसंबर)',
        'DESCRIPTION:श्रीमद् भागवत कथा कार्यक्रम एवं दैनिक प्रसंग। आप सपरिवार सादर आमंत्रित हैं।',
        'LOCATION:सत्संग भवन, वृन्दावन धाम',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Shrimad-Bhagwat-Katha-2026.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}
