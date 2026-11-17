/**
 * =========================================================================
 * 🎵 श्रीमद् भागवत कथा - पृष्ठभूमि संगीत विन्यास (MUSIC CONFIGURATION)
 * =========================================================================
 * 
 * यहाँ आप अपनी पसंद का भजन अथवा संगीत आसानी से बदल सकते हैं।
 * नया ऑडियो फाइल 'assets/music/' फोल्डर में रखें और नीचे 'audioFilePath' में 
 * उसका नाम दर्ज करें।
 */

const KATHA_MUSIC_CONFIG = {
  // संगीत फाइल का पथ (File path of your bhajan/audio)
  audioFilePath: "assets/music/bhagwat-bhajan.mp3",
  
  // भजन का शीर्षक एवं उप-शीर्षक (Title & Subtitle in Hindi)
  trackTitle: "श्री कृष्ण गोविन्द हरे मुरारे",
  trackSubtitle: "भगवान श्रीकृष्ण पावन संकीर्तन",
  
  // प्रारंभिक ध्वनि स्तर (Initial volume between 0.0 and 1.0)
  defaultVolume: 0.75,
  
  // क्या संगीत स्वतः लूप में चले (Loop seamlessly)
  loop: true
};

// Global export for script access
window.KATHA_MUSIC_CONFIG = KATHA_MUSIC_CONFIG;
