// test-panchanga.js
const swisseph = require('swisseph');
const moment = require('moment-timezone');

// Test date: 3 Jan 1978
const testDate = '1978-01-03';
const timezone = 'Asia/Kolkata';
const lat = 28.6139;
const lon = 77.2090;

console.log('=== Panchanga Calculation Test ===\n');
console.log('Test date:', testDate);
console.log('Timezone:', timezone);
console.log('Location:', lat, lon);

// Convert to Julian Day
const testMoment = moment.tz(testDate, timezone);
const testJD = swisseph.julday(
  testMoment.year(),
  testMoment.month() + 1,
  testMoment.date(),
  12, // Noon
  1 // gregflag: 1 = Gregorian calendar
);

console.log(`Julian Day: ${testJD.toFixed(6)}`);

// Test different Ayanamsa modes
console.log('\n=== Ayanamsa Modes ===');

// Mode 1: Lahiri (default)
swisseph.set_sid_mode(1, 0, 0);
const lahiriAyanamsa = swisseph.get_ayanamsa_ut(testJD);
console.log(`Lahiri Ayanamsa: ${lahiriAyanamsa.toFixed(2)}°`);

// Mode 5: Pushya Paksha
swisseph.set_sid_mode(5, 0, 0);
const deltaCancriResult = swisseph.fixstar_ut("Asellus Australis", testJD, swisseph.SEFLG_SWIEPH);
const pushyaPakshaAyanamsa = deltaCancriResult.longitude - 106;
console.log(`Pushya Paksha Ayanamsa: ${pushyaPakshaAyanamsa.toFixed(2)}°`);

// Test Sun and Moon positions
console.log('\n=== Sun and Moon Positions ===');
try {
  const sunResult = swisseph.calc_ut(testJD, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
  const moonResult = swisseph.calc_ut(testJD, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
  
  console.log(`Sun Tropical: ${sunResult.longitude.toFixed(2)}°`);
  console.log(`Moon Tropical: ${moonResult.longitude.toFixed(2)}°`);
  
  // Calculate sidereal positions
  const sunSidereal = ((sunResult.longitude - lahiriAyanamsa) % 360 + 360) % 360;
  const moonSidereal = ((moonResult.longitude - lahiriAyanamsa) % 360 + 360) % 360;
  
  console.log(`Sun Sidereal (Lahiri): ${sunSidereal.toFixed(2)}°`);
  console.log(`Moon Sidereal (Lahiri): ${moonSidereal.toFixed(2)}°`);
  
  // Calculate Tithi (lunar day)
  const tithiDiff = moonSidereal - sunSidereal;
  const tithi = Math.floor(((tithiDiff % 360) + 360) % 360 / 12) + 1;
  console.log(`Tithi: ${tithi}/30`);
  
  // Calculate Karana
  const karana = Math.floor(((tithiDiff % 360) + 360) % 360 / 6) + 1;
  console.log(`Karana: ${karana}/11`);
  
} catch (error) {
  console.log(`Position Error: ${error.message}`);
}

// Test houses calculation for Panchanga
console.log('\n=== Houses for Panchanga ===');
try {
  const houses = swisseph.houses(testJD, lat, lon, 'P');
  console.log(`Ascendant: ${houses.ascendant.toFixed(2)}°`);
  console.log(`MC: ${houses.mc.toFixed(2)}°`);
  
  // Calculate sidereal ascendant
  const ascSidereal = ((houses.ascendant - lahiriAyanamsa) % 360 + 360) % 360;
  console.log(`Ascendant Sidereal (Lahiri): ${ascSidereal.toFixed(2)}°`);
  
} catch (error) {
  console.log(`Houses Error: ${error.message}`);
}

console.log('\n=== Test Complete ==='); 