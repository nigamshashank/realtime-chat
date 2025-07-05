// test-today.js
const swisseph = require('swisseph');
const moment = require('moment-timezone');

// Today's date
const today = moment().tz('Asia/Kolkata');
const timezone = 'Asia/Kolkata';
const lat = 28.6139;
const lon = 77.2090;

console.log('=== Today\'s Astrological Data ===\n');
console.log('Date:', today.format('YYYY-MM-DD HH:mm:ss'));
console.log('Timezone:', timezone);
console.log('Location:', lat, lon);

// Convert to Julian Day
const todayJD = swisseph.julday(
  today.year(),
  today.month() + 1,
  today.date(),
  today.hour() + today.minute()/60 + today.second()/3600,
  1 // gregflag: 1 = Gregorian calendar
);

console.log(`Julian Day: ${todayJD.toFixed(6)}`);

// Test different Ayanamsa modes
console.log('\n=== Ayanamsa Modes ===');

// Mode 1: Lahiri (default)
swisseph.set_sid_mode(1, 0, 0);
const lahiriAyanamsa = swisseph.get_ayanamsa_ut(todayJD);
console.log(`Lahiri Ayanamsa: ${lahiriAyanamsa.toFixed(2)}°`);

// Mode 5: Pushya Paksha
swisseph.set_sid_mode(5, 0, 0);
const deltaCancriResult = swisseph.fixstar_ut("Asellus Australis", todayJD, swisseph.SEFLG_SWIEPH);
const pushyaPakshaAyanamsa = deltaCancriResult.longitude - 106;
console.log(`Pushya Paksha Ayanamsa: ${pushyaPakshaAyanamsa.toFixed(2)}°`);

// Test Sun and Moon positions
console.log('\n=== Sun and Moon Positions ===');
try {
  const sunResult = swisseph.calc_ut(todayJD, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
  const moonResult = swisseph.calc_ut(todayJD, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
  
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

// Test houses calculation
console.log('\n=== Houses ===');
try {
  const houses = swisseph.houses(todayJD, lat, lon, 'P');
  console.log(`Ascendant: ${houses.ascendant.toFixed(2)}°`);
  console.log(`MC: ${houses.mc.toFixed(2)}°`);
  
  // Calculate sidereal ascendant
  const ascSidereal = ((houses.ascendant - lahiriAyanamsa) % 360 + 360) % 360;
  console.log(`Ascendant Sidereal (Lahiri): ${ascSidereal.toFixed(2)}°`);
  
} catch (error) {
  console.log(`Houses Error: ${error.message}`);
}

// Test planet positions
console.log('\n=== Planet Positions ===');
const planets = [
  { name: 'Mercury', id: swisseph.SE_MERCURY },
  { name: 'Venus', id: swisseph.SE_VENUS },
  { name: 'Mars', id: swisseph.SE_MARS },
  { name: 'Jupiter', id: swisseph.SE_JUPITER },
  { name: 'Saturn', id: swisseph.SE_SATURN },
  { name: 'Rahu', id: swisseph.SE_MEAN_NODE }
];

planets.forEach(planet => {
  try {
    const result = swisseph.calc_ut(todayJD, planet.id, swisseph.SEFLG_SWIEPH);
    const siderealLongitude = ((result.longitude - lahiriAyanamsa) % 360 + 360) % 360;
    
    console.log(`${planet.name}: ${siderealLongitude.toFixed(2)}°`);
  } catch (error) {
    console.log(`${planet.name}: Error - ${error.message}`);
  }
});

console.log('\n=== Test Complete ==='); 